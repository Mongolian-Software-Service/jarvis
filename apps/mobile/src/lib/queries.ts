import {
  COURSE_COLUMNS,
  LESSON_COLUMNS,
  OUTLINE_COLUMNS,
  QUIZ_COLUMNS,
  completedIds,
  courseStats,
  lessonTotals,
  localizedOrNull,
  nextLesson,
  toCourseCard,
  toLessonContent,
  toLessonOutline,
  toQuizItem,
  type CourseCard,
  type CourseDetail,
  type CourseModule,
  type CourseStats,
  type LessonContent,
  type Locale,
  type QuizItem,
} from "@jarvis/core";
import { supabase, supabaseConfigured } from "./supabase";

/**
 * The phone's reads.
 *
 * Same database, same policies, same columns as `apps/web/src/lib/queries` —
 * and the same row→shape mappers, imported from `@jarvis/core`, so a course
 * card is assembled once for both platforms. What differs is only the client:
 * the web's carries a cookie session and a React cache, this one carries a
 * keychain session and no cache.
 *
 * Nothing here decides what may be read. RLS does that, and the phone holds a
 * publishable key exactly like a browser does.
 */

export async function listCourses(locale: Locale): Promise<CourseCard[]> {
  if (!supabaseConfigured()) return [];

  const { data, error } = await supabase
    .from("courses")
    .select(COURSE_COLUMNS)
    .eq("is_published", true)
    .order("rank", { ascending: true });

  if (error || !data) return [];

  const { data: outline } = await supabase
    .from("lesson_outline")
    .select("course_id, duration_minutes")
    .in(
      "course_id",
      data.map((row) => row.id),
    );

  const totals = lessonTotals(outline ?? []);
  return data.map((row) => toCourseCard(row, locale, totals.get(row.id)));
}

export async function getCourse(slug: string, locale: Locale): Promise<CourseDetail | null> {
  if (!supabaseConfigured()) return null;

  const { data: course } = await supabase
    .from("courses")
    .select(`${COURSE_COLUMNS}, description_mn, description_en`)
    .eq("slug", slug)
    .maybeSingle();

  if (!course) return null;

  const [{ data: modules }, { data: lessons }] = await Promise.all([
    supabase
      .from("modules")
      .select("id, title_mn, title_en, rank")
      .eq("course_id", course.id)
      .order("rank", { ascending: true }),
    supabase
      .from("lesson_outline")
      .select(OUTLINE_COLUMNS)
      .eq("course_id", course.id)
      .order("rank", { ascending: true }),
  ]);

  const rows = lessons ?? [];
  const grouped: CourseModule[] = (modules ?? []).map((section) => ({
    id: section.id,
    title: localizedOrNull(locale, section.title_mn, section.title_en) ?? section.title_mn,
    lessons: rows
      .filter((lesson) => lesson.module_id === section.id)
      .map((lesson) => toLessonOutline(lesson, locale)),
  }));

  const card = toCourseCard(course, locale, {
    count: rows.length,
    minutes: rows.reduce((sum, lesson) => sum + lesson.duration_minutes, 0),
  });

  return {
    ...card,
    description: localizedOrNull(locale, course.description_mn, course.description_en),
    descriptionIsFallback:
      locale === "en" && !course.description_en && Boolean(course.description_mn),
    modules: grouped,
  };
}

export async function hasAccess(courseId: string): Promise<boolean> {
  if (!supabaseConfigured()) return false;
  const { data } = await supabase.rpc("has_course_access", { course: courseId });
  return data === true;
}

export type EnrolledCourse = CourseCard & {
  progress: CourseStats;
  lastActivity: string | null;
};

export async function listMyCourses(locale: Locale, userId: string): Promise<EnrolledCourse[]> {
  if (!supabaseConfigured()) return [];

  const { data: rows } = await supabase
    .from("enrollments")
    .select(`course_id, expires_at, created_at, courses!inner(${COURSE_COLUMNS})`)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  const live = (rows ?? []).filter(
    (row) => !row.expires_at || new Date(row.expires_at).getTime() > Date.now(),
  );
  if (live.length === 0) return [];

  const courseIds = live.map((row) => row.course_id);

  const [{ data: outline }, { data: progress }] = await Promise.all([
    supabase.from("lesson_outline").select("course_id, duration_minutes").in("course_id", courseIds),
    supabase
      .from("course_progress")
      .select("course_id, completed_lessons, last_activity")
      .in("course_id", courseIds),
  ]);

  const totals = lessonTotals(outline ?? []);
  const done = new Map((progress ?? []).map((row) => [row.course_id, row]));

  return live.map((row) => {
    const total = totals.get(row.course_id);
    const stats = done.get(row.course_id);
    return {
      ...toCourseCard(row.courses, locale, total),
      progress: courseStats(total?.count ?? 0, stats?.completed_lessons ?? 0),
      lastActivity: stats?.last_activity ?? null,
    };
  });
}

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

// ── Writes ───────────────────────────────────────────────────────────────────

export async function setProgress(input: {
  userId: string;
  lessonId: string;
  completed: boolean;
  secondsWatched?: number;
  quizScore?: number | null;
}): Promise<boolean> {
  const { error } = await supabase.from("lesson_progress").upsert(
    {
      user_id: input.userId,
      lesson_id: input.lessonId,
      completed_at: input.completed ? new Date().toISOString() : null,
      seconds_watched: input.secondsWatched ?? 0,
      quiz_score: input.quizScore ?? null,
    },
    { onConflict: "user_id,lesson_id" },
  );
  return !error;
}

/**
 * Take a free course.
 *
 * Everything that makes this safe is in the policy: you may only enrol
 * yourself, only in a published course that costs nothing, and the row must say
 * `free`. The price is never read here and then trusted.
 */
export async function enrollFree(userId: string, courseId: string): Promise<boolean> {
  const { error } = await supabase
    .from("enrollments")
    .insert({ user_id: userId, course_id: courseId, source: "free" });
  // Already enrolled is not a failure — somebody tapped twice.
  return !error || error.code === "23505";
}
