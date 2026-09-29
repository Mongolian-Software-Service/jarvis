import "server-only";
import { resumeCourse, type Locale } from "@jarvis/core";
import { createServerSupabase, getUserId, supabaseConfigured } from "@/lib/supabase/server";
import { getCourseBySlug } from "../courses";
import { listMyCourses, type EnrolledCourse } from "./courses";

/**
 * The student's own dashboard: what they hold, what they have done, and the
 * one button that puts them back where they were.
 */

export type StudentOverview = {
  courses: EnrolledCourse[];
  lessonsDone: number;
  minutesWatched: number;
  /** The one thing the dashboard's main button does. Null for a new student. */
  resume: {
    courseSlug: string;
    courseTitle: string;
    lessonSlug: string;
    lessonTitle: string;
  } | null;
};

/**
 * Everything the student's landing screen shows.
 *
 * The interesting part is `resume`: the course they touched most recently that
 * they have not finished, and the first lesson in it they have not done. That
 * is the difference between a dashboard and a list — one of them knows what
 * you were doing.
 */
export async function getStudentOverview(locale: Locale): Promise<StudentOverview> {
  const empty: StudentOverview = { courses: [], lessonsDone: 0, minutesWatched: 0, resume: null };
  if (!supabaseConfigured()) return empty;

  const userId = await getUserId();
  if (!userId) return empty;

  const supabase = createServerSupabase();
  const [courses, { data: marks }] = await Promise.all([
    listMyCourses(locale),
    supabase
      .from("lesson_progress")
      .select("lesson_id, course_id, completed_at, seconds_watched, updated_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false }),
  ]);

  const rows = marks ?? [];
  const lessonsDone = rows.filter((row) => row.completed_at).length;
  const minutesWatched = Math.round(
    rows.reduce((sum, row) => sum + row.seconds_watched, 0) / 60,
  );

  if (courses.length === 0) return { ...empty, courses, lessonsDone, minutesWatched };

  /* Which course to send them back to. The rule is `resumeCourse` in core
     rather than four lines here, because it is the kind of rule that grows a
     second, slightly different copy the moment a screen needs it — and the
     plain-Node test runner can check it where it is. */
  const target = resumeCourse(courses, rows[0]?.course_id);

  if (!target) return { ...empty, courses, lessonsDone, minutesWatched };

  const detail = await getCourseBySlug(target.slug, locale);
  const ordered = detail?.modules.flatMap((section) => section.lessons) ?? [];
  const done = new Set(rows.filter((row) => row.completed_at).map((row) => row.lesson_id));
  const next = ordered.find((lesson) => !done.has(lesson.id)) ?? ordered[0];

  return {
    courses,
    lessonsDone,
    minutesWatched,
    resume: next
      ? {
          courseSlug: target.slug,
          courseTitle: target.title,
          lessonSlug: next.slug,
          lessonTitle: next.title,
        }
      : null,
  };
}
