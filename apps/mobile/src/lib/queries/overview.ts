import { completedIds, nextLesson, resumeCourse, type Locale } from "@jarvis/core";
import { supabase, supabaseConfigured } from "../supabase";
import { getCourse } from "./catalogue";
import { listMyCourses, type EnrolledCourse } from "./mine";

/**
 * The student's own screen: what they hold, what they have done, and the one
 * button that puts them back where they were.
 *
 * The same shape the web's `getStudentOverview` returns, and the same rules —
 * `resumeCourse` and `nextLesson` both come from `@jarvis/core`, so the phone
 * and the browser cannot disagree about where somebody left off.
 */

export type StudentOverview = {
  courses: EnrolledCourse[];
  lessonsDone: number;
  minutesWatched: number;
  /** What the main button does. Null for a student who holds nothing. */
  resume: {
    courseSlug: string;
    courseTitle: string;
    lessonSlug: string;
    lessonTitle: string;
  } | null;
};

const EMPTY: StudentOverview = { courses: [], lessonsDone: 0, minutesWatched: 0, resume: null };

export async function getStudentOverview(
  locale: Locale,
  userId: string,
): Promise<StudentOverview> {
  if (!supabaseConfigured()) return EMPTY;

  const [courses, { data: marks }] = await Promise.all([
    listMyCourses(locale, userId),
    supabase
      .from("lesson_progress")
      .select("lesson_id, course_id, completed_at, seconds_watched, updated_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false }),
  ]);

  const rows = marks ?? [];
  const lessonsDone = rows.filter((row) => row.completed_at).length;
  const minutesWatched = Math.round(rows.reduce((sum, row) => sum + row.seconds_watched, 0) / 60);
  const counted = { courses, lessonsDone, minutesWatched, resume: null };

  const target = resumeCourse(courses, rows[0]?.course_id);
  if (!target) return counted;

  /*
   * One extra read, and only for the course they are going back to. Asking for
   * every held course's lessons to find one slug is three round trips on a
   * phone that may be on 3G.
   */
  const detail = await getCourse(target.slug, locale);
  const ordered = detail?.modules.flatMap((section) => section.lessons) ?? [];
  const next = nextLesson(ordered, completedIds(rows)) ?? ordered[0];
  if (!next) return counted;

  return {
    courses,
    lessonsDone,
    minutesWatched,
    resume: {
      courseSlug: target.slug,
      courseTitle: target.title,
      lessonSlug: next.slug,
      lessonTitle: next.title,
    },
  };
}
