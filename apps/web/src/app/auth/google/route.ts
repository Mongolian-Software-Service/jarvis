import { timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, signInPath } from "@jarvis/core";
import { createServerSupabase } from "@/lib/supabase/server";
import { landingAfterSignIn } from "@/lib/auth/session";
import {
  GOOGLE_CALLBACK_PATH,
  GOOGLE_COOKIE,
  exchangeGoogleCode,
  readGooglePending,
} from "@/lib/auth/google";

/**
 * Where Google sends somebody back to, on this site (`lib/auth/google.ts`).
 *
 * In order, and each step is a reason to stop:
 *
 *   1. The cookie from `signInWithGoogle` is there, and its `state` matches
 *      the one Google echoed — so this is the round trip this browser began,
 *      not a link somebody else crafted to log it into their account.
 *   2. Google's code trades for an ID token, server to server.
 *   3. Supabase accepts the token and its nonce, and writes the session.
 *
 * Anything that fails lands on the sign-in page with `?error=oauth`, which
 * already says "Google sign-in did not finish, try again". Pressing «Болих» on
 * Google's own screen arrives here as `?error=access_denied` and takes the
 * same road. The cookie is cleared either way: it is good for one trip.
 */
export async function GET(request: NextRequest): Promise<Response> {
  const { searchParams, origin } = request.nextUrl;
  const jar = await cookies();
  const pending = readGooglePending(jar.get(GOOGLE_COOKIE)?.value);
  jar.delete({ name: GOOGLE_COOKIE, path: GOOGLE_CALLBACK_PATH });

  const locale = pending?.locale ?? DEFAULT_LOCALE;
  // Back to the origin the trip began on, which Google has just vouched for —
  // not whatever this request's Host header says.
  const home = pending ? new URL(pending.redirectUri).origin : origin;
  const failed = () => NextResponse.redirect(`${home}${signInPath(locale)}?error=oauth`);

  const code = searchParams.get("code");
  if (!pending || !code || !sameState(searchParams.get("state"), pending.state)) return failed();

  const idToken = await exchangeGoogleCode(code, pending);
  if (!idToken) return failed();

  const supabase = createServerSupabase();
  const { error } = await supabase.auth.signInWithIdToken({
    provider: "google",
    token: idToken,
    nonce: pending.nonce,
  });
  if (error) {
    console.error("[auth] google id token was refused", error.message);
    return failed();
  }

  return NextResponse.redirect(`${home}${await landingAfterSignIn(locale, pending.next)}`);
}

/** The echoed `state` against ours, in constant time. */
function sameState(echoed: string | null, ours: string): boolean {
  if (!echoed) return false;
  const a = Buffer.from(echoed);
  const b = Buffer.from(ours);
  return a.length === b.length && timingSafeEqual(a, b);
}
