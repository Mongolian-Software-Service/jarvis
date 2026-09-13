"use server";

import { fieldErrors, grantSchema, mn, roleSchema } from "@jarvis/core";
import { createServerSupabase } from "@/lib/supabase/server";
import { describeError, fail, requireAdmin, type ActionResult } from "../guard";
import { formObject, revalidateAdmin } from "./shared";

// ── People ───────────────────────────────────────────────────────────────────

/**
 * Promote or demote an account.
 *
 * Through the `set_user_role()` function, not through an update: column-level
 * UPDATE on `profiles.role` is revoked from `authenticated`, so this is the only
 * door — and the function asks `is_admin()` again on its own side of it.
 */
export async function setRole(userId: string, role: "student" | "admin"): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin.ok) return fail(admin.error);

  const parsed = roleSchema.safeParse({ user_id: userId, role });
  if (!parsed.success) return fail(mn.admin.errors.saveFailed);

  const supabase = createServerSupabase();
  const { error } = await supabase.rpc("set_user_role", {
    p_user: parsed.data.user_id,
    p_role: parsed.data.role,
  });
  if (error) return fail(describeError(error));

  await revalidateAdmin();
  return { ok: true };
}

/** Open a course for somebody by hand — the v1 answer to "they paid offline". */
export async function grantCourse(_prev: unknown, form: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin.ok) return fail(admin.error);

  const parsed = grantSchema.safeParse(formObject(form));
  if (!parsed.success) return fail(mn.admin.errors.saveFailed, fieldErrors(parsed.error));

  const supabase = createServerSupabase();
  const { error } = await supabase.from("enrollments").upsert(
    {
      user_id: parsed.data.user_id,
      course_id: parsed.data.course_id,
      source: "grant",
      expires_at: parsed.data.expires_at,
    },
    { onConflict: "user_id,course_id" },
  );
  if (error) return fail(describeError(error));

  await revalidateAdmin();
  return { ok: true };
}

export async function revokeCourse(userId: string, courseId: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin.ok) return fail(admin.error);

  const supabase = createServerSupabase();
  const { error } = await supabase
    .from("enrollments")
    .delete()
    .eq("user_id", userId)
    .eq("course_id", courseId);
  if (error) return fail(describeError(error));

  await revalidateAdmin();
  return { ok: true };
}

// ── Payments ─────────────────────────────────────────────────────────────────

/**
 * Settle an invoice by hand.
 *
 * For the case the gateway's callback never arrived but the money did — which
 * happens, and until it can be fixed the student is sitting in front of a
 * course they paid for. Writes the payment row and the enrolment together, the
 * same pair `settle_payment()` writes, because half of that is worse than
 * neither.
 */
export async function settlePayment(paymentId: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin.ok) return fail(admin.error);

  const supabase = createServerSupabase();
  const { data: payment, error: readError } = await supabase
    .from("payments")
    .select("id, user_id, course_id, status")
    .eq("id", paymentId)
    .maybeSingle();

  if (readError || !payment) return fail(mn.admin.errors.notFound);
  if (payment.status === "paid") return { ok: true };

  const { error } = await supabase
    .from("payments")
    .update({ status: "paid", paid_at: new Date().toISOString() })
    .eq("id", paymentId);
  if (error) return fail(describeError(error));

  /*
   * A payment with no course is the bundle — open everything, exactly as
   * `settle_payment()` does when the gateway confirms one.
   */
  const courseIds = payment.course_id
    ? [payment.course_id]
    : ((await supabase.from("courses").select("id").eq("is_published", true)).data ?? []).map(
        (row) => row.id,
      );

  const { error: enrollError } = await supabase.from("enrollments").upsert(
    courseIds.map((courseId) => ({
      user_id: payment.user_id,
      course_id: courseId,
      source: "purchase" as const,
      expires_at: null,
    })),
    { onConflict: "user_id,course_id" },
  );
  if (enrollError) return fail(describeError(enrollError));

  await revalidateAdmin();
  return { ok: true };
}
