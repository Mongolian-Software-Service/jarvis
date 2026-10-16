"use server";

import { accessGrantSchema, mn, type GrantKind } from "@jarvis/core";
import { createServerSupabase } from "@/lib/supabase/server";
import { describeError, fail, requireAdmin, type ActionResult } from "../guard";
import { revalidateAdmin } from "./shared";

/**
 * Open the whole school for somebody, or take back what was opened.
 *
 * Both go through a database function rather than writing `enrollments` from
 * here, and that is the security rather than a tidiness preference: the
 * function re-checks `is_admin()` inside the transaction, so the rule holds for
 * anything that ever calls it — a future screen, or somebody with the
 * publishable key and a REST client.
 *
 * Neither sets `expires_at`. Null means no expiry, which is what «хугацаагүй»
 * asks for; a date here would be a second policy nobody remembers setting.
 *
 * Opening says why — VIP or Бэлэг (20261016000100). Pressing the other kind
 * for somebody who already holds a grant switches it; a purchase is untouched.
 */
export async function openAllCourses(
  userId: string,
  kind: GrantKind,
): Promise<ActionResult<{ count: number }>> {
  // The kind arrives from a button, but a server action is a public endpoint:
  // anything can be posted to it, so it is parsed like a form (§6.2).
  const parsed = accessGrantSchema.safeParse({ user_id: userId, grant_kind: kind });
  if (!parsed.success) return fail(mn.admin.errors.saveFailed);

  const admin = await requireAdmin();
  if (!admin.ok) return fail(admin.error);

  const supabase = createServerSupabase();
  const { data, error } = await supabase.rpc("grant_all_courses", {
    p_user: parsed.data.user_id,
    p_kind: parsed.data.grant_kind,
  });
  if (error) return fail(describeError(error));

  await revalidateAdmin();
  return { ok: true, data: { count: data ?? 0 } };
}

/**
 * Only what was granted comes back.
 *
 * `revoke_all_courses` deletes `source = 'grant'` and nothing else, so a course
 * the student **bought** survives this button. Taking away a paid course by
 * accident is not a bug somebody notices in the console — the student finds out
 * by opening a lesson (§6.7).
 */
export async function closeGrantedCourses(
  userId: string,
): Promise<ActionResult<{ count: number }>> {
  const admin = await requireAdmin();
  if (!admin.ok) return fail(admin.error);

  const supabase = createServerSupabase();
  const { data, error } = await supabase.rpc("revoke_all_courses", { p_user: userId });
  if (error) return fail(describeError(error));

  await revalidateAdmin();
  return { ok: true, data: { count: data ?? 0 } };
}
