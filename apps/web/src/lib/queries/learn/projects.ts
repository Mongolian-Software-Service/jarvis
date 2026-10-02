import "server-only";
import { projectHost } from "@jarvis/core";
import { createServerSupabase, getUserId, supabaseConfigured } from "@/lib/supabase/server";

/** «Миний төслүүд» — the links this student has kept. */

export type StudentProject = {
  id: string;
  url: string;
  /** What the link is called on screen: the student's name for it, else its host. */
  label: string;
  host: string;
  /** The student's own name for it, unresolved — the edit form needs the blank. */
  title: string | null;
  description: string | null;
  updatedAt: string;
};

/**
 * Newest first. A project is no longer filed under a course (20261002000300),
 * so the order a student added them in is the only order there is — and the
 * one they just saved is the one they want to see.
 *
 * No `locale`, like `listFeedback`: nothing on the row is bilingual — the
 * student wrote it in whatever language they wrote it in.
 *
 * An error is an empty list rather than a thrown one, so a failed read of one
 * panel does not take the resume button down with it.
 */
export async function listMyProjects(): Promise<StudentProject[]> {
  if (!supabaseConfigured()) return [];
  const userId = await getUserId();
  if (!userId) return [];

  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("projects")
    .select("id, url, title, description, created_at, updated_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((row) => {
    const host = projectHost(row.url);
    return {
      id: row.id,
      url: row.url,
      label: row.title ?? host,
      host,
      title: row.title,
      description: row.description,
      updatedAt: row.updated_at,
    };
  });
}
