/**
 * What a row is on the way in, and what it becomes on the way out.
 *
 * The row types are as narrow as the mappers need — not the generated table
 * types — so a mapper can be handed a row from a table or from a view without
 * either app widening anything.
 */
import type { CourseLevel, LessonKind } from "../courses";

// ── The shapes ───────────────────────────────────────────────────────────────

export type CourseCard = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  level: CourseLevel;
  topic: string;
  coverUrl: string | null;
  /** Free to anyone signed in. Everything else opens with the bundle (§1). */
  isFree: boolean;
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

export type CourseRow = {
  id: string;
  slug: string;
  title_mn: string;
  title_en: string | null;
  summary_mn: string;
  summary_en: string | null;
  level: CourseLevel;
  topic: string;
  cover_url: string | null;
  is_free: boolean;
};

/**
 * Every field is nullable, and that is not sloppiness.
 *
 * `lesson_outline` is a view, and Postgres does not carry NOT NULL through one
 * — so the generated types mark every column of it nullable, even though it
 * projects from columns that are all NOT NULL. The mappers below take the
 * nullable shape and coerce, in one place, rather than each of the two apps
 * doing it at every call site. A non-null value is assignable to this, so rows
 * read from the `lessons` table fit it unchanged.
 */
export type OutlineRow = {
  id: string | null;
  module_id: string | null;
  slug: string | null;
  title_mn: string | null;
  title_en: string | null;
  kind: LessonKind | null;
  duration_minutes: number | null;
  is_preview: boolean | null;
};

export type LessonRow = OutlineRow & {
  video_url: string | null;
  body_mn: string | null;
  body_en: string | null;
  code_language: string | null;
  starter_code: string | null;
  solution_code: string | null;
};

export type QuizRow = {
  id: string;
  prompt_mn: string;
  prompt_en: string | null;
  options_mn: string[];
  options_en: string[] | null;
  correct_index: number;
  explanation_mn: string | null;
  explanation_en: string | null;
};
