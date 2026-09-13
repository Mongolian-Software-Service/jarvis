import "server-only";
import type { PaymentStatus } from "@jarvis/core";
import { createServerSupabase, supabaseConfigured } from "@/lib/supabase/server";

/**
 * The console's front page: totals, and the last thirty days as a sparkline.
 *
 * Computed in JS off one read per table rather than in five round trips. This
 * is a small school; when it is not, this becomes a view.
 */

export type AdminOverview = {
  students: number;
  admins: number;
  courses: number;
  published: number;
  drafts: number;
  enrollments: number;
  revenueMnt: number;
  /** Enrolments per day for the last 30 days, oldest first. */
  daily: { date: string; count: number }[];
  statuses: { status: PaymentStatus; count: number }[];
  topCourses: { id: string; title: string; count: number }[];
  recentStudents: { id: string; name: string | null; email: string | null; joined: string }[];
  recentPayments: {
    id: string;
    amount: number;
    status: PaymentStatus;
    created: string;
    student: string | null;
    course: string | null;
  }[];
};

const DAY_MS = 24 * 60 * 60 * 1000;

function dayKey(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  return date.toISOString().slice(0, 10);
}

const EMPTY_OVERVIEW: AdminOverview = {
  students: 0,
  admins: 0,
  courses: 0,
  published: 0,
  drafts: 0,
  enrollments: 0,
  revenueMnt: 0,
  daily: [],
  statuses: [],
  topCourses: [],
  recentStudents: [],
  recentPayments: [],
};

export async function getAdminOverview(): Promise<AdminOverview> {
  if (!supabaseConfigured()) return EMPTY_OVERVIEW;
  const supabase = createServerSupabase();
  const since = new Date(Date.now() - 30 * DAY_MS).toISOString();

  const [profiles, courses, enrollments, payments] = await Promise.all([
    supabase.from("profiles").select("id, full_name, email, role, created_at"),
    supabase.from("courses").select("id, title_mn, is_published"),
    supabase.from("enrollments").select("id, course_id, user_id, created_at"),
    supabase.from("payments").select("id, amount_mnt, status, created_at, user_id, course_id"),
  ]);

  const people = profiles.data ?? [];
  const courseRows = courses.data ?? [];
  const enrollRows = enrollments.data ?? [];
  const paymentRows = payments.data ?? [];

  const courseTitle = new Map(courseRows.map((row) => [row.id, row.title_mn]));
  const personName = new Map(people.map((row) => [row.id, row.full_name ?? row.email]));

  // Every day in the window, including the empty ones — a bar chart with gaps
  // where nothing happened tells a different story than one with zeroes.
  const counts = new Map<string, number>();
  for (let index = 29; index >= 0; index--) {
    counts.set(dayKey(new Date(Date.now() - index * DAY_MS)), 0);
  }
  for (const row of enrollRows) {
    const key = dayKey(row.created_at);
    if (counts.has(key)) counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const perCourse = new Map<string, number>();
  for (const row of enrollRows) {
    perCourse.set(row.course_id, (perCourse.get(row.course_id) ?? 0) + 1);
  }

  const statusCounts = new Map<PaymentStatus, number>();
  for (const row of paymentRows) {
    statusCounts.set(row.status, (statusCounts.get(row.status) ?? 0) + 1);
  }

  return {
    students: people.filter((row) => row.role === "student").length,
    admins: people.filter((row) => row.role === "admin").length,
    courses: courseRows.length,
    published: courseRows.filter((row) => row.is_published).length,
    drafts: courseRows.filter((row) => !row.is_published).length,
    enrollments: enrollRows.length,
    revenueMnt: paymentRows
      .filter((row) => row.status === "paid")
      .reduce((sum, row) => sum + row.amount_mnt, 0),
    daily: [...counts.entries()].map(([date, count]) => ({ date, count })),
    statuses: [...statusCounts.entries()].map(([status, count]) => ({ status, count })),
    topCourses: [...perCourse.entries()]
      .map(([id, count]) => ({ id, title: courseTitle.get(id) ?? "—", count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5),
    recentStudents: people
      .filter((row) => row.created_at >= since)
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(0, 5)
      .map((row) => ({ id: row.id, name: row.full_name, email: row.email, joined: row.created_at })),
    recentPayments: paymentRows
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(0, 6)
      .map((row) => ({
        id: row.id,
        amount: row.amount_mnt,
        status: row.status,
        created: row.created_at,
        student: personName.get(row.user_id) ?? null,
        course: row.course_id ? (courseTitle.get(row.course_id) ?? null) : null,
      })),
  };
}
