import { test } from "node:test";
import assert from "node:assert/strict";

import { parseMarkdown, excerpt } from "../src/markdown.ts";
import { highlight } from "../src/code.ts";
import { slugify, isValidSlug } from "../src/slug.ts";
import { formatDate, formatMoney, formatDuration, groupDigits, percent } from "../src/format.ts";
import { courseStats, nextLesson, quizScore } from "../src/progress.ts";
import { paymentState, toPaymentStatus, isStalePending } from "../src/payments.ts";
import { localized, localizedOrNull, isFallback, toLocale } from "../src/locale.ts";
import { topicTint } from "../src/courses.ts";
import { mn, en, strings, fmt } from "../src/strings/index.ts";

// ── Markdown ─────────────────────────────────────────────────────────────────

test("markdown: headings, paragraphs and lists", () => {
  const blocks = parseMarkdown("## Гарчиг\n\nЭнэ бол догол мөр.\n\n- нэг\n- хоёр");
  assert.equal(blocks.length, 3);
  assert.equal(blocks[0]?.type, "heading");
  assert.equal(blocks[1]?.type, "paragraph");
  assert.equal(blocks[2]?.type, "list");
  assert.equal(blocks[2]?.type === "list" && blocks[2].items.length, 2);
});

test("markdown: a fenced block keeps its language and its text verbatim", () => {
  const blocks = parseMarkdown("```ts\nconst a = 1;\n\nconst b = 2;\n```");
  const [block] = blocks;
  assert.equal(block?.type, "code");
  assert.equal(block?.type === "code" && block.language, "ts");
  assert.equal(block?.type === "code" && block.code, "const a = 1;\n\nconst b = 2;");
});

test("markdown: an unclosed fence runs to the end rather than eating the parser", () => {
  const blocks = parseMarkdown("Текст\n\n```js\nconst a = 1;");
  assert.equal(blocks.length, 2);
  assert.equal(blocks[1]?.type, "code");
});

test("markdown: inline marks", () => {
  const blocks = parseMarkdown("**тод** ба `код` ба [холбоос](https://jarvis.mn)");
  const parts = blocks[0]?.type === "paragraph" ? blocks[0].content : [];
  assert.deepEqual(
    parts.map((part) => part.type),
    ["strong", "text", "code", "text", "link"],
  );
});

test("markdown: a javascript: link is defused", () => {
  const blocks = parseMarkdown("[дар](javascript:alert(1))");
  const parts = blocks[0]?.type === "paragraph" ? blocks[0].content : [];
  const link = parts.find((part) => part.type === "link");
  assert.equal(link?.type === "link" && link.href, "#");
});

test("markdown: excerpt takes the first paragraph, not the heading", () => {
  assert.equal(excerpt("# Гарчиг\n\nЭхний өгүүлбэр."), "Эхний өгүүлбэр.");
});

// ── Highlighter ──────────────────────────────────────────────────────────────

test("highlight: keywords, strings and comments in JavaScript", () => {
  const [line] = highlight('const ner = "Ганбат"; // тайлбар', "js");
  const kinds = (line ?? []).map((token) => token.kind);
  assert.ok(kinds.includes("keyword"));
  assert.ok(kinds.includes("string"));
  assert.ok(kinds.includes("comment"));
});

test("highlight: a multi-line token still yields one entry per line", () => {
  const lines = highlight("/* нэг\n   хоёр */\nconst a = 1;", "js");
  assert.equal(lines.length, 3);
});

test("highlight: the text survives tokenising unchanged", () => {
  const source = "def mendleh(ner):\n    return f\"Сайн уу, {ner}\"";
  const rebuilt = highlight(source, "python")
    .map((line) => line.map((token) => token.text).join(""))
    .join("\n");
  assert.equal(rebuilt, source);
});

test("highlight: html tags and attributes", () => {
  const [line] = highlight('<img src="a.jpg" alt="" />', "html");
  const kinds = (line ?? []).map((token) => token.kind);
  assert.ok(kinds.includes("tag"));
  assert.ok(kinds.includes("attr"));
});

test("highlight: an unknown language is left alone", () => {
  const lines = highlight("зүгээр текст", "brainfuck");
  assert.equal(lines[0]?.[0]?.kind, "plain");
});

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
  assert.equal(formatDate(date, "en"), "11 September 2026");
});

