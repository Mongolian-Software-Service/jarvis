import "server-only";
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
    .select("source")
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
  };
}
