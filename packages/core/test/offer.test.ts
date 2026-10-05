import { test } from "node:test";
import assert from "node:assert/strict";

import { bundleOffer } from "../src/offer.ts";
import { BUNDLE_PRICE_MNT } from "../src/constants.ts";

const launch = { price: 199_000, lastDay: "2026-10-20" };

// ── The launch price, and the moment it ends ─────────────────────────────────

test("offer: during the launch the struck number is the regular price", () => {
  const offer = bundleOffer(new Date("2026-10-05T12:00:00+08:00"), launch);
  assert.equal(offer.price, 199_000);
  assert.equal(offer.was, BUNDLE_PRICE_MNT);
  assert.equal(offer.saving, BUNDLE_PRICE_MNT - 199_000);
  assert.equal(offer.until, "10-р сарын 20");
});

test("offer: the last day is inclusive, in Ulaanbaatar's calendar", () => {
  // 23:59 on the 20th in Ulaanbaatar is 15:59 UTC — still the launch.
  assert.equal(bundleOffer(new Date("2026-10-20T23:59:59+08:00"), launch).price, 199_000);
  // Midnight that closes the 20th there: the regular price, and nothing struck.
  const after = bundleOffer(new Date("2026-10-21T00:00:00+08:00"), launch);
  assert.deepEqual(after, { price: BUNDLE_PRICE_MNT, was: null, saving: 0, until: null });
});

test("offer: a launch price that is not lower is no launch at all", () => {
  const offer = bundleOffer(new Date("2026-10-05T12:00:00+08:00"), {
    price: BUNDLE_PRICE_MNT,
    lastDay: "2026-10-20",
  });
  assert.equal(offer.was, null);
  assert.equal(offer.until, null);
});
