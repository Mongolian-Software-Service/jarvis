import "server-only";
import { headers } from "next/headers";
import { destinationAfterSignIn, type Locale } from "@jarvis/core";
import { createServerSupabase } from "@/lib/supabase/server";

/**
 * What every door into an account shares: where the request came from, and
 * where the new session goes.
 *
 * Four callers now — the password form, the sign-up form, `/auth/confirm` and
 * `/auth/google` — and the last two are route handlers, which cannot import
 * from a `"use server"` file without turning these into public actions. So
 * they live here, server-only, and the actions import them like everybody else.
 */

/**
 * Where this request actually came from.
 *
 * Not `NEXT_PUBLIC_APP_URL`. That is a configured guess, and a guess that is
 * wrong sends somebody who just finished signing in with Google to a dead port
 * — which is exactly what happened: the variable said 3000 and the dev server
 * was on 3001, so Supabase handed the session to a page that does not exist.
 *
 * The host header is where the person demonstrably is. A forged one cannot
 * redirect anywhere interesting: Supabase refuses any `redirect_to` that is not
 * on the project's allow list, and Google refuses any `redirect_uri` that is
 * not on the OAuth client's, so those lists stay the gate.
 */
export async function requestOrigin(): Promise<string> {
  const list = await headers();
  const host = list.get("x-forwarded-host") ?? list.get("host");
  if (host) {
    const forwarded = list.get("x-forwarded-proto");
    const protocol =
      forwarded ?? (/^(localhost|127\.0\.0\.1|\[::1\])(:|$)/.test(host) ? "http" : "https");
    return `${protocol}://${host}`;
  }
  return (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

/**
 * The signed-in user's role, read straight after a session appears.
 *
 * `getViewer()` is cached per request and may already hold the "nobody is
 * signed in" answer from earlier in this same request, so this asks the table
 * directly. It is read from `profiles` rather than the token because a role
 * granted a moment ago is in the table straight away and in the JWT only after
 * it refreshes (§6.6).
 */
export async function roleOfCurrentUser(): Promise<"student" | "admin" | null> {
  const supabase = createServerSupabase();
  const { data } = await supabase.auth.getClaims();
  const id = data?.claims?.sub;
  if (!id) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", id)
    .maybeSingle();
  return profile?.role ?? "student";
}

/**
 * Where the new session goes: `destinationAfterSignIn` between the role and
 * whatever `?next=` asked for. A session that is somehow not there yet is
 * treated as a student — the safe direction to be wrong in.
 */
export async function landingAfterSignIn(locale: Locale, asked: string | null): Promise<string> {
  return destinationAfterSignIn(locale, (await roleOfCurrentUser()) ?? "student", asked);
}
