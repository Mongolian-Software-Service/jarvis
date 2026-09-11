"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE,
  fieldErrors,
  homePath,
  profileSchema,
  signInSchema,
  signUpSchema,
  strings,
  toLocale,
} from "@jarvis/core";
import { cookies } from "next/headers";
import { createServerSupabase, getUserId } from "@/lib/supabase/server";
import { getRequestLocale } from "@/lib/locale";
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

  const next = String(form.get("next") ?? "");
  redirect(next.startsWith("/") ? next : homePath(locale));
}

export async function signUp(_prev: unknown, form: FormData): Promise<ActionResult<{ confirm: boolean }>> {
  const locale = await getRequestLocale();
  const t = strings(locale);

  const parsed = signUpSchema(t.auth.validation).safeParse({
    full_name: form.get("full_name"),
    email: form.get("email"),
    password: form.get("password"),
  });
  if (!parsed.success) return fail(t.auth.errors.unknown, fieldErrors(parsed.error));

  const supabase = createServerSupabase();
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      /*
       * `full_name` goes into user metadata because the profiles trigger reads
       * it there when the account is created. The **role** never travels this
       * way: user metadata is writable by the account it belongs to, so a role
       * taken from it would be a role anybody could award themselves.
       */
      data: { full_name: parsed.data.full_name },
      emailRedirectTo: `${origin.replace(/\/$/, "")}/auth/confirm?next=${encodeURIComponent(homePath(locale))}`,
    },
  });

  if (error) {
    const message = error.message.toLowerCase();
    if (message.includes("already")) return fail(t.auth.errors.emailTaken);
    if (message.includes("password")) return fail(t.auth.errors.weakPassword);
    return fail(t.auth.errors.unknown);
  }

  // With email confirmation on, Supabase returns a user and no session: the
  // account exists but cannot be used until the link is followed.
  const confirm = !data.session;
  if (!confirm) redirect(homePath(locale));
  return { ok: true, data: { confirm } };
}

export async function signOut(): Promise<void> {
  const locale = await getRequestLocale();
  const supabase = createServerSupabase();
  await supabase.auth.signOut();
  redirect(homePath(locale));
}

export async function updateProfile(_prev: unknown, form: FormData): Promise<ActionResult> {
  const locale = await getRequestLocale();
  const t = strings(locale);

  const userId = await getUserId();
  if (!userId) return fail(t.auth.errors.signedOut);

  const parsed = profileSchema(t.auth.validation).safeParse({
    full_name: form.get("full_name"),
    locale: form.get("locale"),
  });
  if (!parsed.success) return fail(t.auth.errors.unknown, fieldErrors(parsed.error));

  const supabase = createServerSupabase();
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: parsed.data.full_name, locale: parsed.data.locale })
    .eq("id", userId);

  if (error) return fail(t.auth.errors.unknown);

  // The chosen language is also what a bare URL resolves to on the next visit.
  const jar = await cookies();
  jar.set(LOCALE_COOKIE, parsed.data.locale, {
    path: "/",
    maxAge: LOCALE_COOKIE_MAX_AGE,
    sameSite: "lax",
  });

  revalidatePath(`/${toLocale(parsed.data.locale) || DEFAULT_LOCALE}`, "layout");
  return { ok: true };
}
