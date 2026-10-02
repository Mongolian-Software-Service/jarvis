import "server-only";
import { formatFullName } from "@jarvis/core";
import { createServerSupabase, supabaseConfigured } from "@/lib/supabase/server";

/**
 * What a student wrote, with enough of them attached to answer it.
 *
 * The name, phone and address are **joined** rather than stored on the message
 * (see the migration): a student who corrects their phone number corrects it on
 * every message they have ever sent, which is the whole point of the column
 * living in one place.
 *
 * That join is also why `user_id` references `public.profiles` and not
 * `auth.users` — PostgREST cannot see a relationship to a schema it does not
 * expose, and this read would fail at runtime rather than at build (§5).
 */
export type FeedbackMessage = {
  id: string;
  body: string;
  createdAt: string;
  author: {
    id: string;
    /** Овог нэр, in that order, or null when the account has neither yet. */
    name: string | null;
    phone: string | null;
    email: string | null;
  };
};

type Row = {
  id: string;
  body: string;
  created_at: string;
  profiles: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
    email: string | null;
  } | null;
};

/** Newest first, which is the only order a queue is read in. */
export async function listFeedback(limit = 200): Promise<FeedbackMessage[]> {
  if (!supabaseConfigured()) return [];

  const supabase = createServerSupabase();
  const { data } = await supabase
    .from("feedback")
    .select("id, body, created_at, profiles (id, first_name, last_name, phone, email)")
    .order("created_at", { ascending: false })
    .limit(limit);

  return ((data ?? []) as unknown as Row[]).map((row) => ({
    id: row.id,
    body: row.body,
    createdAt: row.created_at,
    author: {
      id: row.profiles?.id ?? "",
      name: formatFullName(row.profiles?.last_name, row.profiles?.first_name),
      phone: row.profiles?.phone ?? null,
      email: row.profiles?.email ?? null,
    },
  }));
}
