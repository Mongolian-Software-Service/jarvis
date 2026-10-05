import { test } from "node:test";
import assert from "node:assert/strict";

import { bundleOffer } from "../src/offer.ts";
import { bundlePricingSchema } from "../src/schemas/pricing.ts";

const pricing = { priceMnt: 499_000, launchPriceMnt: 199_000, launchLastDay: "2026-10-20" };

// ── The launch price, and the moment it ends ─────────────────────────────────

test("offer: during the launch the struck number is the regular price", () => {
  const offer = bundleOffer(pricing, new Date("2026-10-05T12:00:00+08:00"));
  assert.equal(offer.price, 199_000);
  assert.equal(offer.was, 499_000);
  assert.equal(offer.saving, 300_000);
  assert.equal(offer.until, "10-р сарын 20");
});

test("offer: the last day is inclusive, in Ulaanbaatar's calendar", () => {
  // 23:59 on the 20th in Ulaanbaatar is 15:59 UTC — still the launch.
  assert.equal(bundleOffer(pricing, new Date("2026-10-20T23:59:59+08:00")).price, 199_000);
  // Midnight that closes the 20th there: the regular price, and nothing struck.
  const after = bundleOffer(pricing, new Date("2026-10-21T00:00:00+08:00"));
  assert.deepEqual(after, { price: 499_000, was: null, saving: 0, until: null });
});

test("offer: a launch price that is not lower is no launch at all", () => {
  const offer = bundleOffer(
    { ...pricing, launchPriceMnt: 499_000 },
    new Date("2026-10-05T12:00:00+08:00"),
  );
  assert.equal(offer.was, null);
  assert.equal(offer.until, null);
});

test("offer: no launch set means the regular price, nothing struck", () => {
  const offer = bundleOffer({ priceMnt: 350_000, launchPriceMnt: null, launchLastDay: null });
  assert.deepEqual(offer, { price: 350_000, was: null, saving: 0, until: null });
});

// ── What the console may save ────────────────────────────────────────────────

test("pricing form: commas, spaces and ₮ are the same amount", () => {
  const parsed = bundlePricingSchema.parse({
    price_mnt: "499,000₮",
    launch_price_mnt: "199 000",
    launch_last_day: "2026-10-20",
  });
  assert.deepEqual(parsed, {
    price_mnt: 499_000,
    launch_price_mnt: 199_000,
    launch_last_day: "2026-10-20",
  });
});

test("pricing form: both launch fields empty is a plain price", () => {
  const parsed = bundlePricingSchema.parse({
    price_mnt: "350000",
    launch_price_mnt: "",
    launch_last_day: "",
  });
  assert.equal(parsed.launch_price_mnt, null);
  assert.equal(parsed.launch_last_day, null);
});

test("pricing form: half a launch is refused, under the empty field", () => {
  const result = bundlePricingSchema.safeParse({
    price_mnt: "499000",
    launch_price_mnt: "199000",
    launch_last_day: "",
  });
  assert.equal(result.success, false);
  assert.deepEqual(result.error?.issues[0]?.path, ["launch_last_day"]);
});

test("pricing form: a launch price at or above the regular one is refused", () => {
  const result = bundlePricingSchema.safeParse({
    price_mnt: "199000",
    launch_price_mnt: "199000",
    launch_last_day: "2026-10-20",
  });
  assert.equal(result.success, false);
  assert.deepEqual(result.error?.issues[0]?.path, ["launch_price_mnt"]);
});

test("pricing form: a decimal tail is refused, not read as more digits", () => {
  const result = bundlePricingSchema.safeParse({
    price_mnt: "499000.50",
    launch_price_mnt: "",
    launch_last_day: "",
  });
  assert.equal(result.success, false);
  assert.deepEqual(result.error?.issues[0]?.path, ["price_mnt"]);
  // Thousands separators in either style still read as one amount.
  assert.equal(
    bundlePricingSchema.parse({ price_mnt: "1.234.000", launch_price_mnt: "", launch_last_day: "" })
      .price_mnt,
    1_234_000,
  );
});
