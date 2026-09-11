import { localized, localizedOrNull, type Locale } from "./locale";
import type { CourseLevel, LessonKind } from "./courses";

/**
 * What a database row becomes, and the one place it becomes it.
 *
 * The web reads through `@supabase/ssr` on a server and the phone reads through
 * `@supabase/supabase-js` on a device, but they ask for the same columns and
 * must produce the same objects — including the locale fallback, which is the
 * rule most easily got wrong twice in two different ways.
 *
 * So the column lists and the mappers live here, and each platform supplies
 * only its own client. A screen never holds a `title_mn`.
 */

// ── The column lists ─────────────────────────────────────────────────────────
//
// `select("*")` is banned (CLAUDE.md §6.1). Naming the columns keeps the
// payload honest and makes a dropped column break here, not three screens away.

export const COURSE_COLUMNS =
  "id, slug, title_mn, title_en, summary_mn, summary_en, level, topic, cover_url, price_mnt, rank";

export const OUTLINE_COLUMNS =
  "id, course_id, module_id, slug, title_mn, title_en, kind, duration_minutes, is_preview, rank";

export const LESSON_COLUMNS =
  "id, slug, title_mn, title_en, kind, duration_minutes, video_url, body_mn, body_en, code_language, starter_code, solution_code, is_preview";

export const QUIZ_COLUMNS =
  "id, prompt_mn, prompt_en, options_mn, options_en, correct_index, explanation_mn, explanation_en, rank";

// ── The shapes ───────────────────────────────────────────────────────────────

export type CourseCard = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  level: CourseLevel;
  topic: string;
  coverUrl: string | null;
  priceMnt: number;
  lessonCount: number;
  minutes: number;
};

export type LessonOutline = {
  id: string;
  moduleId: string;
  slug: string;
  title: string;
  kind: LessonKind;
  minutes: number;
  isPreview: boolean;
};

export type CourseModule = {
  id: string;
  title: string;
  lessons: LessonOutline[];
};

export type CourseDetail = CourseCard & {
  description: string | null;
  descriptionIsFallback: boolean;
  modules: CourseModule[];
};

export type LessonContent = {
  id: string;
  slug: string;
  title: string;
  kind: LessonKind;
  minutes: number;
  videoUrl: string | null;
  body: string | null;
  bodyIsFallback: boolean;
  codeLanguage: string | null;
  starterCode: string | null;
  solutionCode: string | null;
  isPreview: boolean;
};

export type QuizItem = {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string | null;
};

// ── The rows, as narrowly as the mappers need them ───────────────────────────

type CourseRow = {
  id: string;
  slug: string;
  title_mn: string;
  title_en: string | null;
  summary_mn: string;
  summary_en: string | null;
  level: CourseLevel;
  topic: string;
  cover_url: string | null;
  price_mnt: number;
};

type OutlineRow = {
  id: string;
  module_id: string;
  slug: string;
  title_mn: string;
  title_en: string | null;
  kind: LessonKind;
  duration_minutes: number;
  is_preview: boolean;
};

type LessonRow = OutlineRow & {
  video_url: string | null;
  body_mn: string | null;
  body_en: string | null;
  code_language: string | null;
  starter_code: string | null;
  solution_code: string | null;
};

type QuizRow = {
  id: string;
  prompt_mn: string;
  prompt_en: string | null;
  options_mn: string[];
  options_en: string[] | null;
  correct_index: number;
  explanation_mn: string | null;
  explanation_en: string | null;
};

// ── The mappers ──────────────────────────────────────────────────────────────

export function toCourseCard(
  row: CourseRow,
  locale: Locale,
  totals?: { count: number; minutes: number },
): CourseCard {
  return {
    id: row.id,
    slug: row.slug,
    title: localized(locale, row.title_mn, row.title_en),
    summary: localized(locale, row.summary_mn, row.summary_en),
    level: row.level,
    topic: row.topic,
    coverUrl: row.cover_url,
    priceMnt: row.price_mnt,
    lessonCount: totals?.count ?? 0,
    minutes: totals?.minutes ?? 0,
  };
}

export function toLessonOutline(row: OutlineRow, locale: Locale): LessonOutline {
  return {
    id: row.id,
    moduleId: row.module_id,
    slug: row.slug,
    title: localized(locale, row.title_mn, row.title_en),
    kind: row.kind,
    minutes: row.duration_minutes,
    isPreview: row.is_preview,
  };
}

export function toLessonContent(row: LessonRow, locale: Locale): LessonContent {
  return {
    id: row.id,
    slug: row.slug,
    title: localized(locale, row.title_mn, row.title_en),
    kind: row.kind,
    minutes: row.duration_minutes,
    videoUrl: row.video_url,
    body: localizedOrNull(locale, row.body_mn, row.body_en),
    /* The English edition showing Mongolian has to say so, and mark the block
       `lang="mn"` — CLAUDE.md §6.3. */
    bodyIsFallback: locale === "en" && !row.body_en && Boolean(row.body_mn),
    codeLanguage: row.code_language,
    starterCode: row.starter_code,
    solutionCode: row.solution_code,
    isPreview: row.is_preview,
  };
}

export function toQuizItem(row: QuizRow, locale: Locale): QuizItem {
  return {
    id: row.id,
    prompt: localized(locale, row.prompt_mn, row.prompt_en),
    // A translated question with a different number of answers would move the
    // correct index; the database refuses to store one (§6.3), so this is safe.
    options: locale === "en" && row.options_en?.length ? row.options_en : row.options_mn,
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
  rows: readonly { course_id: string; duration_minutes: number }[],
): Map<string, { count: number; minutes: number }> {
  const totals = new Map<string, { count: number; minutes: number }>();
  for (const row of rows) {
    const current = totals.get(row.course_id) ?? { count: 0, minutes: 0 };
    current.count += 1;
    current.minutes += row.duration_minutes;
    totals.set(row.course_id, current);
  }
  return totals;
}
