import { test } from "node:test";
import assert from "node:assert/strict";

import { courseStats, nextLesson, quizScore, resumeCourse } from "../src/progress.ts";
import { paymentState, toPaymentStatus, isStalePending } from "../src/payments.ts";

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

/* The rule the web query and the phone's dashboard both call. */
const held = (id: string, finished: boolean) => ({ id, progress: { finished } });

test("progress: resume goes to the course last touched, if it is unfinished", () => {
  const courses = [held("a", false), held("b", false)];
  assert.equal(resumeCourse(courses, "b")?.id, "b");
});

test("progress: a finished course is not where you are sent back to", () => {
  const courses = [held("a", true), held("b", false)];
  assert.equal(resumeCourse(courses, "a")?.id, "b");
});

test("progress: having finished everything, you land on the first course", () => {
  const courses = [held("a", true), held("b", true)];
  assert.equal(resumeCourse(courses, "b")?.id, "a");
});

test("progress: holding nothing, there is nowhere to resume", () => {
  assert.equal(resumeCourse([], "a"), null);
  assert.equal(resumeCourse([held("a", false)], null)?.id, "a");
});
