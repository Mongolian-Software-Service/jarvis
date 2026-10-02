import { test } from "node:test";
import assert from "node:assert/strict";

import { fieldErrors, passwordSchema } from "../src/schemas/index.ts";
import { mn } from "../src/strings/index.ts";

// ── Password change ──────────────────────────────────────────────────────────

const copy = mn.auth.password.validation;

function errors(input: { current: string; next: string; confirm: string }) {
  const parsed = passwordSchema(copy).safeParse(input);
  return parsed.success ? {} : fieldErrors(parsed.error);
}

test("password: a good change passes", () => {
  assert.deepEqual(errors({ current: "old-secret", next: "new-secret", confirm: "new-secret" }), {});
});

test("password: the current one is required", () => {
  assert.equal(errors({ current: "", next: "new-secret", confirm: "new-secret" }).current, copy.current);
});

test("password: eight to seventy-two, the same bounds as sign-up", () => {
  assert.equal(errors({ current: "old-secret", next: "short", confirm: "short" }).next, copy.next);
  const long = "x".repeat(73);
  assert.equal(errors({ current: "old-secret", next: long, confirm: long }).next, copy.next);
});

test("password: the repeat is reported under the repeat", () => {
  const result = errors({ current: "old-secret", next: "new-secret", confirm: "new-secrex" });
  assert.equal(result.confirm, copy.mismatch);
  assert.equal(result.next, undefined);
});

test("password: the new one has to be new", () => {
  assert.equal(errors({ current: "same-secret", next: "same-secret", confirm: "same-secret" }).next, copy.same);
});
