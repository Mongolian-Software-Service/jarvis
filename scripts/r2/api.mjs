/**
 * Cloudflare R2, over `fetch` and a Bearer token.
 *
 * **Not the S3-compatible API**, and that is the whole reason this file is
 * short. R2 speaks S3, and S3 means SigV4: a canonical request, a signed
 * header list and an HMAC chain, or `@aws-sdk/client-s3` — several megabytes of
 * dependency for one script that uploads a film once a week. Cloudflare's own
 * REST API takes the same Bearer token as every other Cloudflare call, so this
 * is the same shape as `supabase-setup.mjs`: a `fetch`, a token, a JSON
 * envelope. Nothing is added to `package.json` for it.
 *
 * What we give up: multipart. The REST endpoint is one request per object, so a
 * genuinely large file has to go through `wrangler` or the S3 API instead. For
 * a screen recording that has been encoded for students on mobile data, one
 * request is the right size — see the note on 100MB in `upload-video.mjs`.
 *
 * The REST API is also rate limited to 1,200 requests per five minutes across
 * the account, which is thousands of lesson videos away from mattering.
 */
const API = "https://api.cloudflare.com/client/v4";

/**
 * What `Content-Type` a file gets, by extension.
 *
 * It is not cosmetic. R2 serves back whatever was stored, and a `<video>`
 * element handed `application/octet-stream` draws a black frame with nothing in
 * the console — the same silent failure a YouTube page URL causes, which
 * `check-seed.mjs` exists to refuse.
 */
const TYPES = {
  ".mp4": "video/mp4",
  ".m4v": "video/x-m4v",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
  ".vtt": "text/vtt",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

export function contentTypeOf(name) {
  const dot = name.lastIndexOf(".");
  return (dot === -1 ? null : TYPES[name.slice(dot).toLowerCase()]) ?? "application/octet-stream";
}

export function r2(accountId, token) {
  const base = `${API}/accounts/${accountId}/r2/buckets`;

  async function call(path, init = {}) {
    const binary = init.body instanceof Uint8Array;
    const response = await fetch(`${base}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(binary ? {} : { "Content-Type": "application/json" }),
        ...(init.headers ?? {}),
      },
    });

    const text = await response.text();
    let body = null;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      /* The object endpoints can answer with bytes rather than an envelope. */
    }

    if (!response.ok || body?.success === false) {
      const why = (body?.errors ?? []).map((e) => `${e.code} ${e.message}`).join("; ");
      throw new Error(
        `${init.method ?? "GET"} /buckets${path || ""} → ${response.status}\n  ` +
          (why || text.slice(0, 300)),
      );
    }
    return body?.result ?? null;
  }

  /**
   * The bucket, created if it is not there yet. Returns whether it was created.
   *
   * The probe is a GET in a `try`, which reads a 401 as "no bucket" — and then
   * the POST fails with the same 401 and reports it. Wrong for one line, right
   * at the end, and the alternative is a second error-shape to keep in step.
   */
  async function ensureBucket(name) {
    try {
      await call(`/${encodeURIComponent(name)}`);
      return false;
    } catch {
      await call("", { method: "POST", body: JSON.stringify({ name }) });
      return true;
    }
  }

  /**
   * The `*.r2.dev` origin for a bucket, switched on if it was not.
   *
   * ⚠️ **Development only.** Cloudflare rate-limits `r2.dev` and does not put
   * its cache in front of it, so a class watching one lesson at once is exactly
   * the traffic it is not for. Production serves from a custom domain, which is
   * what `R2_PUBLIC_BASE` is — SETUP.md has the four clicks.
   */
  async function managedDomain(name) {
    const path = `/${encodeURIComponent(name)}/domains/managed`;
    const current = await call(path);
    if (current?.enabled && current?.domain) return current.domain;

    // The PUT answers with the domain as well, so switching it on costs one
    // request rather than a write followed by a read of what was just written.
    const enabled = await call(path, { method: "PUT", body: JSON.stringify({ enabled: true }) });
    return enabled?.domain ?? current?.domain ?? null;
  }

  /**
   * One object, in one request.
   *
   * Each path segment is encoded on its own so `/` keeps being a separator —
   * `encodeURIComponent` on the whole key would turn `lessons/x.mp4` into a
   * single object literally named `lessons%2Fx.mp4`.
   */
  async function put(bucket, key, bytes, type) {
    const path = key.split("/").map(encodeURIComponent).join("/");
    await call(`/${encodeURIComponent(bucket)}/objects/${path}`, {
      method: "PUT",
      body: bytes,
      headers: { "Content-Type": type },
    });
  }

  return { ensureBucket, managedDomain, put };
}
