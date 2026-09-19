import { test } from "node:test";
import assert from "node:assert/strict";

import { parseMarkdown, excerpt } from "../src/markdown/index.ts";
import { highlight } from "../src/code/index.ts";

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

test("markdown: a diagram fence parses to steps, not to code", () => {
  const blocks = parseMarkdown("```diagram\nЧи | юу хүсэхээ бичнэ\nClaude\n\nХөтөч | биелүүлнэ\n```");
  const [block] = blocks;
  assert.equal(block?.type, "diagram");
  if (block?.type !== "diagram") return;
  // The blank line is dropped; a step without a pipe simply has no note.
  assert.deepEqual(block.steps, [
    { label: "Чи", note: "юу хүсэхээ бичнэ" },
    { label: "Claude", note: null },
    { label: "Хөтөч", note: "биелүүлнэ" },
  ]);
});

test("markdown: an empty diagram fence produces no block at all", () => {
  assert.deepEqual(parseMarkdown("```diagram\n\n```"), []);
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

test("markdown: a wrapped list item stays in the list", () => {
  const blocks = parseMarkdown(
    ["- **Видео** — үзээд ойлгох хэсэг, дараа нь", "  тэндээсээ үргэлжилнэ", "- **Унших** — тайлбар"].join(
      "\n",
    ),
  );
  assert.equal(blocks.length, 1, "the continuation became its own block");
  const list = blocks[0];
  assert.equal(list?.type, "list");
  if (list?.type !== "list") return;
  assert.equal(list.items.length, 2);
  assert.ok(
    list.items[0]?.some((part) => part.value.includes("тэндээсээ үргэлжилнэ")),
    "the wrapped tail was dropped",
  );
});

test("markdown: an unindented line after a list is a new paragraph", () => {
  const blocks = parseMarkdown(["- нэг", "- хоёр", "Энэ бол шинэ догол мөр."].join("\n"));
  assert.deepEqual(
    blocks.map((block) => block.type),
    ["list", "paragraph"],
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
