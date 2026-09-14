import {
  COURSE_COLUMNS,
  OUTLINE_COLUMNS,
  lessonTotals,
  localizedOrNull,
  toCourseCard,
  toLessonOutline,
  type CourseCard,
  type CourseDetail,
  type CourseModule,
  type Locale,
} from "@jarvis/core";
import { supabase, supabaseConfigured } from "../supabase";

/** What anybody may read: the catalogue and a course's syllabus. */

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
    minutes: rows.reduce((sum, lesson) => sum + (lesson.duration_minutes ?? 0), 0),
  });

  return {
    ...card,
    description: localizedOrNull(locale, course.description_mn, course.description_en),
    /* One language — see `isFallback` in core. */
    descriptionIsFallback: false,
    modules: grouped,
  };
}

export async function hasAccess(courseId: string): Promise<boolean> {
  if (!supabaseConfigured()) return false;
  const { data } = await supabase.rpc("has_course_access", { course: courseId });
  return data === true;
}
