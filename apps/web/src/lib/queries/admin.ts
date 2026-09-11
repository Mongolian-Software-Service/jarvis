import "server-only";
import type { CourseLevel, LessonKind, PaymentStatus, Role } from "@jarvis/core";
import { createServerSupabase, supabaseConfigured } from "@/lib/supabase/server";

/**
 * The console's reads.
 *
 * Every one of these runs as the signed-in admin, so the policies are still
 * what decides what comes back — the service client appears nowhere in this
 * file. An admin who was demoted a second ago gets a demoted admin's answers.
 *
 * The aggregates are computed in JS off one read per table rather than in five
 * round trips. This is a small school; when it is not, these become a view.
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
        course: courseTitle.get(row.course_id) ?? null,
      })),
  };
}

export type AdminCourseRow = {
  id: string;
  slug: string;
  title: string;
  level: CourseLevel;
  topic: string;
  priceMnt: number;
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
      .select("id, slug, title_mn, level, topic, price_mnt, is_published, rank")
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
    priceMnt: row.price_mnt,
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
  price_mnt: number;
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
      "id, slug, title_mn, title_en, summary_mn, summary_en, description_mn, description_en, level, topic, cover_url, price_mnt, is_published, rank",
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

export type AdminStudent = {
  id: string;
  name: string | null;
  email: string | null;
  role: Role;
  joined: string;
  courses: number;
};

export async function listStudents(): Promise<AdminStudent[]> {
  if (!supabaseConfigured()) return [];
  const supabase = createServerSupabase();

  const [{ data: people }, { data: enrollments }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, email, role, created_at")
      .order("created_at", { ascending: false }),
    supabase.from("enrollments").select("user_id"),
  ]);

  const counts = new Map<string, number>();
  for (const row of enrollments ?? []) {
    counts.set(row.user_id, (counts.get(row.user_id) ?? 0) + 1);
  }

  return (people ?? []).map((row) => ({
    id: row.id,
    name: row.full_name,
    email: row.email,
    role: row.role,
    joined: row.created_at,
    courses: counts.get(row.id) ?? 0,
  }));
}

export type AdminPayment = {
  id: string;
  amount: number;
  status: PaymentStatus;
  provider: string;
  invoice: string | null;
  created: string;
  paidAt: string | null;
  student: string | null;
  course: string | null;
};

export async function listPayments(): Promise<AdminPayment[]> {
  if (!supabaseConfigured()) return [];
  const supabase = createServerSupabase();

  const { data } = await supabase
    .from("payments")
    .select(
      "id, amount_mnt, status, provider, invoice_id, created_at, paid_at, user_id, course_id, courses!inner(title_mn), profiles!inner(full_name, email)",
    )
    .order("created_at", { ascending: false })
    .limit(200);

  return (data ?? []).map((row) => ({
    id: row.id,
    amount: row.amount_mnt,
    status: row.status,
    provider: row.provider,
    invoice: row.invoice_id,
    created: row.created_at,
    paidAt: row.paid_at,
    student: row.profiles?.full_name ?? row.profiles?.email ?? null,
    course: row.courses?.title_mn ?? null,
  }));
}

/** For the "open a course" form on the students page. */
export async function listCourseOptions(): Promise<{ id: string; title: string }[]> {
  if (!supabaseConfigured()) return [];
  const supabase = createServerSupabase();
  const { data } = await supabase
    .from("courses")
    .select("id, title_mn, rank")
    .order("rank", { ascending: true });
  return (data ?? []).map((row) => ({ id: row.id, title: row.title_mn }));
}
