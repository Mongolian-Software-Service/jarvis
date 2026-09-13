"use server";

import { redirect } from "next/navigation";
import { adminPath, courseSchema, fieldErrors, mn, moduleSchema } from "@jarvis/core";
import { createServerSupabase } from "@/lib/supabase/server";
import { getRequestLocale } from "@/lib/locale";
import { describeError, fail, requireAdmin, type ActionResult } from "../guard";
import { formObject, revalidateAdmin } from "./shared";

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
