import { BUNDLE_LAUNCH_LAST_DAY, BUNDLE_LAUNCH_PRICE_MNT, BUNDLE_PRICE_MNT } from "./constants";

/**
 * What the bundle costs at a given moment, and what a screen may say about it.
 *
 * One function, because the invoice and the page have to agree: checkout
 * charges `price`, and every screen that prints a price prints this object. A
 * struck-through number computed on a screen and an amount charged in a route
 * are two answers that drift the first time the launch is extended.
 */
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

export function bundleOffer(
  now: Date = new Date(),
  launch = { price: BUNDLE_LAUNCH_PRICE_MNT, lastDay: BUNDLE_LAUNCH_LAST_DAY },
): BundleOffer {
  const running = launch.price < BUNDLE_PRICE_MNT && now.getTime() < launchEndsAt(launch.lastDay);

  if (!running) return { price: BUNDLE_PRICE_MNT, was: null, saving: 0, until: null };

  return {
    price: launch.price,
    was: BUNDLE_PRICE_MNT,
    saving: BUNDLE_PRICE_MNT - launch.price,
    until: monthDay(launch.lastDay),
  };
}
