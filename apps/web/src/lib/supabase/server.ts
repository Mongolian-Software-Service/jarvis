import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@jarvis/types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

/**
 * The client bound to the signed-in user, so Postgres RLS runs as them.
 *
 * This is the default for every read and write from server code. The session
 * lives in cookies: Supabase Auth issues it, `@supabase/ssr` reads it off the
 * request, and `proxy.ts` refreshes it somewhere it is allowed to write.
 */
export function createServerSupabase() {
  return createServerClient<Database>(url, publishableKey, {
    cookies: {
      async getAll() {
        return (await cookies()).getAll();
      },
      async setAll(list) {
        try {
          const jar = await cookies();
          for (const { name, value, options } of list) jar.set(name, value, options);
        } catch {
          /*
           * A Server Component cannot write cookies, and this is where a
           * refreshed session would be handed back. Swallowed on purpose: the
           * proxy runs in front of every matched request and does the same
           * refresh where it is allowed to write, so the new token still
           * reaches the browser. Letting this throw would take down every page
           * that happens to render while a token is near expiry.
           */
        }
      },
    },
  });
}

/**
 * The service client. SERVER ONLY — it bypasses RLS completely.
 *
 * One legitimate caller in production: the Bonum webhook, which has no session
 * and has to settle an invoice on behalf of a buyer who is not making the
 * request.
 *
 * One more that cannot reach production: `/api/checkout` settles its own
 * invoice in mock mode, behind `isMockMode()` — `NODE_ENV !== "production"`
 * and `BONUM_MOCK === "1"` together. Anything else that reaches for this is a
 * bug, including "the type checker was easier this way".
 */
export function createServiceSupabase() {
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!secret) {
    throw new Error("SUPABASE_SECRET_KEY is not set — required for service-role operations.");
  }
  return createClient<Database>(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/*
 * There was a second way in here: an `Authorization: Bearer` header was read off
 * the request and preferred over the cookie, so `apps/mobile` — which has no
 * cookie jar — could call these API routes with its own session.
 *
 * That app is gone (CLAUDE.md §9) and the header went with it. Nothing on this
 * site sends one: the two API routes are `/api/checkout`, called from the
 * browser with cookies, and the Bonum webhook, which carries an HMAC and no
 * session at all. Leaving it would have kept a second accepted credential
 * channel open for no caller — and an auth path nobody exercises is an auth
 * path nobody notices going wrong.
 */

/**
 * The signed-in user's id, or null.
 *
 * **Verified, not decoded.** `getClaims` checks the token's signature against
 * the project's JWKS in this process — no round trip — and the cookie is
 * attacker-controlled input: a `sub` read out of it without that check is an
 * authorisation bypass, not a shortcut. Cached per request, because layouts,
 * guards and actions all ask and the answer cannot change mid-render.
 */
/*
 * Nothing here catches. That is deliberate, and it took a bug to learn.
 *
 * Reading cookies or headers during a prerender throws a *signal* — Next's way
 * of being told the route is dynamic. A `try/catch` around it swallows the
 * signal, the route is prerendered as if nobody were signed in, and every
 * visitor is then served one build's worth of "you have no courses" from the
 * CDN. Letting it propagate is what marks the page dynamic.
 */
export const getUserId = cache(async (): Promise<string | null> => {
  if (!url || !publishableKey) return null;
  const { data, error } = await createServerSupabase().auth.getClaims();
  if (error || !data?.claims?.sub) return null;
  return data.claims.sub;
});

/** The signed-in user's email, from the same verified claims. */
export const getUserEmail = cache(async (): Promise<string | null> => {
  if (!url || !publishableKey) return null;
  const { data, error } = await createServerSupabase().auth.getClaims();
  if (error) return null;
  const email = data?.claims?.email;
  return typeof email === "string" && email ? email.toLowerCase() : null;
});

/** Is Supabase configured at all? A fresh checkout with no .env.local is not. */
export function supabaseConfigured(): boolean {
  return Boolean(url && publishableKey);
}
