import "server-only";
import type { LessonKind } from "@jarvis/core";
import { createServerSupabase, supabaseConfigured } from "@/lib/supabase/server";

/**
 * What the lesson editor reads — the raw bilingual columns, plus the quiz rows
 * that hang off the lesson. A `quiz` lesson with no questions is legal in the
 * database and caught by `scripts/check-seed.mjs`, so this returns an empty
 * list rather than treating it as an error.
 */

export type AdminLesson = {
  id: string;
  module_id: string;
  course_id: string;
  slug: string;
  title_mn: string;
  title_en: string | null;
  kind: LessonKind;
  video_url: string | null;
  duration_minutes: number;
  body_mn: string | null;
  body_en: string | null;
  code_language: string | null;
  starter_code: string | null;
  solution_code: string | null;
  is_preview: boolean;
  rank: number;
  courseTitle: string;
  courseSlug: string;
  modules: { id: string; title_mn: string }[];
};

export async function getAdminLesson(id: string): Promise<AdminLesson | null> {
  if (!supabaseConfigured()) return null;
  const supabase = createServerSupabase();

  const { data: lesson } = await supabase
    .from("lessons")
    .select(
      "id, module_id, course_id, slug, title_mn, title_en, kind, video_url, duration_minutes, body_mn, body_en, code_language, starter_code, solution_code, is_preview, rank",
    )
    .eq("id", id)
    .maybeSingle();

  if (!lesson) return null;

  const [{ data: course }, { data: modules }] = await Promise.all([
    supabase.from("courses").select("title_mn, slug").eq("id", lesson.course_id).maybeSingle(),
    supabase
      .from("modules")
      .select("id, title_mn")
      .eq("course_id", lesson.course_id)
      .order("rank", { ascending: true }),
  ]);

  return {
    ...lesson,
    courseTitle: course?.title_mn ?? "",
    courseSlug: course?.slug ?? "",
    modules: modules ?? [],
  };
}
