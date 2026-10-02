import "server-only";
import { authorName, projectDisplayUrl } from "@jarvis/core";
import { createServerSupabase, supabaseConfigured } from "@/lib/supabase/server";

/**
 * «Сурагчдын төслүүд» — what everybody in the school has built.
 *
 * Read from `project_showcase`, never from `projects` + `profiles`: the view is
 * the one place that decides how much of a classmate another student may see
 * (20261002000200), and it hands over a first name and an initial, not a row
 * with a phone number on it.
 */

export type ShowcaseProject = {
  id: string;
  url: string;
  /** `minii-huudas.vercel.app/shop` — what the link says on screen. */
  displayUrl: string;
  /** The student's name for it, or the address when they gave none. */
  label: string;
  description: string | null;
  /** «Б.Тэмүүлэн», or null for an account with no given name yet. */
  author: string | null;
  isMine: boolean;
  createdAt: string;
};

/**
 * Newest first, by when it was **added** rather than last changed: a student
 * who fixes a typo in their description should not jump back to the top of
 * everybody's feed.
 *
 * Capped, and the cap is the whole of the pagination for now — sixty projects
 * is several weeks of a school this size. An error is an empty feed, so the
 * page above it still renders before the migration has run.
 */
export async function listShowcase(limit = 60): Promise<ShowcaseProject[]> {
  if (!supabaseConfigured()) return [];

  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("project_showcase")
    .select(
      "id, url, title, description, author_first_name, author_initial, is_mine, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  /* A view's columns are all nullable to TypeScript (§5.3) though none of
     these can be: coerced once, here, and a row without an id or a link — which
     the view cannot produce — is dropped rather than drawn as a blank card. */
  return data.flatMap((row) => {
    if (!row.id || !row.url) return [];
    const displayUrl = projectDisplayUrl(row.url);
    return [
      {
        id: row.id,
        url: row.url,
        displayUrl,
        label: row.title ?? displayUrl,
        description: row.description,
        author: authorName(row.author_first_name, row.author_initial),
        isMine: row.is_mine ?? false,
        createdAt: row.created_at ?? "",
      },
    ];
  });
}
