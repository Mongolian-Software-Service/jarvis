import { percent } from "./format";

/** The shape every progress calculation needs, and nothing more. */
export type ProgressMark = {
  lesson_id: string;
  completed_at: string | null;
};

export type LessonRef = {
  id: string;
  slug: string;
};

/** Lesson ids this student has finished. */
export function completedIds(marks: readonly ProgressMark[]): Set<string> {
  const done = new Set<string>();
  for (const mark of marks) if (mark.completed_at) done.add(mark.lesson_id);
  return done;
}

/**
 * Where "Үргэлжлүүлэх" should go: the first unfinished lesson in course order.
 *
 * Falls back to the first lesson — a student who has finished everything and
 * comes back should land somewhere real rather than on a dead button. Returns
 * null only when the course has no lessons at all, which the caller has to
 * handle anyway.
 */
/*
 * Generic over the lesson shape, like `resumeCourse` below: callers pass richer
 * rows — an outline with a title, a player's lesson — and want that row back,
 * not a two-field copy of it they then have to look up again.
 */
export function nextLesson<T extends LessonRef>(
  lessons: readonly T[],
  done: ReadonlySet<string>,
): T | null {
  for (const lesson of lessons) if (!done.has(lesson.id)) return lesson;
  return lessons[0] ?? null;
}

/**
 * The course to put a student back into.
 *
 * The most recently touched one they have not finished; failing that — somebody
 * who enrolled and never opened anything — the first course they hold. Never
 * nothing while they hold a course: an empty «үргэлжлүүлэх» button is a dead end
 * with a label on it.
 *
 * Generic over the course shape because the web and the phone each carry their
 * own, and the rule is the same rule. It lives here rather than in either
 * query so the two cannot drift into disagreeing about where a student left off
 * (CLAUDE.md §9).
 */
export function resumeCourse<T extends { id: string; progress: { finished: boolean } }>(
  held: readonly T[],
  lastTouchedCourseId: string | null | undefined,
): T | null {
  if (held.length === 0) return null;
  return (
    held.find((course) => course.id === lastTouchedCourseId && !course.progress.finished) ??
    held.find((course) => !course.progress.finished) ??
    held[0] ??
    null
  );
}

export type CourseStats = {
  total: number;
  completed: number;
  percent: number;
  started: boolean;
  finished: boolean;
};

export function courseStats(total: number, completed: number): CourseStats {
  const done = Math.min(completed, total);
  return {
    total,
    completed: done,
    percent: percent(done, total),
    started: done > 0,
    // An empty course is not a finished course, whatever the arithmetic says.
    finished: total > 0 && done >= total,
  };
}

/** A quiz is marked out of 100, rounded, so one shape serves every quiz length. */
export function quizScore(correct: number, total: number): number {
  return percent(correct, total);
}

/** Below this a quiz counts as not passed, and the lesson stays unfinished. */
export const QUIZ_PASS_SCORE = 60;
