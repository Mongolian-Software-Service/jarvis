import "server-only";
import { cache } from "react";
import { bundleOffer, type BundleOffer, type BundlePricing } from "@jarvis/core";
import { createServerSupabase, supabaseConfigured } from "@/lib/supabase/server";

/**
 * The bundle's price, from the one row the console edits (20261005000100).
 *
 * No `locale` argument, unlike the rest of this directory: nothing here is
 * translated — a price is a number and the launch's day is a date.
 *
 * Cached per request, so a page that prints the price twice and the checkout
 * route that charges it each read the row once. Null when it cannot be read:
 * a screen then prints no price rather than a guessed one, and checkout
 * refuses rather than charging a default nobody set.
 */
export const getBundlePricing = cache(async (): Promise<BundlePricing | null> => {
  if (!supabaseConfigured()) return null;

  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("bundle_pricing")
    .select("price_mnt, launch_price_mnt, launch_last_day")
    .maybeSingle();

  if (error || !data) {
    console.error("[pricing] bundle_pricing could not be read", error?.message ?? "no row");
    return null;
  }

  return {
    priceMnt: data.price_mnt,
    launchPriceMnt: data.launch_price_mnt,
    launchLastDay: data.launch_last_day,
  };
});

/** What a screen prints and what checkout charges, right now. */
export async function getBundleOffer(): Promise<BundleOffer | null> {
  const pricing = await getBundlePricing();
  return pricing ? bundleOffer(pricing) : null;
}
