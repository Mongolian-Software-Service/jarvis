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
export function nextLesson(lessons: readonly LessonRef[], done: ReadonlySet<string>): LessonRef | null {
  for (const lesson of lessons) if (!done.has(lesson.id)) return lesson;
  return lessons[0] ?? null;
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
