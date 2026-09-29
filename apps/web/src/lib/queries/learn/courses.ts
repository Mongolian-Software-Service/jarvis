import "server-only";
import { courseStats, toCourseCard, type CourseCard, type CourseStats, type Locale } from "@jarvis/core";
import { createServerSupabase, getUserId, supabaseConfigured } from "@/lib/supabase/server";

/** What «Миний сургалт» draws: the cards this student owns, each with its progress. */

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
  /*
   * ⚠️ Ordered by the COURSE's rank, not by when the enrolment was written.
   *
   * `created_at desc` looked reasonable and was not: the bundle enrols somebody
   * in every published course **in one statement** (§6.7), so all six rows
   * carry the same timestamp. Sorting on a value six rows share asks Postgres
   * to break the tie however it likes — and it may break it differently on the
   * next request, so a student's own list could reorder itself between visits.
   *
   * `courses.rank` is the order the school teaches in: intro, then the basics,
   * then the tracks. A student's list is the same list as the catalogue,
   * already paid for — and «Танилцуулга» belongs at the top of both.
   *
   * Sorted here rather than in the query: ordering the *parent* rows by a
   * column on a to-one embed is a PostgREST version question, and this list is
   * six rows. A sort nobody has to check the server's version to trust is
   * worth more than the one it saves.
   */
  const { data: rows, error } = await supabase
    .from("enrollments")
    .select(
      "course_id, created_at, expires_at, courses!inner(id, slug, title_mn, title_en, summary_mn, summary_en, level, topic, cover_url, is_free, is_published, rank)",
    )
    .eq("user_id", userId);

  if (error || !rows?.length) return [];

  const live = rows
    .filter((row) => !row.expires_at || new Date(row.expires_at).getTime() > Date.now())
    .sort((a, b) => (a.courses.rank ?? 0) - (b.courses.rank ?? 0));
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
      minutes: lessons.reduce((sum, lesson) => sum + (lesson.duration_minutes ?? 0), 0),
    };

    return {
      // The same mapper the catalogue and the admin console use — one
      // definition of what a course card is, including the locale fallback.
      ...toCourseCard(row.courses, locale, totals),
      progress: courseStats(totals.count, stats?.completed_lessons ?? 0),
      lastActivity: stats?.last_activity ?? null,
      nextLessonSlug: null,
    };
  });
}
