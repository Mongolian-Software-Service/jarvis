import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * The one place a refreshed session is written back to the browser.
 *
 * Server Components cannot set cookies, so `createServerSupabase()` throws its
 * refreshed token away (see the comment there). The proxy can write, and runs
 * in front of every matched request — so the refresh happens here, on a
 * response already on its way out, and every render downstream reads a token
 * that is good for the whole request.
 *
 * Returns the response *and* the verified user id, because the caller needs
 * both and asking twice would verify the same token twice.
 */
export async function updateSession(
  request: NextRequest,
): Promise<{ response: NextResponse; userId: string | null }> {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  // A checkout with no .env.local still has to serve the marketing pages.
  if (!url || !key) return { response, userId: null };

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(list) {
        // Onto the request first, so anything reading cookies later in this
        // same pass sees the new value rather than the one that just expired.
        for (const { name, value } of list) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of list) response.cookies.set(name, value, options);
      },
    },
  });

  // Do not remove, and do not put code between creating the client and this
  // call: this is what triggers the refresh. Without it a session expires
  // mid-visit and the student is signed out with no warning.
  const { data, error } = await supabase.auth.getClaims();
  const userId = error ? null : (data?.claims?.sub ?? null);

  return { response, userId };
}
