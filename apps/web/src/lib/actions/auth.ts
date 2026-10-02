"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  PROFILE_LATER_COOKIE,
  fieldErrors,
  homePath,
  destinationAfterSignIn,
  profileSchema,
  signInSchema,
  signUpSchema,
  strings,
} from "@jarvis/core";
import { cookies } from "next/headers";
import { createServerSupabase, getUserId } from "@/lib/supabase/server";
import { getRequestLocale } from "@/lib/locale";
import { requestOrigin, roleOfCurrentUser } from "@/lib/auth/session";
import { fail, type ActionResult } from "./guard";

/**
 * Sign-in, sign-up and the account form.
 *
 * These are the only actions whose messages are read by somebody who may have
 * chosen English, so the schemas are built per request from the string table
 * rather than carrying Mongolian literals like the admin's do.
 */

export async function signIn(_prev: unknown, form: FormData): Promise<ActionResult> {
  const locale = await getRequestLocale();
  const t = strings(locale);

  const parsed = signInSchema(t.auth.validation).safeParse({
    email: form.get("email"),
    password: form.get("password"),
  });
  if (!parsed.success) return fail(t.auth.errors.unknown, fieldErrors(parsed.error));

  const supabase = createServerSupabase();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    // Supabase says "Invalid login credentials" for a wrong password and for an
    // address that has never signed up — deliberately, so the form cannot be
    // used to find out which addresses exist. The copy keeps that property.
    return fail(t.auth.errors.invalidCredentials);
  }

  // Where they asked to go, or where their role belongs — and never the
  // marketing page they may have signed in from. One rule, in `@jarvis/core`,
  // because `/auth/confirm` and the sign-up form answer the same question.
  redirect(destinationAfterSignIn(locale, await roleOfCurrentUser(), String(form.get("next") ?? "")));
}

export async function signUp(_prev: unknown, form: FormData): Promise<ActionResult<{ confirm: boolean }>> {
  const locale = await getRequestLocale();
  const t = strings(locale);

  const parsed = signUpSchema(t.auth.validation).safeParse({
    last_name: form.get("last_name"),
    first_name: form.get("first_name"),
    email: form.get("email"),
    phone: form.get("phone"),
    password: form.get("password"),
  });
  if (!parsed.success) return fail(t.auth.errors.unknown, fieldErrors(parsed.error));

  const supabase = createServerSupabase();
  // Same reasoning as the Google redirect: the link has to come back to where
  // the person actually is, not to where a variable says they should be.
  const origin = await requestOrigin();

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      /*
       * The name goes into user metadata because the profiles trigger reads it
       * there when the account is created. The **role** never travels this way:
       * user metadata is writable by the account it belongs to, so a role taken
       * from it would be a role anybody could award themselves.
       *
       * The phone does not travel this way either, for a duller reason: the
       * column has a format constraint, the trigger runs as its definer, and a
       * hand-edited metadata field would turn a bad number into a failed
       * sign-up. It is written below, through the policy, once there is a
       * session to write it with.
       */
      data: {
        first_name: parsed.data.first_name,
        last_name: parsed.data.last_name,
        full_name: `${parsed.data.last_name} ${parsed.data.first_name}`,
      },
      // Language only, for the same reason as the Google redirect: the landing
      // is decided from the role once there is a session to read it from.
      emailRedirectTo: `${origin}/auth/confirm?locale=${locale}`,
    },
  });

  if (error) {
    const message = error.message.toLowerCase();
    if (message.includes("already")) return fail(t.auth.errors.emailTaken);
    if (message.includes("password")) return fail(t.auth.errors.weakPassword);
    return fail(t.auth.errors.unknown);
  }

  // With email confirmation on, Supabase returns a user and no session: the
  // account exists but cannot be used until the link is followed — and until
  // then there is no session to write the phone through.
  if (data.session && data.user) {
    await supabase.from("profiles").update({ phone: parsed.data.phone }).eq("id", data.user.id);
  }

  const confirm = !data.session;
  /*
   * Straight into their own lessons — they just signed up to study — unless
   * they were on their way somewhere when they were asked to make an account.
   *
   * The role is **read**, not assumed. Almost every sign-up is a student, and
   * for them this is one wasted query; the exception is the owner, whose
   * address is on `admin_emails` and whom `handle_new_user()` has already made
   * an admin by the time this line runs (§5). Hard-coding "student" here put
   * the one account that runs the school on a student dashboard and made the
   * allowlist look broken — which is exactly the failure it exists to prevent.
   * `/auth/confirm` has always read it; this is the door that did not.
   */
  if (!confirm) {
    redirect(destinationAfterSignIn(locale, await roleOfCurrentUser(), String(form.get("next") ?? "")));
  }
  return { ok: true, data: { confirm } };
}

export async function signOut(): Promise<void> {
  const locale = await getRequestLocale();
  const supabase = createServerSupabase();
  await supabase.auth.signOut();
  redirect(homePath(locale));
}

/**
 * «Дараа бөглөнө» — a day's quiet from the completion dialog.
 *
 * A cookie rather than a column: it is a preference about this browser for the
 * next day, not a fact about the person, and a row that says «asked to be left
 * alone» would outlive the reason for it.
 */
export async function postponeProfile(): Promise<void> {
  const jar = await cookies();
  jar.set(PROFILE_LATER_COOKIE, "1", {
    path: "/",
    maxAge: 60 * 60 * 24,
    sameSite: "lax",
  });
}

export async function updateProfile(_prev: unknown, form: FormData): Promise<ActionResult> {
  const locale = await getRequestLocale();
  const t = strings(locale);

  const userId = await getUserId();
  if (!userId) return fail(t.auth.errors.signedOut);

  const parsed = profileSchema(t.auth.validation).safeParse({
    last_name: form.get("last_name"),
    first_name: form.get("first_name"),
    phone: form.get("phone"),
  });
  if (!parsed.success) return fail(t.auth.errors.unknown, fieldErrors(parsed.error));

  const supabase = createServerSupabase();
  const { error } = await supabase
    .from("profiles")
    .update({
      last_name: parsed.data.last_name,
      first_name: parsed.data.first_name,
      phone: parsed.data.phone,
      // Kept in step so the admin list and anything else still reading it agree
      // with the two fields people actually edit.
      full_name: `${parsed.data.last_name} ${parsed.data.first_name}`,
    })
    .eq("id", userId);

  if (error) return fail(t.auth.errors.unknown);

  // Nothing left to postpone.
  (await cookies()).delete(PROFILE_LATER_COOKIE);

  revalidatePath(`/${locale}`, "layout");
  return { ok: true };
}
