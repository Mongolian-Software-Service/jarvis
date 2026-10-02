import "server-only";
import { formatFullName, projectHost } from "@jarvis/core";
import { createServerSupabase, supabaseConfigured } from "@/lib/supabase/server";

/**
 * Every link a student has kept, for the team to open.
 *
 * Read through the admin's own session: `projects_admin_read` is what lets
 * this see past the student's own rows, so a demoted admin sees nothing here a
 * moment after the role changes. The author is joined from `profiles`, like
 * `listFeedback`, so a corrected name is corrected here too.
 */
export type AdminProject = {
  id: string;
  url: string;
  host: string;
  title: string | null;
  description: string | null;
  updatedAt: string;
  student: { name: string | null; email: string | null };
};

type Row = {
  id: string;
  url: string;
  title: string | null;
  description: string | null;
  updated_at: string;
  profiles: { first_name: string | null; last_name: string | null; email: string | null } | null;
};

/** Most recently changed first — a link that just moved is the one worth a look. */
export async function listProjects(limit = 300): Promise<AdminProject[]> {
  if (!supabaseConfigured()) return [];

  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("projects")
    .select("id, url, title, description, updated_at, profiles (first_name, last_name, email)")
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return (data as unknown as Row[]).map((row) => ({
    id: row.id,
    url: row.url,
    host: projectHost(row.url),
    title: row.title,
    description: row.description,
    updatedAt: row.updated_at,
    student: {
      name: formatFullName(row.profiles?.last_name, row.profiles?.first_name),
      email: row.profiles?.email ?? null,
    },
  }));
}
