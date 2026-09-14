import {
  COURSE_COLUMNS,
  courseStats,
  lessonTotals,
  toCourseCard,
  type CourseCard,
  type CourseStats,
  type Locale,
} from "@jarvis/core";
import { supabase, supabaseConfigured } from "../supabase";

/** What this student holds, with their progress through each. */

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
