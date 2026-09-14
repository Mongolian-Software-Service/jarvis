/**
 * The one language TsStark Academy speaks.
 *
 * It shipped bilingual and is not: the school is Mongolian, its students are
 * Mongolian, and a half-translated second edition is worse than none — it
 * doubles every copy change and shows somebody a screen in a language the rest
 * of the product is not written in.
 *
 * `Locale` stays a type rather than becoming a constant, and the URL keeps its
 * `/mn` prefix. The day a second language is a real decision, it is added here
 * and to `strings/`, not retrofitted into three hundred call sites.
 *
 * The `_en` columns stay in the database, unread. Dropping them is a migration
 * that throws away translations somebody may still want; leaving them costs a
 * few bytes a row.
 */
export const LOCALES = ["mn"] as const;

export type Locale = (typeof LOCALES)[number];

/** What somebody gets when they have not said, and what `/` serves. */
export const DEFAULT_LOCALE: Locale = "mn";

/**
 * How each language names itself. Never translated — a language picker that
 * says "Mongolian" to somebody who cannot read English has failed at its one job.
 */
export const LOCALE_NAMES: Record<Locale, string> = {
  mn: "Монгол",
};

/** The request header the proxy writes the negotiated locale into. */
export const LOCALE_HEADER = "x-locale";

/** Where a chosen language is remembered, on both platforms. */
export const LOCALE_COOKIE = "jarvis-locale";

/** Where «Дараа бөглөнө» is remembered, for a day. */
export const PROFILE_LATER_COOKIE = "jarvis-profile-later";

/** A year: a language preference is not a question to ask again next week. */
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/**
 * The locale a value asks for, or the default.
 *
 * Takes `unknown` because every caller — a route segment, a cookie, a header —
 * is handing over a string that arrived from outside and cannot be trusted to
 * be one of two known values.
 */
export function toLocale(value: unknown): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

/**
 * The text for the reader's language.
 *
 * Every bilingual column in the schema goes through this. With one language it
 * always answers with the Mongolian — the `_en` argument is still accepted so
 * the call sites and the columns behind them do not have to be rewritten, and
 * so a second language is a change here rather than everywhere.
 */
export function localized(_locale: Locale, mn: string, _en?: string | null): string {
  return mn;
}

/** The same, for a column that may be absent in both languages. */
export function localizedOrNull(
  _locale: Locale,
  mn: string | null,
  _en?: string | null,
): string | null {
  return mn != null && mn.trim() !== "" ? mn : null;
}

/**
 * Is this text a fallback — one language shown inside another?
 *
 * Never, while there is one language. It stays because the screens that mark a
 * fallback block `lang="…"` are right to ask, and because deleting the question
 * would be the thing nobody remembers to put back.
 */
export function isFallback(_locale: Locale, _en?: string | null): boolean {
  return false;
}

/**
 * The best match for an `Accept-Language` header.
 *
 * Deliberately crude: it looks for a language subtag this product has, in the
 * order the browser listed them, and ignores quality values. A parser for the
 * header's subtleties does not change the answer when there are two languages.
 */
export function localeFromAcceptLanguage(header: string | null): Locale | null {
  if (!header) return null;
  for (const part of header.split(",")) {
    const tag = part.split(";")[0]?.trim().toLowerCase();
    if (!tag) continue;
    const base = tag.split("-")[0];
    if (isLocale(base)) return base;
  }
  return null;
}
