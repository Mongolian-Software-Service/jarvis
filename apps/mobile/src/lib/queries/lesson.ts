import {
  LESSON_COLUMNS,
  QUIZ_COLUMNS,
  completedIds,
  nextLesson,
  toLessonContent,
  toQuizItem,
  type CourseModule,
  type LessonContent,
  type Locale,
  type QuizItem,
} from "@jarvis/core";
import { supabase } from "../supabase";
import { getCourse } from "./catalogue";

/**
 * The player's read — the only one that asks for a paid lesson body.
 *
 * It reads the `lessons` table rather than `lesson_outline`, which is the
 * distinction §5.1 turns on. RLS, not this function, decides whether the body
 * comes back.
 */

export type LessonView = {
  course: { id: string; slug: string; title: string };
  modules: CourseModule[];
  lesson: LessonContent | null;
  locked: boolean;
  quiz: QuizItem[];
  previous: { slug: string; title: string } | null;
  next: { slug: string; title: string } | null;
  completed: string[];
  progress: { completed: boolean; secondsWatched: number };
  hasAccess: boolean;
};

/**
 * One lesson screen's worth of data.
 *
 * The locked case is why the syllabus and the lesson are fetched separately:
 * the policy withholds the whole row for a course nobody paid for, so "not
 * readable" arrives as no row — indistinguishable from "no such lesson" unless
 * the outline is asked as well.
 */
export async function getLesson(
  courseSlug: string,
  lessonSlug: string,
  locale: Locale,
  userId: string | null,
): Promise<LessonView | null> {
  const detail = await getCourse(courseSlug, locale);
  if (!detail) return null;

  const ordered = detail.modules.flatMap((section) => section.lessons);
  const index = ordered.findIndex((lesson) => lesson.slug === lessonSlug);
  const outlineEntry = index === -1 ? null : ordered[index];

  const [{ data: row }, { data: marks }, { data: access }] = await Promise.all([
    supabase
      .from("lessons")
      .select(LESSON_COLUMNS)
      .eq("course_id", detail.id)
      .eq("slug", lessonSlug)
      .maybeSingle(),
    userId
      ? supabase
          .from("lesson_progress")
          .select("lesson_id, completed_at, seconds_watched")
          .eq("course_id", detail.id)
      : Promise.resolve({
          data: [] as { lesson_id: string; completed_at: string | null; seconds_watched: number }[],
        }),
    supabase.rpc("has_course_access", { course: detail.id }),
  ]);

  if (!row && !outlineEntry) return null;

  const quiz: QuizItem[] =
    row?.kind === "quiz"
      ? (
          (
            await supabase
              .from("quiz_questions")
              .select(QUIZ_COLUMNS)
              .eq("lesson_id", row.id)
              .order("rank", { ascending: true })
          ).data ?? []
        ).map((question) => toQuizItem(question, locale))
      : [];

  const mark = row ? (marks ?? []).find((entry) => entry.lesson_id === row.id) : undefined;
  const previous = index > 0 ? ordered[index - 1] : null;
  const following = index >= 0 && index < ordered.length - 1 ? ordered[index + 1] : null;

  return {
    course: { id: detail.id, slug: detail.slug, title: detail.title },
    modules: detail.modules,
    lesson: row ? toLessonContent({ ...row, module_id: "" }, locale) : null,
    locked: !row && Boolean(outlineEntry),
    quiz,
    previous: previous ? { slug: previous.slug, title: previous.title } : null,
    next: following ? { slug: following.slug, title: following.title } : null,
    completed: [...completedIds(marks ?? [])],
    progress: {
      completed: Boolean(mark?.completed_at),
      secondsWatched: mark?.seconds_watched ?? 0,
    },
    hasAccess: access === true,
  };
}

/** Where "Үргэлжлүүлэх" goes: the first unfinished lesson, in course order. */
export async function resumeLesson(courseSlug: string, locale: Locale): Promise<string | null> {
  const detail = await getCourse(courseSlug, locale);
  if (!detail) return null;

  const ordered = detail.modules.flatMap((section) => section.lessons);
  if (ordered.length === 0) return null;

  const { data } = await supabase
    .from("lesson_progress")
    .select("lesson_id, completed_at")
    .eq("course_id", detail.id);

  return nextLesson(ordered, completedIds(data ?? []))?.slug ?? null;
}
