"use server";

import { redirect } from "next/navigation";
import { adminPath, fieldErrors, lessonSchema, mn } from "@jarvis/core";
import { createServerSupabase } from "@/lib/supabase/server";
import { getRequestLocale } from "@/lib/locale";
import { describeError, fail, requireAdmin, type ActionResult } from "../guard";
import { formObject, revalidateAdmin } from "./shared";

// ── Lessons ──────────────────────────────────────────────────────────────────

export async function saveLesson(_prev: unknown, form: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin.ok) return fail(admin.error);

  const parsed = lessonSchema.safeParse(formObject(form));
  if (!parsed.success) return fail(mn.admin.errors.saveFailed, fieldErrors(parsed.error));

  const supabase = createServerSupabase();
  const id = String(form.get("id") ?? "");

  /*
   * The course a lesson belongs to comes from its module.
   *
   * `sync_lesson_course` derives exactly this on the way in, so the value sent
   * here is never the one that lands — but the column is NOT NULL with no
   * default, and a trigger is invisible to the generated types. Reading it is
   * cheaper than a cast, and it fails loudly if the module has gone.
   */
  const { data: section } = await supabase
    .from("modules")
    .select("course_id")
    .eq("id", parsed.data.module_id)
    .maybeSingle();

  if (!section) return fail(mn.admin.errors.notFound, { module_id: mn.admin.errors.notFound });
  const values = { ...parsed.data, course_id: section.course_id };

  if (id) {
    const { error } = await supabase.from("lessons").update(values).eq("id", id);
    if (error) return fail(describeError(error), { slug: describeError(error) });
    await revalidateAdmin();
    return { ok: true };
  }

  const { data, error } = await supabase.from("lessons").insert(values).select("id").single();
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
