import type { Locale } from "./locale";

/**
 * The school's name, in Latin, capitalised.
 *
 * Never transliterated into Cyrillic and never translated: a wordmark that
 * changes shape mid-product stops being a landmark. Where a Mongolian sentence
 * needs a case suffix, attach it with a non-breaking hyphen — `TsStark‑ийн`
 * (U+2011, not U+002D) — so the line cannot break between the name and its
 * ending.
 */
export const SITE_NAME = "TsStark Academy";

/**
 * Who runs the school, and where they live.
 *
 * The academy is one thing TsStark makes, and the footer says so — a school
 * with a company behind it is a school somebody can still reach next year.
 * Separate constants because the two names appear in different places and
 * `SITE_NAME.split(" ")[0]` is a rule that breaks the first time either
 * changes.
 */
export const COMPANY_NAME = "TsStark";
export const COMPANY_URL = "https://tsstark.com";

/** What the product is, in one line, for the masthead and the OG description. */
export const SITE_TAGLINE: Record<Locale, string> = {
  mn: "Код бичихгүйгээр апп бүтээж сурах онлайн сургалт",
};

/** Where the app thinks it lives. Falls back to localhost for a dev machine. */
export const SITE_URL = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001").replace(
  /\/$/,
  "",
);

/**
 * One price for the whole school, and the only price there is.
 *
 * A course is not sold on its own. Six tracks at six prices is a set of
 * decisions somebody has to make before they have any way of making them — so
 * there is one decision: pay this once, hold every published course for good.
 * Courses carry `is_free` and nothing else about money; the amount charged is
 * this constant, read on the server, never sent by a client (§6.6).
 *
 * A constant rather than a column because there is exactly one of it and
 * changing it is a deploy, not a Tuesday. When the team wants to run a sale
 * without asking a developer, it becomes a row in a settings table and this
 * comment is the note that it was a deliberate wait.
 */
export const BUNDLE_PRICE_MNT = 199_000;

/**
 * The price the bundle is struck through from.
 *
 * Stated, not computed. There is no per-course price left to add up, and there
 * should not be: the saving a buyer is shown is the difference between these
 * two numbers and nothing else, so changing either keeps every screen honest
 * with itself.
 */
export const BUNDLE_FULL_PRICE_MNT = 499_000;

/**
 * What the buyer is told they save — derived once, shown in two places.
 *
 * The catalogue panel and the course page both print it, and a saving that is
 * subtracted separately on each screen is a saving that disagrees with itself
 * the first time one of the two constants moves.
 */
export const BUNDLE_SAVING_MNT = BUNDLE_FULL_PRICE_MNT - BUNDLE_PRICE_MNT;

/**
 * How to reach the school — the only copy of these values.
 *
 * **These are examples. Replace them before the site is public** (SETUP.md
 * step 10). They sit beside `SITE_NAME` rather than in a web component or an
 * environment variable for the same reason it does: an inbox printed on a
 * poster is a fact about the school, not configuration that differs between a
 * preview deployment and production.
 *
 * A channel set to an empty string is **not rendered at all**, so removing one
 * is a matter of emptying it rather than of finding every place it is drawn.
 */
export type ContactChannel = "email" | "phone" | "facebook" | "instagram";

export const CONTACT: Record<ContactChannel, string> = {
  email: "tsstark1@icloud.com",
  /** Written the way it is dialled, and linked as `tel:` with the spaces out. */
  phone: "+976 9921 0611",
  /*
   * The canonical profile, not the `/share/…` link it was given as: a share URL
   * carries a one-off token, is not guaranteed to keep resolving, and says
   * nothing about who it belongs to. This one at least reads as the company.
   * It gets shorter the day the page claims a username.
   */
  facebook: "https://www.facebook.com/people/TS-Stark-Software-LLC/61591180479626/",
  /*
   * `?stkn=…` deliberately dropped. That parameter is a personal share token
   * tied to the account that copied the link — it belongs in a message, not in
   * a repository, and the bare handle resolves the same.
   */
  instagram: "https://www.instagram.com/ts.stark.software/",
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
