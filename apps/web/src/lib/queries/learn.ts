import "server-only";
import {
  LESSON_COLUMNS,
  QUIZ_COLUMNS,
  completedIds,
  courseStats,
  nextLesson,
  toCourseCard,
  toLessonContent,
  toQuizItem,
  type CourseCard,
  type CourseModule,
  type CourseStats,
  type LessonContent,
  type Locale,
  type QuizItem,
} from "@jarvis/core";
import { createServerSupabase, getUserId, supabaseConfigured } from "@/lib/supabase/server";
import { getCourseBySlug } from "./courses";

/** A course on the learner dashboard: the card, plus where this student is in it. */
export type EnrolledCourse = CourseCard & {
  progress: CourseStats;
  lastActivity: string | null;
  nextLessonSlug: string | null;
};

export async function listMyCourses(locale: Locale): Promise<EnrolledCourse[]> {
  if (!supabaseConfigured()) return [];
  const userId = await getUserId();
  if (!userId) return [];

  const supabase = createServerSupabase();

  /*
   * The enrolments carry the courses with them.
   *
   * This embed is safe where the one in `listCourses` was not: `enrollments`
   * has a real foreign key to `courses`, and both policies are row-level on
   * tables the caller can read. An expired enrolment is filtered here rather
   * than in SQL so the "expired" case can grow a screen of its own later.
   */
  const { data: rows, error } = await supabase
    .from("enrollments")
    .select(
      "course_id, created_at, expires_at, courses!inner(id, slug, title_mn, title_en, summary_mn, summary_en, level, topic, cover_url, price_mnt, is_published)",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !rows?.length) return [];

  const live = rows.filter(
    (row) => !row.expires_at || new Date(row.expires_at).getTime() > Date.now(),
  );
  const courseIds = live.map((row) => row.course_id);
  if (courseIds.length === 0) return [];

  const [{ data: outline }, { data: progress }] = await Promise.all([
    supabase
      .from("lesson_outline")
      .select("id, course_id, slug, duration_minutes, rank")
      .in("course_id", courseIds)
      .order("rank", { ascending: true }),
    supabase
      .from("course_progress")
      .select("course_id, completed_lessons, last_activity")
      .in("course_id", courseIds),
  ]);

  const done = new Map((progress ?? []).map((row) => [row.course_id, row]));

  return live.map((row) => {
    const lessons = (outline ?? []).filter((lesson) => lesson.course_id === row.course_id);
    const stats = done.get(row.course_id);
    const totals = {
      count: lessons.length,
      minutes: lessons.reduce((sum, lesson) => sum + lesson.duration_minutes, 0),
    };

    return {
      // The same mapper the catalogue and the phone use — one definition of
      // what a course card is, including the locale fallback.
      ...toCourseCard(row.courses, locale, totals),
      progress: courseStats(totals.count, stats?.completed_lessons ?? 0),
      lastActivity: stats?.last_activity ?? null,
      nextLessonSlug: null,
    };
  });
}

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
