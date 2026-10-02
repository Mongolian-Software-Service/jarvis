"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { safeNextPath, signInPath } from "@jarvis/core";
import { createServerSupabase } from "@/lib/supabase/server";
import { getRequestLocale } from "@/lib/locale";
import { requestOrigin } from "@/lib/auth/session";
import {
  GOOGLE_CALLBACK_PATH,
  GOOGLE_COOKIE,
  GOOGLE_COOKIE_MAX_AGE,
  googleDirect,
  startGoogle,
} from "@/lib/auth/google";

/**
 * Start the Google sign-in.
 *
 * One button does both jobs: an address Supabase has not seen becomes an
 * account, and one it has becomes a session. That is why the copy says
 * "continue with" rather than "sign up with" — the person pressing it does not
 * know or care which of the two they are doing.
 *
 * Two routes to the same session. Where `googleDirect()` allows it, Google
 * returns to `/auth/google` on this site, so its account chooser names
 * tsstark-academy.com (`lib/auth/google.ts` says why). Anywhere else — a
 * preview deployment, or an environment without the Google keys — it falls
 * back to Supabase's redirect through `/auth/confirm`, which works unchanged.
 *
 * `redirect()` throws to unwind, so nothing here is wrapped in a try/catch —
 * and the URL it throws to is Google's, which Next allows for an absolute
 * destination from a server action.
 */
export async function signInWithGoogle(form: FormData): Promise<void> {
  const locale = await getRequestLocale();

  // Only a path on this site — the same rule `destinationAfterSignIn` applies
  // at the other end, from the same function, so the two cannot drift.
  const next = safeNextPath(String(form.get("next") ?? ""));

  const origin = await requestOrigin();

  if (googleDirect(origin)) {
    const { url, cookie } = startGoogle(origin, locale, next);
    (await cookies()).set(GOOGLE_COOKIE, cookie, {
      httpOnly: true,
      // Lax is what lets it ride along on Google's top-level redirect back.
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production" || origin.startsWith("https://"),
      path: GOOGLE_CALLBACK_PATH,
      maxAge: GOOGLE_COOKIE_MAX_AGE,
    });
    redirect(url);
  }

  /*
   * The language always travels; a destination only when one was asked for.
   * Without a `next`, `/auth/confirm` decides where to land from the role it
   * finds — defaulting to the home page here would take that away from it.
   */
  const params = new URLSearchParams({ locale });
  if (next) params.set("next", next);

  const supabase = createServerSupabase();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${origin}/auth/confirm?${params.toString()}` },
  });

  if (error || !data.url) {
    console.error("[auth] google sign-in could not start", error?.message);
    redirect(`${signInPath(locale)}?error=oauth`);
  }

  redirect(data.url);
}
