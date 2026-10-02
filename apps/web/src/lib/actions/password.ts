"use server";

import { fieldErrors, passwordSchema, strings } from "@jarvis/core";
import { createServerSupabase } from "@/lib/supabase/server";
import { getRequestLocale } from "@/lib/locale";
import { getSignIn } from "@/lib/queries/viewer";
import { fail, type ActionResult } from "./guard";

/**
 * «Нууц үг солих», from «Хувийн мэдээлэл».
 *
 * The current password is checked by **signing in with it**. Supabase has no
 * "verify this password" call, and a sign-in that succeeds is exactly that
 * check. It re-issues this person's own session, which is harmless, and it
 * counts against the auth server's sign-in rate limit — which is the point:
 * this form cannot be used to guess a password faster than the sign-in page.
 *
 * What the check is *not* is a wall. The session lives in a cookie the browser
 * can read, and whoever holds it can ask Supabase to change the password
 * directly. Asking for the current one protects against a laptop left open on
 * this page; the stronger version is Supabase's "secure password change"
 * (reauthentication by email), which this project does not turn on.
 *
 * No `revalidatePath`: nothing on any page shows a password.
 */
export async function changePassword(_prev: unknown, form: FormData): Promise<ActionResult> {
  const locale = await getRequestLocale();
  const t = strings(locale);
  const copy = t.auth.password;

  const account = await getSignIn();
  if (!account) return fail(t.auth.errors.signedOut);
  // The form is never drawn for an account without a password; this is the
  // same answer for a request that did not come from the form.
  if (!account.hasPassword) return fail(copy.googleOnly);

  const parsed = passwordSchema(copy.validation).safeParse({
    current: String(form.get("current") ?? ""),
    next: String(form.get("next") ?? ""),
    confirm: String(form.get("confirm") ?? ""),
  });
  if (!parsed.success) return fail(copy.failed, fieldErrors(parsed.error));

  const supabase = createServerSupabase();
  const check = await supabase.auth.signInWithPassword({
    email: account.email,
    password: parsed.data.current,
  });
  if (check.error) {
    // Only a wrong password is called one. A rate limit or an outage reaching
    // the screen as "your password is wrong" sends somebody to reset a
    // password that was right.
    return check.error.code === "invalid_credentials"
      ? fail(copy.wrongCurrent, { current: copy.wrongCurrent })
      : fail(copy.failed);
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.next });
  if (error) {
    if (error.code === "same_password") return fail(copy.validation.same, { next: copy.validation.same });
    if (error.code === "weak_password") {
      return fail(t.auth.errors.weakPassword, { next: t.auth.errors.weakPassword });
    }
    return fail(copy.failed);
  }

  return { ok: true };
}
