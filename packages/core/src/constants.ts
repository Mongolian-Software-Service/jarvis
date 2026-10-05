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

/*
 * The bundle's price used to live here as three constants. It is a row in
 * `public.bundle_pricing` now, edited from the console — see offer.ts and
 * 20261005000100. Still one price for everything (§1): a course is not sold
 * on its own, and the amount charged is read on the server, never sent by a
 * client (§6.7).
 */

/**
 * Whether the selling pages print how many lessons and hours the school holds.
 *
 * Not yet. Ten lessons and three and a half hours, with «20 мин» under a course
 * called «2D-ээс 3D хүртэл», reads to a buyer as "is that all" — so the bundle
 * panel's sentence, a course card and a course page's header say «Шинэ хичээл
 * тогтмол нэмэгдэнэ» instead. A course page's
 * syllabus still lists every lesson and its minutes: this stops advertising
 * the size, it does not hide it. Turn it on when the numbers argue for the
 * school.
 */
export const SHOW_CONTENT_SIZE = false;

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

/**
 * What a social channel is called on screen — the account's name, never its
 * address. `facebook.com/people/TS-Stark-Software-LLC/61591180479626` is a
 * URL with an id on the end, not something a person reads or remembers, and
 * the platform is already named on the card above it. The link still goes to
 * the URL in `CONTACT`; only what is printed changes.
 */
export const CONTACT_NAMES: Record<"facebook" | "instagram", string> = {
  facebook: "TS Stark Software",
  instagram: "TS Stark Software",
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
