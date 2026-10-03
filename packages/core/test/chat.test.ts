import { test } from "node:test";
import assert from "node:assert/strict";

import { chatMessageSchema, formatChatDay, formatClock, toChatMessage } from "../src/chat.ts";
import { mn } from "../src/strings/index.ts";

// ── One clock for server and browser ─────────────────────────────────────────

test("chat clock: Ulaanbaatar time, whatever the machine's zone", () => {
  assert.equal(formatClock("2026-10-03T07:42:00Z"), "15:42");
  assert.equal(formatClock("2026-10-03T16:05:00Z"), "00:05");
  assert.equal(formatClock("not a date"), "");
});

test("chat day: the calendar day in Ulaanbaatar, not in UTC", () => {
  // 20:00 UTC on the 2nd is already 04:00 on the 3rd in Ulaanbaatar.
  assert.equal(formatChatDay("2026-10-02T20:00:00Z"), "2026 оны 10-р сарын 3");
  assert.equal(formatChatDay("2026-10-02T10:00:00Z"), "2026 оны 10-р сарын 2");
});

// ── A row becomes a message ──────────────────────────────────────────────────

test("chat row: the author is printed the showcase's way", () => {
  const message = toChatMessage(
    {
      id: "a",
      body: "Сайн уу",
      author_first_name: "Тэмүүлэн",
      author_initial: "б",
      is_team: true,
      is_teacher: true,
      created_at: "2026-10-03T07:42:00Z",
    },
    false,
  );
  assert.equal(message?.author, "Б.Тэмүүлэн");
  assert.equal(message?.isTeam, true);
  assert.equal(message?.isTeacher, true);
  assert.equal(message?.isMine, false);
});

test("chat row: no id, body or time is no message", () => {
  const base = { author_first_name: null, author_initial: null, is_team: null, is_teacher: null };
  assert.equal(
    toChatMessage({ ...base, id: null, body: "x", created_at: "2026-10-03" }, false),
    null,
  );
  assert.equal(
    toChatMessage({ ...base, id: "a", body: null, created_at: "2026-10-03" }, false),
    null,
  );
});

// ── What may be sent ─────────────────────────────────────────────────────────

const copy = mn.ask.errors;

test("chat message: trimmed, never empty, at most 2000", () => {
  assert.deepEqual(chatMessageSchema(copy).parse({ body: "  асуулт  " }), { body: "асуулт" });
  assert.equal(chatMessageSchema(copy).safeParse({ body: "   " }).success, false);
  assert.equal(chatMessageSchema(copy).safeParse({ body: "x".repeat(2001) }).success, false);
});
