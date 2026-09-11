/**
 * The two languages Jarvis speaks.
 *
 * Mongolian is the default, the fallback, and the language the product is
 * written in. English is secondary and **may be incomplete** — a course whose
 * `title_en` is null is normal, and the English edition shows the Mongolian
 * rather than an empty card or a 404.
 */
export const LOCALES = ["mn", "en"] as const;

export type Locale = (typeof LOCALES)[number];

/** What somebody gets when they have not said, and what `/` serves. */
export const DEFAULT_LOCALE: Locale = "mn";

/**
 * How each language names itself. Never translated — a language picker that
 * says "Mongolian" to somebody who cannot read English has failed at its one job.
 */
export const LOCALE_NAMES: Record<Locale, string> = {
  mn: "Монгол",
  en: "English",
};

/** The request header the proxy writes the negotiated locale into. */
export const LOCALE_HEADER = "x-locale";

/** Where a chosen language is remembered, on both platforms. */
export const LOCALE_COOKIE = "jarvis-locale";

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
 * The Mongolian text, or the English one when it exists and English was asked for.
 *
 * This is the locale fallback rule in one function, and every bilingual column
 * in the schema goes through it. The direction is deliberate and one-way: there
 * is no `mn ?? en`, because Mongolian is never the column that is missing.
 */
export function localized(locale: Locale, mn: string, en?: string | null): string {
  if (locale === "en" && en != null && en.trim() !== "") return en;
  return mn;
}

/** The same, for a column that may be absent in both languages. */
export function localizedOrNull(
  locale: Locale,
  mn: string | null,
  en?: string | null,
): string | null {
  if (locale === "en" && en != null && en.trim() !== "") return en;
  return mn != null && mn.trim() !== "" ? mn : null;
}

/**
 * Is this text a fallback — Mongolian shown inside the English edition?
 *
 * The screen needs to know: a block in the wrong language has to carry
 * `lang="mn"`, or a screen reader will pronounce Cyrillic with English rules
 * and browser translation will offer to translate a page it has already
 * decided is English.
 */
export function isFallback(locale: Locale, en?: string | null): boolean {
  return locale === "en" && (en == null || en.trim() === "");
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
