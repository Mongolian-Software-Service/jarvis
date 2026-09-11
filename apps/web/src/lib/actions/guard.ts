import "server-only";
import { mn } from "@jarvis/core";
import { createServerSupabase, getUserId } from "@/lib/supabase/server";
import { getViewer } from "@/lib/queries/viewer";

/**
 * What every server action returns.
 *
 * Never a thrown Postgres error: the constraint name that stopped a write is
 * for the log, not for the person who pressed Save.
 */
export type ActionResult<T = undefined> =
  | ({ ok: true } & (T extends undefined ? { data?: undefined } : { data: T }))
  | { ok: false; error: string; fields?: Record<string, string> };

export function fail(error: string, fields?: Record<string, string>): ActionResult<never> {
  return { ok: false, error, fields };
}

/**
 * The signed-in user's id, or a refusal.
 *
 * Admin-facing copy is Mongolian in the source, like the rest of the admin.
 */
export async function requireUser(): Promise<
  { ok: true; userId: string } | { ok: false; error: string }
> {
  const userId = await getUserId();
  if (!userId) return { ok: false, error: mn.admin.errors.notSignedIn };
  return { ok: true, userId };
}

/**
 * Re-check admin **on the server**, in every action that needs it.
 *
 * Not a formality. RLS is the real gate — an action that forgot this check
 * would still be refused by the policies — but a refusal from Postgres reaches
 * the screen as a failed write with no explanation, and an action that never
 * checks is one policy edit away from being the hole. Asking the database
 * (`is_admin()`) rather than trusting a role the client sent is the whole point.
 */
export async function requireAdmin(): Promise<
  { ok: true; userId: string } | { ok: false; error: string }
> {
  const session = await requireUser();
  if (!session.ok) return session;

  const viewer = await getViewer();
  if (viewer?.role === "admin") return { ok: true, userId: session.userId };

  // The profile row said no. Ask the database directly before refusing — the
  // JWT claim path (000200) promotes somebody a request earlier than the table.
  const supabase = createServerSupabase();
  const { data } = await supabase.rpc("is_admin");
  if (data === true) return { ok: true, userId: session.userId };

  return { ok: false, error: mn.admin.errors.notAdmin };
}

/**
 * Postgres errors, turned into something a person can act on.
 *
 * Only the three that a correct interface can still produce are named; anything
 * else is "saving failed", because inventing copy for an error nobody has seen
 * is how a message ends up lying about what happened.
 */
export function describeError(error: { code?: string; message?: string } | null): string {
  if (!error) return mn.admin.errors.saveFailed;
  if (error.code === "23505") return mn.admin.errors.slugTaken;
  if (error.code === "23503") return mn.admin.errors.inUse;
  if (error.code === "42501") return mn.admin.errors.notAdmin;
  return mn.admin.errors.saveFailed;
}
