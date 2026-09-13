import "server-only";
import {
  COURSE_COLUMNS,
  OUTLINE_COLUMNS,
  lessonTotals,
  localizedOrNull,
  toCourseCard,
  toLessonOutline,
  type CourseDetail,
  type CourseModule,
  type Locale,
} from "@jarvis/core";
import { createServerSupabase, supabaseConfigured } from "@/lib/supabase/server";

/**
 * Reading courses.
 *
 * Every function takes the locale explicitly — there is no ambient one — and
 * returns a shape with the bilingual columns already resolved, so no component
 * holds a `title_mn` and has to remember the fallback rule.
 *
 * The column lists and the row→shape mappers come from `@jarvis/core`, because
 * `apps/mobile` asks the same database the same questions and has to get back
 * the same objects. Only the client differs.
 */

export type { CourseCard, CourseDetail, CourseModule, LessonOutline } from "@jarvis/core";

/**
 * Lesson counts and running times, for a set of courses.
 *
 * Read from `lesson_outline`, never from `lessons`: the policy on `lessons`
 * hides rows a visitor has not paid for, so counting there would tell an
 * anonymous visitor a ten-lesson course has two.
 *
 * A second round trip rather than an embedded aggregate — `courses(…,
 * lesson_outline(count))` depends on PostgREST inferring a relationship for a
 * view, which is a thing that works until it quietly does not. This school has
 * tens of lessons, not millions.
 */
async function totalsFor(courseIds: string[]) {
  if (courseIds.length === 0) return new Map<string, { count: number; minutes: number }>();

  const supabase = createServerSupabase();
  const { data } = await supabase
    .from("lesson_outline")
    .select("course_id, duration_minutes")
    .in("course_id", courseIds);

  return lessonTotals(data ?? []);
}

/** Published courses, in the order the team put them in. */
export async function listCourses(locale: Locale) {
  if (!supabaseConfigured()) return [];
  const supabase = createServerSupabase();

  const { data, error } = await supabase
    .from("courses")
    .select(COURSE_COLUMNS)
    .eq("is_published", true)
    .order("rank", { ascending: true });

  if (error || !data) return [];

  const totals = await totalsFor(data.map((row) => row.id));
  return data.map((row) => toCourseCard(row, locale, totals.get(row.id)));
}

/** One course with its syllabus. Returns null for a slug nobody may read. */
export async function getCourseBySlug(slug: string, locale: Locale): Promise<CourseDetail | null> {
  if (!supabaseConfigured()) return null;
  const supabase = createServerSupabase();

  const { data: course, error } = await supabase
    .from("courses")
    .select(`${COURSE_COLUMNS}, description_mn, description_en, is_published`)
    .eq("slug", slug)
    .maybeSingle();

  // A draft is invisible to everyone but an admin — and to an admin the policy
  // returns it, which is how the preview link in the editor works.
  if (error || !course) return null;

  const [{ data: modules }, { data: outline }] = await Promise.all([
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

  /*
   * A draft course has no rows in `lesson_outline` — the view filters to
   * published courses. So for an admin previewing a draft, fall back to the
   * table, which their own policy lets them read in full.
   */
  const lessons = outline?.length
    ? outline
    : ((
        await supabase
          .from("lessons")
          .select(OUTLINE_COLUMNS)
          .eq("course_id", course.id)
          .order("rank", { ascending: true })
      ).data ?? []);

  const grouped: CourseModule[] = (modules ?? []).map((section) => ({
    id: section.id,
    title: localizedOrNull(locale, section.title_mn, section.title_en) ?? section.title_mn,
    lessons: lessons
      .filter((lesson) => lesson.module_id === section.id)
      .map((lesson) => toLessonOutline(lesson, locale)),
  }));

  const card = toCourseCard(course, locale, {
    count: lessons.length,
    minutes: lessons.reduce((sum, lesson) => sum + (lesson.duration_minutes ?? 0), 0),
  });

  return {
    ...card,
    description: localizedOrNull(locale, course.description_mn, course.description_en),
    /* One language — see `isFallback` in core. */
    descriptionIsFallback: false,
    modules: grouped,
  };
}

/** Does the signed-in caller hold this course? Answered by the database. */
export async function hasCourseAccess(courseId: string): Promise<boolean> {
  if (!supabaseConfigured()) return false;
  const supabase = createServerSupabase();
  const { data, error } = await supabase.rpc("has_course_access", { course: courseId });
  if (error) return false;
  return data === true;
}

/**
 * Does the caller hold every published course?
 *
 * The bundle is not a thing anybody owns — it is a way of buying. So "has the
 * bundle" is asked as "is there a published course they are not enrolled in",
 * which stays true when a sixth course is added: they do not, until it is
 * granted. That is the honest answer, and the one the buy button needs.
 */
export async function hasEveryCourse(): Promise<boolean> {
  if (!supabaseConfigured()) return false;
  const supabase = createServerSupabase();

  const [{ data: courses }, { data: mine }] = await Promise.all([
    supabase.from("courses").select("id").eq("is_published", true),
    supabase.from("enrollments").select("course_id, expires_at"),
  ]);

  if (!courses?.length) return false;

  const live = new Set(
    (mine ?? [])
      .filter((row) => !row.expires_at || new Date(row.expires_at).getTime() > Date.now())
      .map((row) => row.course_id),
  );
  return courses.every((course) => live.has(course.id));
}

/** Every published slug, for the sitemap. */
export async function listCourseSlugs(): Promise<string[]> {
  if (!supabaseConfigured()) return [];
  const supabase = createServerSupabase();
  const { data } = await supabase.from("courses").select("slug").eq("is_published", true);
  return (data ?? []).map((row) => row.slug);
}
