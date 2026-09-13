import "server-only";
import type { CourseLevel, LessonKind } from "@jarvis/core";
import { createServerSupabase, supabaseConfigured } from "@/lib/supabase/server";

/**
 * What the course and lesson editors read.
 *
 * These deliberately return the raw bilingual columns rather than the resolved
 * shapes the site uses: the console edits `title_mn`, so a mapper that picked
 * one language for it would hide the field being edited.
 */

export type AdminCourseRow = {
  id: string;
  slug: string;
  title: string;
  level: CourseLevel;
  topic: string;
  isFree: boolean;
  published: boolean;
  lessons: number;
  students: number;
};

export async function listAdminCourses(): Promise<AdminCourseRow[]> {
  if (!supabaseConfigured()) return [];
  const supabase = createServerSupabase();

  const [courses, lessons, enrollments] = await Promise.all([
    supabase
      .from("courses")
      .select("id, slug, title_mn, level, topic, is_free, is_published, rank")
      .order("rank", { ascending: true }),
    // An admin's policy returns every lesson, so this count is the real one.
    supabase.from("lessons").select("id, course_id"),
    supabase.from("enrollments").select("id, course_id"),
  ]);

  const lessonCount = new Map<string, number>();
  for (const row of lessons.data ?? []) {
    lessonCount.set(row.course_id, (lessonCount.get(row.course_id) ?? 0) + 1);
  }
  const studentCount = new Map<string, number>();
  for (const row of enrollments.data ?? []) {
    studentCount.set(row.course_id, (studentCount.get(row.course_id) ?? 0) + 1);
  }

  return (courses.data ?? []).map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title_mn,
    level: row.level,
    topic: row.topic,
    isFree: row.is_free,
    published: row.is_published,
    lessons: lessonCount.get(row.id) ?? 0,
    students: studentCount.get(row.id) ?? 0,
  }));
}

export type AdminCourse = {
  id: string;
  slug: string;
  title_mn: string;
  title_en: string | null;
  summary_mn: string;
  summary_en: string | null;
  description_mn: string | null;
  description_en: string | null;
  level: CourseLevel;
  topic: string;
  cover_url: string | null;
  is_free: boolean;
  is_published: boolean;
  rank: number;
  modules: {
    id: string;
    title_mn: string;
    title_en: string | null;
    rank: number;
    lessons: {
      id: string;
      slug: string;
      title_mn: string;
      kind: LessonKind;
      duration_minutes: number;
      is_preview: boolean;
      rank: number;
    }[];
  }[];
};

export async function getAdminCourse(id: string): Promise<AdminCourse | null> {
  if (!supabaseConfigured()) return null;
  const supabase = createServerSupabase();

  const { data: course } = await supabase
    .from("courses")
    .select(
      "id, slug, title_mn, title_en, summary_mn, summary_en, description_mn, description_en, level, topic, cover_url, is_free, is_published, rank",
    )
    .eq("id", id)
    .maybeSingle();

  if (!course) return null;

  const [{ data: modules }, { data: lessons }] = await Promise.all([
    supabase
      .from("modules")
      .select("id, title_mn, title_en, rank")
      .eq("course_id", id)
      .order("rank", { ascending: true }),
    supabase
      .from("lessons")
      .select("id, module_id, slug, title_mn, kind, duration_minutes, is_preview, rank")
      .eq("course_id", id)
      .order("rank", { ascending: true }),
  ]);

  return {
    ...course,
    modules: (modules ?? []).map((section) => ({
      id: section.id,
      title_mn: section.title_mn,
      title_en: section.title_en,
      rank: section.rank,
      lessons: (lessons ?? [])
        .filter((lesson) => lesson.module_id === section.id)
        .map((lesson) => ({
          id: lesson.id,
          slug: lesson.slug,
          title_mn: lesson.title_mn,
          kind: lesson.kind,
          duration_minutes: lesson.duration_minutes,
          is_preview: lesson.is_preview,
          rank: lesson.rank,
        })),
    })),
  };
}

export async function listCourseOptions(): Promise<{ id: string; title: string }[]> {
  if (!supabaseConfigured()) return [];
  const supabase = createServerSupabase();
  const { data } = await supabase
    .from("courses")
    .select("id, title_mn, rank")
    .order("rank", { ascending: true });
  return (data ?? []).map((row) => ({ id: row.id, title: row.title_mn }));
}
