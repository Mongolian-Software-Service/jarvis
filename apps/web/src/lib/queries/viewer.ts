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
  /** Нэр — what somebody is called, and what a greeting uses. */
  firstName: string | null;
  /** Овог — the clan name, which comes first when both are written. */
  lastName: string | null;
  phone: string | null;
  avatarUrl: string | null;
  role: Role;
};

/** Is there enough here to know who this is, and to reach them? */
export function profileIsComplete(viewer: Viewer): boolean {
  return Boolean(viewer.firstName && viewer.lastName && viewer.phone);
}

export const getViewer = cache(async (): Promise<Viewer | null> => {
  if (!supabaseConfigured()) return null;
  const userId = await getUserId();
  if (!userId) return null;

  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, first_name, last_name, phone, avatar_url, role")
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
    return {
      id: userId,
      email: null,
      fullName: null,
      firstName: null,
      lastName: null,
      phone: null,
      avatarUrl: null,
      role: "student",
    };
  }

  return {
    id: data.id,
    email: data.email,
    fullName: data.full_name,
    firstName: data.first_name,
    lastName: data.last_name,
    phone: data.phone,
    avatarUrl: data.avatar_url,
    role: data.role,
  };
});

/**
 * How this account signs in — which decides whether it has a password to change.
 *
 * An account made with the sign-up form carries an `email` identity; one made
 * with Google carries only `google`, and has no password at all, because
 * Supabase never asked it for one. Read from the auth server rather than from
 * `profiles`, which does not know how anybody signs in.
 */
export const getSignIn = cache(
  async (): Promise<{ email: string; hasPassword: boolean } | null> => {
    if (!supabaseConfigured()) return null;
    const supabase = createServerSupabase();
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user?.email) return null;
    return {
      email: user.email,
      hasPassword: (user.identities ?? []).some((identity) => identity.provider === "email"),
    };
  },
);

/** The viewer's role, or null when nobody is signed in. */
export async function getViewerRole(): Promise<Role | null> {
  return (await getViewer())?.role ?? null;
}
