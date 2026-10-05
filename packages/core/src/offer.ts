/**
 * What the bundle costs at a given moment, and what a screen may say about it.
 *
 * One function, because the invoice and the page have to agree: checkout
 * charges `price`, and every screen that prints a price prints this object. A
 * struck-through number computed on a screen and an amount charged in a route
 * are two answers that drift the first time the launch is extended.
 *
 * The pricing itself is a row in `public.bundle_pricing`, which the console
 * edits (20261005000100). It used to be three constants here; this function
 * takes the row as an argument so it stays pure and testable without a
 * database.
 *
 * Still one price for everything (§1) — this is not a price per course.
 */

/** `public.bundle_pricing`, in the shape the app reads it. */
export type BundlePricing = {
  /** The regular price. Charged once the launch is over, struck through until then. */
  priceMnt: number;
  /** The opening price, or null when no launch is running. */
  launchPriceMnt: number | null;
  /**
   * The launch's last day, `2026-10-20`, a calendar date in Ulaanbaatar and
   * **inclusive**: «10-р сарын 20 хүртэл» is read by a buyer as "on the 20th
   * too", and the generous reading is the one that cannot be called a trick.
   */
  launchLastDay: string | null;
};

export type BundleOffer = {
  /** What is charged now. */
  price: number;
  /** The regular price, struck through while the launch runs; null after. */
  was: number | null;
  /** `was - price`, or 0 once there is nothing struck through. */
  saving: number;
  /** The launch's last day, `10-р сарын 20`; null once it has passed. */
  until: string | null;
};

/**
 * Ulaanbaatar is UTC+8 all year (see chat.ts), so the launch ends at the
 * midnight that closes its last day there — whatever clock the server keeps.
 */
function launchEndsAt(lastDay: string): number {
  return Date.parse(`${lastDay}T00:00:00+08:00`) + 24 * 60 * 60 * 1000;
}

/** `2026-10-20` → `10-р сарын 20`. Read off the string, so no clock can shift it. */
function monthDay(lastDay: string): string {
  const [, month, day] = lastDay.split("-").map(Number);
  return `${month}-р сарын ${day}`;
}

/**
 * When the launch's day passes, the regular price is charged and the strike,
 * the saving and the date leave every screen on their own. A deadline that
 * does not move the price would be the anchor again, only with a date on it.
 */
export function bundleOffer(pricing: BundlePricing, now: Date = new Date()): BundleOffer {
  const { priceMnt, launchPriceMnt, launchLastDay } = pricing;
  const running =
    launchPriceMnt !== null &&
    launchLastDay !== null &&
    launchPriceMnt < priceMnt &&
    now.getTime() < launchEndsAt(launchLastDay);

  if (!running) return { price: priceMnt, was: null, saving: 0, until: null };

  return {
    price: launchPriceMnt,
    was: priceMnt,
    saving: priceMnt - launchPriceMnt,
    until: monthDay(launchLastDay),
  };
}
