import "server-only";
import { formatFullName, type GrantKind } from "@jarvis/core";
import { createServerSupabase, supabaseConfigured } from "@/lib/supabase/server";

/**
 * Who the team is about to open the school for.
 *
 * Found by the address they registered with, because that is what the person
 * asking hands over — a name is not unique and an id is not something anybody
 * says out loud. The row comes back with enough beside it to be sure it is the
 * right person before the button is pressed: a school opened for the wrong
 * `bat@gmail.com` is a support call and a refund.
 */
export type AccessCandidate = {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  createdAt: string;
  /** Published courses they already hold, whatever the reason. */
  enrolled: number;
  /** Of those, the ones the team handed over — the only ones a revoke touches. */
  granted: number;
  /** Why they were handed over, when they were: VIP or Бэлэг (20261016000100). */
  kind: GrantKind | null;
};

export async function findAccessCandidate(email: string): Promise<AccessCandidate | null> {
  if (!supabaseConfigured()) return null;

  const supabase = createServerSupabase();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, first_name, last_name, phone, created_at")
    /*
     * Addresses are stored lowercased — Supabase Auth normalises them and the
     * trigger copies what it is given — and the schema lowercases the typed
     * one, so this is a plain equality rather than `ilike`. `ilike` would not
     * use the index and would let `%` in a typed address match half the school.
     */
    .eq("email", email)
    .maybeSingle();

  if (!profile) return null;

  // Two counts, one read: the second is a subset of the first, and asking the
  // database twice for the same rows to count them differently is a round trip
  // spent on arithmetic.
  const { data: rows } = await supabase
    .from("enrollments")
    .select("source, grant_kind")
    .eq("user_id", profile.id);

  const held = rows ?? [];

  return {
    id: profile.id,
    email: profile.email,
    firstName: profile.first_name,
    lastName: profile.last_name,
    phone: profile.phone,
    createdAt: profile.created_at,
    enrolled: held.length,
    granted: held.filter((row) => row.source === "grant").length,
    kind: held.find((row) => row.grant_kind)?.grant_kind ?? null,
  };
}

/** One person the team has opened the school for. */
export type GrantedPerson = {
  id: string;
  email: string | null;
  /** Овог нэр, or null when the account has neither yet. */
  name: string | null;
  /** How many courses the team handed them — what «хаах» would take back. */
  courses: number;
  /** The most recent grant: the bundle grants every course in one statement. */
  grantedAt: string;
  /** VIP or Бэлэг — the kind on their latest grant row. */
  kind: GrantKind;
};

type GrantRow = {
  user_id: string;
  created_at: string;
  grant_kind: GrantKind | null;
  profiles: {
    email: string | null;
    first_name: string | null;
    last_name: string | null;
  } | null;
};

/**
 * Everybody holding a course because the team gave it, newest grant first.
 *
 * Only `source = 'grant'`. A buyer is in «Төлбөр» and a free enrolment is
 * nobody's decision; this list is the record of the team's own, which is what
 * somebody asks for when they want to know who got in without paying.
 *
 * Read as rows and grouped here: one grant is one row per course, so a person
 * appears five times in the table and once on the screen. The team grants by
 * hand, so this stays small — when it does not, it becomes a view.
 */
export async function listGrantedPeople(limit = 2000): Promise<GrantedPerson[]> {
  if (!supabaseConfigured()) return [];

  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("enrollments")
    .select("user_id, created_at, grant_kind, profiles (email, first_name, last_name)")
    .eq("source", "grant")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  // Newest first in, so the first row seen for a person is their latest grant.
  const people = new Map<string, GrantedPerson>();
  for (const row of data as unknown as GrantRow[]) {
    const seen = people.get(row.user_id);
    if (seen) {
      seen.courses += 1;
      continue;
    }
    people.set(row.user_id, {
      id: row.user_id,
      email: row.profiles?.email ?? null,
      name: formatFullName(row.profiles?.last_name, row.profiles?.first_name),
      courses: 1,
      grantedAt: row.created_at,
      // Never null on a grant — the check in 20261016000100 — but typed so.
      kind: row.grant_kind ?? "gift",
    });
  }
  return [...people.values()];
}
