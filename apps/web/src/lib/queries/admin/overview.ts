import "server-only";
import type { AccessKind, EnrollmentSource, GrantKind, PaymentStatus } from "@jarvis/core";
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
  /**
   * Students who hold a course — people, never `enrollments` rows. The bundle
   * writes one row per course, so a single sale was five rows and the tile read
   * «Бүртгэл 10» beside «Сурагч 4»: two buyers, counted as if ten had signed up.
   */
  withAccess: number;
  /**
   * Those same people by how they got in: bought, VIP or Бэлэг. A purchase
   * outranks a grant and a VIP a gift, so each person is counted once. The
   * three are always there, zero or not; «free» only when somebody holds one.
   */
  access: { kind: AccessKind; count: number }[];
  revenueMnt: number;
  /** Students whose access opened on each of the last 30 days, oldest first. */
  daily: { date: string; count: number }[];
  statuses: { status: PaymentStatus; count: number }[];
  /**
   * Courses by how many students have opened a lesson in them. Not by
   * enrolment: under the bundle every course has the same holders, so that
   * ranking was five equal bars.
   */
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

/** The order a person is classified in when they hold courses more than one way. */
const ACCESS_RANK: AccessKind[] = ["purchase", "vip", "gift", "free"];

/** A grant counts as its kind (20261016000100) — never null on a grant, typed so. */
function accessKind(row: { source: EnrollmentSource; grant_kind: GrantKind | null }): AccessKind {
  return row.source === "grant" ? (row.grant_kind ?? "gift") : row.source;
}

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
  withAccess: 0,
  access: [],
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

  const [profiles, courses, enrollments, payments, progress] = await Promise.all([
    supabase.from("profiles").select("id, full_name, email, role, created_at"),
    supabase.from("courses").select("id, title_mn, is_published"),
    supabase.from("enrollments").select("course_id, user_id, source, grant_kind, created_at"),
    supabase.from("payments").select("id, amount_mnt, status, created_at, user_id, course_id"),
    supabase.from("lesson_progress").select("course_id, user_id"),
  ]);

  const people = profiles.data ?? [];
  const courseRows = courses.data ?? [];
  const paymentRows = payments.data ?? [];

  // Only students count: a teammate who opened a course to check it is not a
  // customer, and leaving them in would let this tile exceed «Сурагч».
  const isStudent = new Set(people.filter((row) => row.role === "student").map((row) => row.id));
  const enrollRows = (enrollments.data ?? []).filter((row) => isStudent.has(row.user_id));

  const courseTitle = new Map(courseRows.map((row) => [row.id, row.title_mn]));
  const personName = new Map(people.map((row) => [row.id, row.full_name ?? row.email]));

  // One entry per student: the day their first course opened, and the best way
  // in they hold.
  const holders = new Map<string, { since: string; kind: AccessKind }>();
  for (const row of enrollRows) {
    const kind = accessKind(row);
    const held = holders.get(row.user_id);
    if (!held) {
      holders.set(row.user_id, { since: row.created_at, kind });
      continue;
    }
    if (row.created_at < held.since) held.since = row.created_at;
    if (ACCESS_RANK.indexOf(kind) < ACCESS_RANK.indexOf(held.kind)) held.kind = kind;
  }

  // Every day in the window, including the empty ones — a bar chart with gaps
  // where nothing happened tells a different story than one with zeroes.
  const counts = new Map<string, number>();
  for (let index = 29; index >= 0; index--) {
    counts.set(dayKey(new Date(Date.now() - index * DAY_MS)), 0);
  }
  for (const held of holders.values()) {
    const key = dayKey(held.since);
    if (counts.has(key)) counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const learners = new Map<string, Set<string>>();
  for (const row of progress.data ?? []) {
    if (!isStudent.has(row.user_id)) continue;
    const seen = learners.get(row.course_id) ?? new Set<string>();
    seen.add(row.user_id);
    learners.set(row.course_id, seen);
  }

  const statusCounts = new Map<PaymentStatus, number>();
  for (const row of paymentRows) {
    statusCounts.set(row.status, (statusCounts.get(row.status) ?? 0) + 1);
  }

  return {
    students: isStudent.size,
    admins: people.filter((row) => row.role === "admin").length,
    courses: courseRows.length,
    published: courseRows.filter((row) => row.is_published).length,
    drafts: courseRows.filter((row) => !row.is_published).length,
    withAccess: holders.size,
    access: ACCESS_RANK.map((kind) => ({
      kind,
      count: [...holders.values()].filter((held) => held.kind === kind).length,
    })).filter((row) => row.kind !== "free" || row.count > 0),
    revenueMnt: paymentRows
      .filter((row) => row.status === "paid")
      .reduce((sum, row) => sum + row.amount_mnt, 0),
    daily: [...counts.entries()].map(([date, count]) => ({ date, count })),
    statuses: [...statusCounts.entries()].map(([status, count]) => ({ status, count })),
    topCourses: [...learners.entries()]
      .map(([id, seen]) => ({ id, title: courseTitle.get(id) ?? "—", count: seen.size }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5),
    recentStudents: people
      .filter((row) => row.created_at >= since)
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(0, 5)
      .map((row) => ({
        id: row.id,
        name: row.full_name,
        email: row.email,
        joined: row.created_at,
      })),
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
