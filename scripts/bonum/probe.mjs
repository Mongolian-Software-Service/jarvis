/**
 * Asking Bonum whether a terminal id and app secret are any good — without
 * ever printing either, or the token that comes back.
 *
 * The request is the one `apps/web/src/lib/bonum.ts` makes, to the letter, and
 * the one Bonum documents (psp.bonum.mn/bonum-gateway-apis.html):
 *
 *   GET /bonum-gateway/ecommerce/auth/create
 *   Authorization: AppSecret <app secret>
 *   X-TERMINAL-ID: <terminal id>
 *
 * so a yes here is a yes from the site, and a no here is the same no the site
 * logs as `[checkout] bonum invoice failed … 401 NO_AUTH`.
 */

export const PRODUCTION = "https://apis.bonum.mn";
export const SANDBOX = "https://testapi.bonum.mn";

/**
 * What a pasted value *looks like*, in words, without showing it.
 *
 * The first real attempt measured 475 characters against a secret that should
 * have been 160 — something else had been copied with it, and the only way to
 * say so without echoing a secret is to describe its shape: its length, its
 * alphabet, and whether it carries the labels or Cyrillic that a copied block
 * of notes would.
 */
export function describe(value) {
  let kind = "бусад тэмдэгттэй";
  if (/^[0-9a-f]+$/i.test(value)) kind = "hex (0-9, a-f)";
  else if (/^eyJ[\w-]+\.[\w-]+\.[\w-]+$/.test(value)) kind = "JWT хэлбэртэй (eyJ…)";
  else if (/^[A-Za-z0-9+/=_-]+$/.test(value)) kind = "base64 хэлбэртэй";
  const labelled = /:/.test(value) || /[^\x21-\x7e]/.test(value);
  return `${value.length} тэмдэгт, ${kind}${labelled ? " — шошго эсвэл кирилл үсэг орсон" : ""}`;
}

/** True when a value looks like a block of notes rather than one key. */
export function looksLabelled(value) {
  return /:/.test(value) || /[^\x21-\x7e]/.test(value);
}

/**
 * One token request. Reports the HTTP status, Bonum's error code and its trace
 * id — the trace id is what Bonum's support asks for — and nothing else.
 */
export async function tryBonum(base, terminalId, appSecret) {
  try {
    const response = await fetch(`${base}/bonum-gateway/ecommerce/auth/create`, {
      headers: { Authorization: `AppSecret ${appSecret}`, "X-TERMINAL-ID": terminalId },
      signal: AbortSignal.timeout(15_000),
    });
    const body = await response.json().catch(() => null);
    return {
      ok: response.ok && Boolean(body?.accessToken),
      status: response.status,
      code: body?.errorCode ?? null,
      trace: body?.traceId ?? null,
    };
  } catch (error) {
    const why = error instanceof Error ? error.message : String(error);
    return { ok: false, status: 0, code: why, trace: null };
  }
}

/** `HTTP 401 · NO_AUTH · trace 6ac2…` — one line, for the terminal. */
export function verdict(result) {
  return [`HTTP ${result.status}`, result.code, result.trace ? `trace ${result.trace}` : null]
    .filter(Boolean)
    .join(" · ");
}
