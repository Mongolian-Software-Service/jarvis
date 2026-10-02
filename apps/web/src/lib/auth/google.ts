import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { toLocale, type Locale } from "@jarvis/core";

/**
 * Google sign-in on our own domain.
 *
 * Through Supabase's OAuth redirect, Google's account chooser said «to
 * continue to dhdrcjhrznkgdizkuolo.supabase.co»: Google names the domain the
 * sign-in returns to, and that domain was Supabase's. Supabase can only change
 * it with a paid custom domain. So the redirect half is done here instead —
 * Google returns to `/auth/google` on this site and the chooser names
 * tsstark-academy.com — and Supabase is handed the result as an ID token
 * (`signInWithIdToken`), which is a door it documents for exactly this.
 *
 * Supabase still verifies that token: signature, audience, issuer and nonce.
 * Nothing here decides who somebody is; it only carries Google's answer to the
 * place that does.
 *
 * `GOOGLE_CLIENT_SECRET` is read in this file and nowhere else, and the file
 * is `server-only` — the same rule as the Supabase secret key (§2).
 */

const AUTHORIZE = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN = "https://oauth2.googleapis.com/token";

export const GOOGLE_CALLBACK_PATH = "/auth/google";
/** The round trip's state. HttpOnly, ten minutes, and only sent to the callback. */
export const GOOGLE_COOKIE = "tsa-google";
export const GOOGLE_COOKIE_MAX_AGE = 600;

const clientId = process.env.GOOGLE_CLIENT_ID ?? "";
const clientSecret = process.env.GOOGLE_CLIENT_SECRET ?? "";

/**
 * Whether this origin may use the direct flow.
 *
 * Both keys set, **and** an origin Google will accept: the production address
 * or a local dev server. A Vercel preview has its own hostname that is not on
 * the OAuth client's list, and sending Google there would end on its
 * `redirect_uri_mismatch` page — so a preview keeps the Supabase redirect,
 * which works anywhere on Supabase's allow list.
 */
export function googleDirect(origin: string): boolean {
  if (!clientId || !clientSecret) return false;
  const production = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");
  if (origin === production) return true;
  // `requestOrigin()` comes from the Host header. In production nobody's
  // browser sends `localhost`, so a request that says it does is not a person.
  return process.env.NODE_ENV !== "production" && /^http:\/\/localhost(:\d+)?$/.test(origin);
}

// Half a configuration falls back silently, which reads as "the change did
// nothing". Said once, at start-up, where whoever set one of them will look.
if (Boolean(clientId) !== Boolean(clientSecret)) {
  console.warn("[auth] GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set together");
}

/** What has to survive the trip to Google and back. */
export type GooglePending = {
  state: string;
  /** The raw nonce. Google gets its SHA-256; Supabase gets this and compares. */
  nonce: string;
  /** PKCE: the token exchange proves it is the same party that started. */
  verifier: string;
  /** Sent again on the exchange, which Google requires to match exactly. */
  redirectUri: string;
  locale: Locale;
  next: string | null;
};

const token = (bytes: number) => randomBytes(bytes).toString("base64url");
const sha256 = (value: string) => createHash("sha256").update(value).digest();

/** The address to send the browser to, and the cookie to set before it goes. */
export function startGoogle(
  origin: string,
  locale: Locale,
  next: string | null,
): { url: string; cookie: string } {
  const pending: GooglePending = {
    state: token(24),
    nonce: token(24),
    verifier: token(48),
    redirectUri: `${origin}${GOOGLE_CALLBACK_PATH}`,
    locale,
    next,
  };

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: pending.redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state: pending.state,
    // Hex, because that is what Supabase hashes the raw nonce into to compare.
    nonce: sha256(pending.nonce).toString("hex"),
    code_challenge: sha256(pending.verifier).toString("base64url"),
    code_challenge_method: "S256",
  });

  return {
    url: `${AUTHORIZE}?${params.toString()}`,
    cookie: Buffer.from(JSON.stringify(pending)).toString("base64url"),
  };
}

/** The cookie back, or null for anything that is not one we wrote. */
export function readGooglePending(cookie: string | undefined): GooglePending | null {
  if (!cookie) return null;
  try {
    const value = JSON.parse(Buffer.from(cookie, "base64url").toString("utf8")) as GooglePending;
    const strings = [value.state, value.nonce, value.verifier, value.redirectUri];
    if (!strings.every((part) => typeof part === "string" && part.length > 0)) return null;
    return {
      ...value,
      locale: toLocale(value.locale),
      next: typeof value.next === "string" ? value.next : null,
    };
  } catch {
    return null;
  }
}

/**
 * Google's one-time code, traded for an ID token.
 *
 * Server to server, with the secret and the PKCE verifier; the browser never
 * sees either. Null on any refusal — the caller sends the person back to the
 * sign-in page, which has a message for exactly this.
 */
export async function exchangeGoogleCode(
  code: string,
  pending: GooglePending,
): Promise<string | null> {
  const response = await fetch(TOKEN, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: pending.redirectUri,
      grant_type: "authorization_code",
      code_verifier: pending.verifier,
    }),
    cache: "no-store",
    // A hung token endpoint should not hang the person on a blank callback.
    signal: AbortSignal.timeout(10_000),
  }).catch(() => null);
  if (!response) return null;
  if (!response.ok) {
    // The error *name* only — `invalid_grant`, `redirect_uri_mismatch` — never
    // the code, the verifier or the secret.
    const body = (await response.json().catch(() => ({}))) as { error?: unknown };
    console.error("[auth] google token exchange refused", response.status, body.error);
    return null;
  }

  const body = (await response.json()) as { id_token?: unknown };
  return typeof body.id_token === "string" ? body.id_token : null;
}
