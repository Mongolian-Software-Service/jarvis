import "server-only";
import { localized, type Locale, type Role } from "@jarvis/core";
import { createServerSupabase, supabaseConfigured } from "@/lib/supabase/server";

/** Who is enrolled and who has paid — the two lists the team actually works from. */

export type AdminStudent = {
  id: string;
  name: string | null;
  /** Овог and нэр apart, because a dialog that says who somebody is uses both. */
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  role: Role;
  joined: string;
  /** What they hold, and how they came by it — the list the dialog prints. */
  held: { courseId: string; title: string; source: "purchase" | "grant" | "free" }[];
};

export async function listStudents(locale: Locale): Promise<AdminStudent[]> {
  if (!supabaseConfigured()) return [];
  const supabase = createServerSupabase();

  /*
   * Three reads rather than a join, and then assembled here.
   *
   * PostgREST would nest the courses under each enrolment, but the same six
   * course titles would come back once per student holding them. This is a
   * small school (§6.1) and these are three small tables; the arithmetic is
   * cheaper than the duplication.
   */
  const [{ data: people }, { data: enrollments }, { data: courses }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, first_name, last_name, email, phone, role, created_at")
      .order("created_at", { ascending: false }),
    supabase.from("enrollments").select("user_id, course_id, source"),
    supabase.from("courses").select("id, title_mn, title_en"),
  ]);

  const titles = new Map(
    (courses ?? []).map((row) => [row.id, localized(locale, row.title_mn, row.title_en)]),
  );

  const held = new Map<string, AdminStudent["held"]>();
  for (const row of enrollments ?? []) {
    const list = held.get(row.user_id) ?? [];
    list.push({
      courseId: row.course_id,
      title: titles.get(row.course_id) ?? "—",
      source: row.source,
    });
    held.set(row.user_id, list);
  }

  return (people ?? []).map((row) => ({
    id: row.id,
    name: row.full_name,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    role: row.role,
    joined: row.created_at,
    held: held.get(row.id) ?? [],
  }));
}
