import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE } from "@jarvis/core";
import { createServerSupabase } from "@/lib/supabase/server";

/**
 * Where the email confirmation link lands.
 *
 * Supabase sends a `token_hash` and a `type`; exchanging them is what turns a
 * confirmed address into a session. The newer PKCE flow sends `code` instead,
 * so both are handled — which one arrives depends on project settings nobody
 * should have to remember when reading this file.
 */
export async function GET(request: NextRequest): Promise<Response> {
  const { searchParams, origin } = request.nextUrl;
  const next = searchParams.get("next") ?? `/${DEFAULT_LOCALE}`;
  const safeNext = next.startsWith("/") ? next : `/${DEFAULT_LOCALE}`;

  const supabase = createServerSupabase();

  const code = searchParams.get("code");
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${safeNext}`);
  }

  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as "signup" | "email" | "recovery" | "email_change",
      token_hash: tokenHash,
    });
    if (!error) return NextResponse.redirect(`${origin}${safeNext}`);
  }

  // A link that was already used, or has expired. The sign-in form is where
  // somebody in that position can actually get somewhere.
  return NextResponse.redirect(`${origin}/${DEFAULT_LOCALE}/sign-in?error=confirm`);
}
