import type { Locale } from "./locale";

/**
 * Dates and money, formatted without `Intl`.
 *
 * **Hydration.** `Intl` data differs between Node and a browser engine, so a
 * date rendered on the server and again on the client can disagree — which
 * React reports as a hydration mismatch on a page that looked fine. That is the
 * whole reason now; a second one applied to an Expo app that no longer exists
 * (Hermes ships without full ICU on Android), and the first stands alone.
 *
 * The Mongolian long date is `2026 оны 9-р сарын 11` and is never written in
 * US order.
 */

function parse(value: string | Date): Date | null {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** `2026 оны 9-р сарын 11`. Never US order. */
export function formatDate(value: string | Date | null | undefined, _locale: Locale): string {
  if (!value) return "";
  const date = parse(value);
  if (!date) return "";
  return `${date.getFullYear()} оны ${date.getMonth() + 1}-р сарын ${date.getDate()}`;
}

/** The same, with `HH:MM` after it. */
export function formatDateTime(value: string | Date | null | undefined, locale: Locale): string {
  const date = value ? parse(value) : null;
  if (!date) return "";
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${formatDate(date, locale)}, ${hh}:${mm}`;
}

/** `149,000₮`. Zero is the word "free", which is a different thing to say. */
export function formatMoney(mnt: number, _locale: Locale): string {
  if (mnt <= 0) return "Үнэгүй";
  return `${groupDigits(Math.round(mnt))}₮`;
}

/** Thousands separated, deterministically — `Intl.NumberFormat` is not. */
export function groupDigits(value: number): string {
  const negative = value < 0;
  const digits = Math.abs(value).toString();
  let out = "";
  for (let i = 0; i < digits.length; i++) {
    if (i > 0 && (digits.length - i) % 3 === 0) out += ",";
    out += digits[i];
  }
  return negative ? `-${out}` : out;
}

/** `12 мин` / `1 ц 20 мин` */
export function formatDuration(minutes: number, _locale: Locale): string {
  const total = Math.max(0, Math.round(minutes));
  const hours = Math.floor(total / 60);
  const mins = total % 60;
  if (hours && mins) return `${hours} ц ${mins} мин`;
  if (hours) return `${hours} ц`;
  return `${mins} мин`;
}

/**
 * `3 хоногийн өмнө`.
 *
 * Anything older than a month gets the date instead: «47 хоногийн өмнө» is a
 * number nobody converts in their head.
 */
export function formatAgo(value: string | Date | null | undefined, locale: Locale): string {
  const date = value ? parse(value) : null;
  if (!date) return "";
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "дөнгөж сая";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} минутын өмнө`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} цагийн өмнө`;
  const days = Math.floor(hours / 24);
  if (days <= 30) return `${days} хоногийн өмнө`;
  return formatDate(date, locale);
}

/** `0%`–`100%`, rounded, never over 100 however the counts arrive. */
export function percent(done: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((done / total) * 100)));
}

/**
 * Овог нэр, in Mongolian order, skipping whichever half is missing.
 *
 * An account that signed up before the two columns existed may have only one
 * of them, and «null Тэмүүлэн» is worse than «Тэмүүлэн». It lived as a private
 * helper in the feedback query and then as a copy in two more; three screens
 * that print a person's name should not have three opinions about how.
 */
export function formatFullName(
  last: string | null | undefined,
  first: string | null | undefined,
): string | null {
  const parts = [last, first].map((part) => part?.trim()).filter(Boolean);
  return parts.length ? parts.join(" ") : null;
}
