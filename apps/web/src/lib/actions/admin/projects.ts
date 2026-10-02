"use server";

import { z } from "zod";
import { mn } from "@jarvis/core";
import { createServerSupabase } from "@/lib/supabase/server";
import { describeError, fail, requireAdmin, type ActionResult } from "../guard";
import { revalidateAdmin } from "./shared";

/**
 * Take a student's link down.
 *
 * The one thing the console does to a project, and it exists because the
 * showcase does: a link every student opens has to be removable by somebody
 * other than whoever posted it (20261002000200). The team removes and never
 * rewrites — there is no edit, because a description changed by somebody
 * else is no longer the student's own words.
 *
 * Through the request-scoped client, so `projects_admin_delete` is what allows
 * it. A delete RLS refuses is not an error to PostgREST — it simply matches
 * nothing — so the row count is read and «nothing happened» is said out loud
 * instead of reported as success.
 */
export async function deleteProject(id: string): Promise<ActionResult> {
  const parsed = z.uuid().safeParse(id);
  if (!parsed.success) return fail(mn.admin.errors.saveFailed);

  const admin = await requireAdmin();
  if (!admin.ok) return fail(admin.error);

  const supabase = createServerSupabase();
  const { error, count } = await supabase
    .from("projects")
    .delete({ count: "exact" })
    .eq("id", parsed.data);

  if (error) return fail(describeError(error));
  if (!count) return fail(mn.admin.errors.saveFailed);

  // The console, the student's dashboard and the showcase all show the row.
  await revalidateAdmin();
  return { ok: true };
}