test("format: money is grouped tögrög, and zero is a word", () => {
  assert.equal(formatMoney(149000, "mn"), "149,000₮");
  assert.equal(formatMoney(0, "mn"), "Үнэгүй");
  assert.equal(formatMoney(0, "en"), "Free");
  assert.equal(groupDigits(1234567), "1,234,567");
});

test("format: durations read as hours and minutes", () => {
  assert.equal(formatDuration(95, "mn"), "1 ц 35 мин");
  assert.equal(formatDuration(12, "en"), "12m");
});

test("format: percent cannot exceed 100 however the counts arrive", () => {
  assert.equal(percent(12, 10), 100);
  assert.equal(percent(0, 0), 0);
});

// ── Progress ─────────────────────────────────────────────────────────────────

test("progress: the next lesson is the first unfinished one", () => {
  const lessons = [
    { id: "a", slug: "a" },
    { id: "b", slug: "b" },
    { id: "c", slug: "c" },
  ];
  assert.equal(nextLesson(lessons, new Set(["a"]))?.slug, "b");
  // Everything finished: back to the start rather than a dead button.
  assert.equal(nextLesson(lessons, new Set(["a", "b", "c"]))?.slug, "a");
  assert.equal(nextLesson([], new Set()), null);
});

test("progress: an empty course is not a finished course", () => {
  assert.equal(courseStats(0, 0).finished, false);
  assert.equal(courseStats(4, 4).finished, true);
  assert.equal(courseStats(4, 2).percent, 50);
});

test("progress: a quiz is marked out of 100", () => {
  assert.equal(quizScore(3, 4), 75);
});

// ── Payments ─────────────────────────────────────────────────────────────────

test("payments: the gateway's vocabulary maps onto three states", () => {
  assert.equal(paymentState("SUCCESS"), "paid"); // what Bonum actually sends
  assert.equal(paymentState("paid"), "paid");
  assert.equal(paymentState("PENDING"), "pending");
  assert.equal(paymentState("CANCELLED"), "failed");
});

test("payments: expiry is told apart from failure", () => {
  assert.equal(toPaymentStatus("EXPIRED"), "expired");
  assert.equal(toPaymentStatus("FAILED"), "failed");
  assert.equal(toPaymentStatus("paid"), "paid");
});

test("payments: a pending invoice goes stale after its lifetime", () => {
  const old = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  assert.equal(isStalePending("pending", old), true);
  assert.equal(isStalePending("paid", old), false);
});

// ── Locale ───────────────────────────────────────────────────────────────────

test("locale: English falls back to Mongolian, never the other way", () => {
  assert.equal(localized("en", "Монгол", null), "Монгол");
  assert.equal(localized("en", "Монгол", "English"), "English");
  assert.equal(localized("mn", "Монгол", "English"), "Монгол");
  assert.equal(localized("en", "Монгол", "   "), "Монгол");
});

test("locale: a fallback block can be recognised so it can be marked lang=mn", () => {
  assert.equal(isFallback("en", null), true);
  assert.equal(isFallback("en", "English"), false);
  assert.equal(isFallback("mn", null), false);
  assert.equal(localizedOrNull("en", null, null), null);
});

test("locale: anything that is not a known code is Mongolian", () => {
  assert.equal(toLocale("ru"), "mn");
  assert.equal(toLocale(undefined), "mn");
  assert.equal(toLocale("en"), "en");
});

// ── Strings ──────────────────────────────────────────────────────────────────

test("strings: both tables have exactly the same keys, all the way down", () => {
  const walk = (value: unknown, path: string): string[] => {
    if (Array.isArray(value)) {
      return value.flatMap((item, index) => walk(item, `${path}[${index}]`));
    }
    if (value && typeof value === "object") {
      return Object.entries(value).flatMap(([key, child]) => walk(child, `${path}.${key}`));
    }
    return [path];
  };
  assert.deepEqual(walk(mn, "").sort(), walk(en, "").sort());
});

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
  walk(en, "en");
  assert.deepEqual(empties, []);
});

test("strings: fmt fills placeholders and leaves unknown ones alone", () => {
  assert.equal(fmt("{count} сургалт", { count: 4 }), "4 сургалт");
  assert.equal(fmt("{a} {b}", { a: "x" }), "x {b}");
  assert.equal(strings("en").locale, "en");
});

// ── Topic tints ──────────────────────────────────────────────────────────────

test("topics: an unknown tag still gets a stable tint", () => {
  const first = topicTint("rust");
  assert.equal(first, topicTint("rust"));
  assert.equal(topicTint("react"), "violet");
});
