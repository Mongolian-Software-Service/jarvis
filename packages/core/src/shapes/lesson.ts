/**
 * Lesson and quiz rows, and the arithmetic over a list of them.
 *
 * `lessonTotals` lives here rather than in `progress.ts` because it counts what
 * a syllabus holds, not what a student has done with it.
 */
import { localized, localizedOrNull, type Locale } from "../locale";
import type {
  LessonContent,
  LessonOutline,
  LessonRow,
  OutlineRow,
  QuizItem,
  QuizRow,
} from "./types";

export function toLessonOutline(row: OutlineRow, locale: Locale): LessonOutline {
  return {
    id: row.id ?? "",
    moduleId: row.module_id ?? "",
    slug: row.slug ?? "",
    title: localized(locale, row.title_mn ?? "", row.title_en),
    kind: row.kind ?? "text",
    minutes: row.duration_minutes ?? 0,
    isPreview: row.is_preview ?? false,
  };
}

export function toLessonContent(row: LessonRow, locale: Locale): LessonContent {
  return {
    id: row.id ?? "",
    slug: row.slug ?? "",
    title: localized(locale, row.title_mn ?? "", row.title_en),
    kind: row.kind ?? "text",
    minutes: row.duration_minutes ?? 0,
    videoUrl: row.video_url,
    body: localizedOrNull(locale, row.body_mn, row.body_en),
    /* One language, so nothing is ever shown in the wrong one. Kept as a field
       because the renderers still ask, and would have to be found again. */
    bodyIsFallback: false,
    codeLanguage: row.code_language,
    starterCode: row.starter_code,
    solutionCode: row.solution_code,
    isPreview: row.is_preview ?? false,
  };
}

export function toQuizItem(row: QuizRow, locale: Locale): QuizItem {
  return {
    id: row.id,
    prompt: localized(locale, row.prompt_mn, row.prompt_en),
    // A translated question with a different number of answers would move the
    // correct index; the database refuses to store one (§6.3), so this is safe.
    options: row.options_mn,
    correctIndex: row.correct_index,
    explanation: localizedOrNull(locale, row.explanation_mn, row.explanation_en),
  };
}

/**
 * Lesson counts and running times, grouped by course.
 *
 * Fed from `lesson_outline`, never from `lessons`: the policy on that table
 * hides rows a visitor has not paid for, so counting there tells an anonymous
 * visitor a ten-lesson course has two.
 */
export function lessonTotals(
  rows: readonly { course_id: string | null; duration_minutes: number | null }[],
): Map<string, { count: number; minutes: number }> {
  const totals = new Map<string, { count: number; minutes: number }>();
  for (const row of rows) {
    if (!row.course_id) continue;
    const current = totals.get(row.course_id) ?? { count: 0, minutes: 0 };
    current.count += 1;
    current.minutes += row.duration_minutes ?? 0;
    totals.set(row.course_id, current);
  }
  return totals;
}
