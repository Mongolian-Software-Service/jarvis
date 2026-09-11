"use server";

import { revalidatePath } from "next/cache";
import { mn, strings } from "@jarvis/core";
import { createServerSupabase, getUserId } from "@/lib/supabase/server";
import { getRequestLocale } from "@/lib/locale";
import { fail, type ActionResult } from "./guard";

/**
 * Take a free course.
 *
 * Everything that makes this safe is in the policy (`enrollments_self_free`):
 * you may only enrol yourself, only in a published course that costs nothing,
 * and the row must say `free`. This action sends exactly that and lets the
 * database refuse anything else — the price is never read here and then trusted,
 * because a check in application code is a check somebody can route around.
 */
export async function enrollFree(courseId: string): Promise<ActionResult> {
  const locale = await getRequestLocale();
  const t = strings(locale);

  const userId = await getUserId();
  if (!userId) return fail(t.auth.errors.signedOut);

  const supabase = createServerSupabase();
  const { error } = await supabase
    .from("enrollments")
    .insert({ user_id: userId, course_id: courseId, source: "free" });

  // Already enrolled is not a failure — somebody pressed the button twice.
  if (error && error.code !== "23505") return fail(mn.admin.errors.saveFailed);

  revalidatePath(`/${locale}/courses`, "layout");
  revalidatePath(`/${locale}/learn`, "layout");
  return { ok: true };
}
