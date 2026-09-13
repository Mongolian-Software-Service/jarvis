import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, destinationAfterSignIn, signInPath, toLocale } from "@jarvis/core";
import { createServerSupabase } from "@/lib/supabase/server";

/**
 * Where every way in comes back to.
 *
 * Three arrive here and all three end the same way — with a session:
 *
 *   - Google, and any other OAuth provider: a PKCE `code` to exchange.
 *   - The email confirmation link: a `token_hash` and a `type`.
 *   - A password reset: the same pair, with a different `type`.
 *
 * Then the question is where to put the person. If they asked for somewhere
 * specific — "sign in to buy this course" — that is where they go. Otherwise
 * the answer comes from their role: the team to the console, everybody else to
 * their own lessons. Nobody is dropped back on the marketing page they came
 * through; they did not sign in to read it again.
 */
export async function GET(request: NextRequest): Promise<Response> {
  const { searchParams, origin } = request.nextUrl;
  const locale = toLocale(searchParams.get("locale") ?? DEFAULT_LOCALE);

  const asked = searchParams.get("next");
  const supabase = createServerSupabase();

  const code = searchParams.get("code");
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${await landing(locale, asked)}`);
  }

  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as "signup" | "email" | "recovery" | "email_change",
      token_hash: tokenHash,
    });
    if (!error) return NextResponse.redirect(`${origin}${await landing(locale, asked)}`);
  }

  // A link that was already used, or has expired. The sign-in form is where
  // somebody in that position can actually get somewhere.
  return NextResponse.redirect(`${origin}${signInPath(locale)}?error=confirm`);
}

/**
 * Where the new session goes.
 *
 * The role is read from `profiles` rather than from the token: a role granted a
 * moment ago is in the table straight away and in the JWT only after it
 * refreshes. A profile that is somehow missing is treated as a student — the
 * safe direction to be wrong in.
 *
 * `destinationAfterSignIn` then decides between that and whatever `?next=`
 * asked for, refusing an off-site URL and refusing the marketing page.
 */
async function landing(
  locale: ReturnType<typeof toLocale>,
  asked: string | null,
): Promise<string> {
  const supabase = createServerSupabase();
  const { data } = await supabase.auth.getClaims();
  const id = data?.claims?.sub;
  if (!id) return destinationAfterSignIn(locale, "student", asked);

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", id)
    .maybeSingle();

  return destinationAfterSignIn(locale, profile?.role ?? "student", asked);
}
