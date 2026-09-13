import "server-only";
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
import { createServerSupabase, getUserId, supabaseConfigured } from "@/lib/supabase/server";
import { getCourseBySlug } from "../courses";

/**
 * The player's read — the one place a paid lesson body is fetched.
 *
 * It reads the `lessons` table rather than `lesson_outline`, which is exactly
 * the distinction §5.1 turns on: the view projects the body away so a stranger
 * may read a syllabus, and this is the query that is allowed to want it. RLS,
 * not this function, is what decides whether it comes back.
 */

export type { QuizItem } from "@jarvis/core";

export type LessonView = {
  course: { id: string; slug: string; title: string };
  modules: CourseModule[];
  lesson: LessonContent | null;
  /** The lesson exists in the syllabus but the policy would not hand it over. */
  locked: boolean;
  quiz: QuizItem[];
  previous: { slug: string; title: string } | null;
  next: { slug: string; title: string } | null;
  completed: string[];
  /** This lesson's own row, for the video's resume point and the tick. */
  progress: { completed: boolean; secondsWatched: number };
  hasAccess: boolean;
};

/**
 * Everything one lesson screen needs, in one place.
 *
 * The locked case is the interesting one. The policy on `lessons` withholds the
 * row itself — body, video, solution — for a course the caller has not paid
 * for, so "not readable" comes back as no row, which is indistinguishable from
 * "no such lesson" unless we check the syllabus separately. The syllabus comes
 * from `lesson_outline`, which everyone may read, so a locked lesson can be
 * told apart from a typo and shown the right screen.
 */
export async function getLessonView(
  courseSlug: string,
  lessonSlug: string,
  locale: Locale,
): Promise<LessonView | null> {
  if (!supabaseConfigured()) return null;

  const detail = await getCourseBySlug(courseSlug, locale);
  if (!detail) return null;

  const supabase = createServerSupabase();
  const userId = await getUserId();

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

  // Neither the syllabus nor the table has it: that is a 404, not a paywall.
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

/**
 * Which lessons of a course this student has finished.
 *
 * The course screen needs one tick per row and nothing else, so it asks for
 * exactly that rather than calling `getLessonView` — which fetches a lesson,
 * its quiz and its neighbours to answer a question about the list.
 */
export async function completedLessonIds(courseId: string): Promise<Set<string>> {
  if (!supabaseConfigured()) return new Set();
  const userId = await getUserId();
  if (!userId) return new Set();

  const supabase = createServerSupabase();
  const { data } = await supabase
    .from("lesson_progress")
    .select("lesson_id, completed_at")
    .eq("course_id", courseId);

  return completedIds(data ?? []);
}

/** Which lesson "Үргэлжлүүлэх" should open for this course. */
export async function resumeLessonSlug(courseSlug: string, locale: Locale): Promise<string | null> {
  const detail = await getCourseBySlug(courseSlug, locale);
  if (!detail) return null;

  const ordered = detail.modules.flatMap((section) => section.lessons);
  if (ordered.length === 0) return null;

  const userId = await getUserId();
  if (!userId) return ordered[0]?.slug ?? null;

  const supabase = createServerSupabase();
  const { data } = await supabase
    .from("lesson_progress")
    .select("lesson_id, completed_at")
    .eq("course_id", detail.id);

  return nextLesson(ordered, completedIds(data ?? []))?.slug ?? null;
}
