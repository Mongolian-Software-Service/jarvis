/**
 * A student's project address: what counts as one, and how it is shown.
 *
 * Here rather than in the form because the same question is asked three
 * times — the field as it is typed, the action before it writes, and the
 * console when it draws somebody else's link — and three answers to "is this a
 * real address" is how a link the form accepted ends up refused by the
 * database's `check` with a message nobody wrote.
 */

/** The column's own bound (`projects.url`, 20261002000100). */
export const PROJECT_URL_MAX = 500;
export const PROJECT_TITLE_MAX = 80;
export const PROJECT_DESCRIPTION_MAX = 500;

/**
 * How many projects one student may keep. The database enforces the same
 * number (`projects_enforce_limit`, 20261002000300); this copy is what lets the
 * dashboard hide the form at ten instead of refusing the eleventh on Save.
 */
export const PROJECT_LIMIT = 10;

/** A scheme followed by `//` — the shape of every address a browser can open. */
const HAS_SCHEME = /^[a-z][a-z0-9+.-]*:\/\//i;

/**
 * A top-level domain: letters, or the punycode a Cyrillic one becomes (`.мон`
 * arrives here as `.xn--l1acc`). It is what tells `minii-huudas.vercel.app`
 * from `localhost`, `myfile.html` typed by mistake, or a bare word.
 */
const HAS_TLD = /\.(?:[a-z]{2,}|xn--[a-z0-9-]+)$/i;

/**
 * The address to store, or null when it is not one somebody else could open.
 *
 * People paste `minii-huudas.vercel.app` far more often than they type the
 * `https://` in front of it, so a missing scheme is supplied rather than
 * refused — https, because every host a student is taught to deploy on serves
 * it. Everything else is refused:
 *
 * - **Not http or https.** The link is rendered as an `href`, on the student's
 *   screen and on the team's. `javascript:` is the reason this function exists.
 * - **A user name or password in it.** `mailto:x@y.com` with `https://` put in
 *   front parses as user «mailto» at `y.com` — a link that would open a
 *   different site from the one it seems to name.
 * - **No real domain.** A project on `localhost` is a project on one laptop.
 *
 * Returns `URL.href`, so what is stored is already the canonical spelling —
 * spaces encoded, the host lower-cased — and always passes the column check.
 */
export function normalizeProjectUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (trimmed === "") return null;

  let url: URL;
  try {
    url = new URL(HAS_SCHEME.test(trimmed) ? trimmed : `https://${trimmed}`);
  } catch {
    return null;
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  if (url.username || url.password) return null;
  if (!HAS_TLD.test(url.hostname)) return null;
  if (url.href.length > PROJECT_URL_MAX) return null;
  return url.href;
}

/**
 * What a link is called when nobody named it: `minii-huudas.vercel.app`.
 *
 * The scheme and a leading `www.` are noise to a reader, and a trailing path
 * is usually `/` or something the student did not choose. Falls back to the
 * stored string, so a row that somehow fails to parse still says *something*.
 */
export function projectHost(url: string): string {
  try {
    return new URL(url).host.replace(/^www\./i, "");
  } catch {
    return url;
  }
}

/**
 * The address as a reader reads it: `minii-huudas.vercel.app/shop`.
 *
 * The host alone hid where a link really went once a student pasted a deep
 * one, and the full `href` is mostly `https://` and a trailing slash. Query
 * strings stay out — they are tracking far more often than they are content.
 */
export function projectDisplayUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const path = readable(parsed.pathname).replace(/\/+$/, "");
    return `${parsed.host.replace(/^www\./i, "")}${path}`;
  } catch {
    return url;
  }
}

/** `/%D0%BC%D0%B0` back to `/ма`; left alone if it is not valid UTF-8. */
function readable(path: string): string {
  try {
    return decodeURI(path);
  } catch {
    return path;
  }
}

/**
 * A student's name as the showcase prints it: «Б.Тэмүүлэн».
 *
 * The initial of the овог and the given name is how a Mongolian name is
 * written short — on a certificate, in a newspaper, on a class list — and it
 * is as much of a classmate's name as another student needs. The view hands
 * over the initial only, so the full овог never leaves the database.
 *
 * Null when there is no given name to print; the screen says «Сурагч» then,
 * rather than an initial and a full stop on their own.
 */
export function authorName(first: string | null, initial: string | null): string | null {
  const given = first?.trim();
  if (!given) return null;
  const letter = initial?.trim().charAt(0).toUpperCase();
  return letter ? `${letter}.${given}` : given;
}
