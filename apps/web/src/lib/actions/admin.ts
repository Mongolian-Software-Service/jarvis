"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  adminPath,
  courseSchema,
  fieldErrors,
  grantSchema,
  lessonSchema,
  mn,
  moduleSchema,
  roleSchema,
} from "@jarvis/core";
import { createServerSupabase } from "@/lib/supabase/server";
import { getRequestLocale } from "@/lib/locale";
import { describeError, fail, requireAdmin, type ActionResult } from "./guard";

/**
 * Everything the team can change.
 *
 * Every action in this file does the same four things in the same order:
 * re-check admin on the server, zod-parse the input, write through the
 * *request-scoped* client so RLS still applies, then revalidate. The service
 * client appears nowhere here — an admin action that bypassed RLS would be a
 * second, weaker copy of the rules.
 */

function formObject(form: FormData): Record<string, FormDataEntryValue | undefined> {
  const out: Record<string, FormDataEntryValue | undefined> = {};
  for (const [key, value] of form.entries()) out[key] = value;
  return out;
}

async function revalidateAdmin(): Promise<void> {
  const locale = await getRequestLocale();
  revalidatePath(`/${locale}/admin`, "layout");
  revalidatePath(`/${locale}/courses`, "layout");
  revalidatePath(`/${locale}`, "layout");
}

// ── Courses ──────────────────────────────────────────────────────────────────

export async function saveCourse(_prev: unknown, form: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin.ok) return fail(admin.error);

  const parsed = courseSchema.safeParse(formObject(form));
  if (!parsed.success) return fail(mn.admin.errors.saveFailed, fieldErrors(parsed.error));

  const supabase = createServerSupabase();
  const id = String(form.get("id") ?? "");

  if (id) {
    const { error } = await supabase.from("courses").update(parsed.data).eq("id", id);
    if (error) return fail(describeError(error), { slug: describeError(error) });
    await revalidateAdmin();
    return { ok: true };
  }

  const { data, error } = await supabase.from("courses").insert(parsed.data).select("id").single();
  if (error || !data) return fail(describeError(error), { slug: describeError(error) });

  await revalidateAdmin();
  /*
   * A new course goes straight to its own editor.
   *
   * Without the redirect the form is still the "new" form holding a course that
   * now exists, and the next Save inserts a second copy of it.
   */
  redirect(adminPath(await getRequestLocale(), `/courses/${data.id}`));
}

export async function deleteCourse(id: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin.ok) return fail(admin.error);

  const supabase = createServerSupabase();
  const { error } = await supabase.from("courses").delete().eq("id", id);
  // A course with a payment against it is refused by the foreign key, on
  // purpose: the record of money that changed hands outlives the product.
  if (error) return fail(describeError(error));

  await revalidateAdmin();
  return { ok: true };
}

// ── Modules ──────────────────────────────────────────────────────────────────

export async function saveModule(_prev: unknown, form: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin.ok) return fail(admin.error);

  const parsed = moduleSchema.safeParse(formObject(form));
  if (!parsed.success) return fail(mn.admin.errors.saveFailed, fieldErrors(parsed.error));

  const supabase = createServerSupabase();
  const id = String(form.get("id") ?? "");

  const { error } = id
    ? await supabase.from("modules").update(parsed.data).eq("id", id)
    : await supabase.from("modules").insert(parsed.data);

  if (error) return fail(describeError(error));

  await revalidateAdmin();
  return { ok: true };
}

export async function deleteModule(id: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin.ok) return fail(admin.error);

  const supabase = createServerSupabase();
  const { error } = await supabase.from("modules").delete().eq("id", id);
  if (error) return fail(describeError(error));

  await revalidateAdmin();
  return { ok: true };
}

// ── Lessons ──────────────────────────────────────────────────────────────────

export async function saveLesson(_prev: unknown, form: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin.ok) return fail(admin.error);

  const parsed = lessonSchema.safeParse(formObject(form));
  if (!parsed.success) return fail(mn.admin.errors.saveFailed, fieldErrors(parsed.error));

  const supabase = createServerSupabase();
  const id = String(form.get("id") ?? "");

  if (id) {
    const { error } = await supabase.from("lessons").update(parsed.data).eq("id", id);
    if (error) return fail(describeError(error), { slug: describeError(error) });
    await revalidateAdmin();
    return { ok: true };
  }

  const { data, error } = await supabase.from("lessons").insert(parsed.data).select("id").single();
  if (error || !data) return fail(describeError(error), { slug: describeError(error) });

  await revalidateAdmin();
  redirect(adminPath(await getRequestLocale(), `/lessons/${data.id}`));
}

export async function deleteLesson(id: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin.ok) return fail(admin.error);

  const supabase = createServerSupabase();
  const { error } = await supabase.from("lessons").delete().eq("id", id);
  if (error) return fail(describeError(error));

  await revalidateAdmin();
  return { ok: true };
}

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

  const { error: enrollError } = await supabase.from("enrollments").upsert(
    { user_id: payment.user_id, course_id: payment.course_id, source: "purchase", expires_at: null },
    { onConflict: "user_id,course_id" },
  );
  if (enrollError) return fail(describeError(enrollError));

  await revalidateAdmin();
  return { ok: true };
}
