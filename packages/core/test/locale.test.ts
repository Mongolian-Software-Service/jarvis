import { test } from "node:test";
import assert from "node:assert/strict";

import { parseMarkdown } from "../src/markdown/index.ts";
import { localized, localizedOrNull, isFallback, toLocale } from "../src/locale.ts";
import { destinationAfterSignIn, topicTint } from "../src/courses.ts";
import { mn, strings, fmt } from "../src/strings/index.ts";

// ── Locale ───────────────────────────────────────────────────────────────────

test("locale: one language, so text is always the Mongolian", () => {
  assert.equal(localized("mn", "Монгол", "English"), "Монгол");
});

test("locale: nothing is a fallback while there is one language", () => {
  assert.equal(isFallback("mn", null), false);
});

test("locale: anything that is not a known code is Mongolian", () => {
  assert.equal(toLocale("ru"), "mn");
  assert.equal(toLocale(undefined), "mn");
});

// ── Strings ──────────────────────────────────────────────────────────────────

test("strings: no user-facing string is left empty", () => {
  const empties: string[] = [];
  const walk = (value: unknown, path: string): void => {
    if (typeof value === "string") {
      if (value.trim() === "") empties.push(path);
      return;
    }
    if (value && typeof value === "object") {
      for (const [key, child] of Object.entries(value)) walk(child, `${path}.${key}`);
    }
  };
  walk(mn, "mn");
  assert.deepEqual(empties, []);
});

test("strings: fmt fills placeholders and leaves unknown ones alone", () => {
  assert.equal(fmt("{count} сургалт", { count: 4 }), "4 сургалт");
  assert.equal(fmt("{a} {b}", { a: "x" }), "x {b}");
});

// ── Where a new session goes ─────────────────────────────────────────────────

test("sign-in: nothing asked for lands on the reader's own area", () => {
  assert.equal(destinationAfterSignIn("mn", "student", null), "/mn/dashboard");
  assert.equal(destinationAfterSignIn("mn", "admin", ""), "/mn/admin");
});

test("sign-in: the marketing page is not a destination", () => {
  // Signing in from the front page sets `next` to the front page. Honouring it
  // puts somebody who just signed in back on the pitch.
  assert.equal(destinationAfterSignIn("mn", "student", "/mn"), "/mn/dashboard");
  assert.equal(destinationAfterSignIn("mn", "admin", "/"), "/mn/admin");
});

test("sign-in: a real destination is honoured, an off-site one never is", () => {
  assert.equal(destinationAfterSignIn("mn", "student", "/mn/courses/react"), "/mn/courses/react");
  assert.equal(destinationAfterSignIn("mn", "student", "https://evil.example"), "/mn/dashboard");
  // `//host` is a protocol-relative URL, not a path on this site.
  assert.equal(destinationAfterSignIn("mn", "student", "//evil.example"), "/mn/dashboard");
});

// ── Topic tints ──────────────────────────────────────────────────────────────

test("topics: an unknown tag still gets a stable tint", () => {
  const first = topicTint("rust");
  assert.equal(first, topicTint("rust"));
  // A tag the table knows keeps the colour the table gives it.
  assert.equal(topicTint("app"), "violet");
});

// ── The welcome guide ────────────────────────────────────────────────────────

test("guide: the welcome text parses, and nothing is left as raw markup", () => {
  const blocks = parseMarkdown(mn.guide.body);
  assert.ok(blocks.length > 10, `only ${blocks.length} blocks`);
  assert.ok(
    blocks.some((block) => block.type === "heading"),
    "no headings",
  );
  assert.ok(
    blocks.some((block) => block.type === "list"),
    "no lists",
  );
  assert.ok(mn.guide.title.length > 0 && mn.guide.deck.length > 0, "title or deck is empty");
});
