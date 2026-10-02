import { test } from "node:test";
import assert from "node:assert/strict";

import {
  authorName,
  normalizeProjectUrl,
  projectDisplayUrl,
  projectHost,
} from "../src/projects.ts";
import { fieldErrors, projectSchema } from "../src/schemas/index.ts";
import { mn } from "../src/strings/index.ts";

// ── What counts as an address ────────────────────────────────────────────────

test("project url: a bare host gets https in front of it", () => {
  assert.equal(normalizeProjectUrl("minii-huudas.vercel.app"), "https://minii-huudas.vercel.app/");
  assert.equal(normalizeProjectUrl("  Example.COM/shop  "), "https://example.com/shop");
});

test("project url: http and https are kept as typed", () => {
  assert.equal(normalizeProjectUrl("http://example.com/a?b=1"), "http://example.com/a?b=1");
  assert.equal(normalizeProjectUrl("https://example.com"), "https://example.com/");
});

test("project url: a Cyrillic domain is stored as punycode", () => {
  assert.equal(normalizeProjectUrl("тест.мон"), "https://xn--e1aybc.xn--l1acc/");
});

test("project url: nothing a browser would run instead of open", () => {
  assert.equal(normalizeProjectUrl("javascript:alert(1)"), null);
  assert.equal(normalizeProjectUrl("JavaScript://example.com/%0aalert(1)"), null);
  assert.equal(normalizeProjectUrl("data:text/html,<script>1</script>"), null);
  assert.equal(normalizeProjectUrl("ftp://example.com"), null);
});

test("project url: no credentials, which would make it name a different site", () => {
  assert.equal(normalizeProjectUrl("mailto:me@example.com"), null);
  assert.equal(normalizeProjectUrl("https://user:pass@example.com"), null);
});

test("project url: a host somebody else can reach", () => {
  assert.equal(normalizeProjectUrl(""), null);
  assert.equal(normalizeProjectUrl("localhost:3000"), null);
  assert.equal(normalizeProjectUrl("http://127.0.0.1:3000"), null);
  assert.equal(normalizeProjectUrl("my page"), null);
  assert.equal(normalizeProjectUrl(`https://example.com/${"a".repeat(500)}`), null);
});

test("project host: no scheme, no www, no path", () => {
  assert.equal(projectHost("https://www.example.com/shop/"), "example.com");
  assert.equal(projectHost("https://minii-huudas.vercel.app/"), "minii-huudas.vercel.app");
  assert.equal(projectHost("not a url"), "not a url");
});

test("display url: host and path, no scheme, no slash, no query", () => {
  assert.equal(projectDisplayUrl("https://www.example.com/"), "example.com");
  assert.equal(projectDisplayUrl("https://site.mn/shop/?utm_source=x"), "site.mn/shop");
  assert.equal(projectDisplayUrl("https://site.mn/%D0%BC%D0%B0"), "site.mn/ма");
});

// ── Whose it is ──────────────────────────────────────────────────────────────

test("author: the initial of the овог, then the given name", () => {
  assert.equal(authorName("Тэмүүлэн", "б"), "Б.Тэмүүлэн");
  assert.equal(authorName(" Тэмүүлэн ", "Ө"), "Ө.Тэмүүлэн");
});

test("author: no initial, just the name; no name, nothing", () => {
  assert.equal(authorName("Тэмүүлэн", null), "Тэмүүлэн");
  assert.equal(authorName(null, "Б"), null);
  assert.equal(authorName("  ", "Б"), null);
});

// ── The form ─────────────────────────────────────────────────────────────────

const copy = mn.learn.projects.validation;

test("project form: parses to what the column stores", () => {
  const parsed = projectSchema(copy).parse({
    url: "site.mn",
    title: "  ",
    description: "  Next.js, Supabase\n",
  });
  assert.deepEqual(parsed, {
    url: "https://site.mn/",
    title: null,
    description: "Next.js, Supabase",
  });
});

test("project form: each message lands under its own field", () => {
  const parsed = projectSchema(copy).safeParse({
    url: "javascript:alert(1)",
    title: "x".repeat(81),
    description: "x".repeat(501),
  });
  assert.equal(parsed.success, false);
  if (parsed.success) return;
  assert.deepEqual(fieldErrors(parsed.error), {
    url: copy.url,
    title: copy.title,
    description: copy.description,
  });
});
