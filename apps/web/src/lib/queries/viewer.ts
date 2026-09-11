import "server-only";
import { cache } from "react";
import type { Role } from "@jarvis/core";
import { createServerSupabase, getUserId, supabaseConfigured } from "@/lib/supabase/server";

/**
 * Who is reading, as everything on the server needs them.
 *
 * Cached per request: the header asks, the layout asks, a guard asks, and the
 * answer cannot change mid-render.
 */
export type Viewer = {
  id: string;
  email: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  role: Role;
};

export const getViewer = cache(async (): Promise<Viewer | null> => {
  if (!supabaseConfigured()) return null;
  const userId = await getUserId();
  if (!userId) return null;

  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, avatar_url, role")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) {
    /*
     * A verified session whose profile row is missing.
     *
     * The trigger writes one on sign-up, so this is either a row deleted by
     * hand or an account created before the trigger existed. Treated as a
     * student rather than as signed-out: the session is real, and answering
     * "not signed in" would send them to a form they cannot get past.
     */
    return { id: userId, email: null, fullName: null, avatarUrl: null, role: "student" };
  }

  return {
    id: data.id,
    email: data.email,
    fullName: data.full_name,
    avatarUrl: data.avatar_url,
    role: data.role,
  };
});

/** The viewer's role, or null when nobody is signed in. */
export async function getViewerRole(): Promise<Role | null> {
  return (await getViewer())?.role ?? null;
}
