import { test } from "node:test";
import assert from "node:assert/strict";

import { slugify, isValidSlug } from "../src/slug.ts";
import { formatDate, formatMoney, formatDuration, groupDigits, percent } from "../src/format.ts";

// ── Slugs ────────────────────────────────────────────────────────────────────

test("slugify: Cyrillic becomes latin kebab-case the domain accepts", () => {
  assert.equal(slugify("Вэб хөгжүүлэлтийн үндэс"), "veb-hugjuuleltiin-undes");
  assert.equal(slugify("JavaScript: эхний алхам"), "javascript-ehnii-alham");
  assert.ok(isValidSlug(slugify("Өнөөдөр — үзэх!")));
});

test("slugify: never ends with a separator", () => {
  assert.ok(!slugify("Асуулт???").endsWith("-"));
});

// ── Formatting ───────────────────────────────────────────────────────────────

test("format: Mongolian dates are never in US order", () => {
  const date = new Date(2026, 8, 11);
  assert.equal(formatDate(date, "mn"), "2026 оны 9-р сарын 11");
});

test("format: money is grouped tögrög, and zero is a word", () => {
  assert.equal(formatMoney(149000, "mn"), "149,000₮");
  assert.equal(formatMoney(0, "mn"), "Үнэгүй");
  assert.equal(groupDigits(1234567), "1,234,567");
});

test("format: durations read as hours and minutes", () => {
  assert.equal(formatDuration(95, "mn"), "1 ц 35 мин");
});

test("format: percent cannot exceed 100 however the counts arrive", () => {
  assert.equal(percent(12, 10), 100);
  assert.equal(percent(0, 0), 0);
});
