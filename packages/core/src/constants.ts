import type { Locale } from "./locale";

/**
 * The name, in Latin, capitalised, in both editions.
 *
 * Never transliterated into Cyrillic and never translated: a wordmark that
 * changes shape under the language switch stops being a landmark. Where a
 * Mongolian sentence needs a case suffix, attach it with a non-breaking hyphen
 * — `Jarvis‑ийн` (U+2011) — so the line cannot break between the name and its
 * ending.
 */
export const SITE_NAME = "Jarvis";

/** What the product is, in one line, for the masthead and the OG description. */
export const SITE_TAGLINE: Record<Locale, string> = {
  mn: "Онлайн код сургалт",
  en: "Learn to code online",
};

/** Where the app thinks it lives. Falls back to localhost for a dev machine. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_APP_URL ??
  process.env.EXPO_PUBLIC_API_URL ??
  "http://localhost:3000"
).replace(/\/$/, "");

/** Free access is priced at zero, not flagged separately. */
export function isFree(priceMnt: number): boolean {
  return priceMnt <= 0;
}

/**
 * How to reach the school — the only copy of these values.
 *
 * **These are examples. Replace them before the site is public** (SETUP.md
 * step 10). They sit beside `SITE_NAME` rather than in a web component or an
 * environment variable for the same reason it does: an inbox printed on a
 * poster is a fact about the school, not configuration that differs between a
 * preview deployment and production — and the phone will want the same values
 * the day it grows a support screen.
 *
 * A channel set to an empty string is **not rendered at all**, so removing one
 * is a matter of emptying it rather than of finding every place it is drawn.
 */
export type ContactChannel = "email" | "phone" | "facebook" | "instagram";

export const CONTACT: Record<ContactChannel, string> = {
  email: "info@jarvis.mn",
  /** Written the way it is dialled, and linked as `tel:` with the spaces out. */
  phone: "+976 7000 0000",
  facebook: "https://www.facebook.com/jarvis.mn",
  instagram: "https://www.instagram.com/jarvis.mn",
};

/** `tel:` wants digits and a `+`, not the spacing a person reads. */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

/**
 * The colour the browser chrome takes. Matches `--bg` in globals.css exactly.
 *
 * One value, because there is one theme (CLAUDE.md §4). Nothing reads a
 * preference to decide it, so the web's `viewport` export is static and the
 * phone's status bar is set once — the address bar cannot end up a different
 * colour from the page under it.
 */
export const THEME_COLOR = "#08090a";
