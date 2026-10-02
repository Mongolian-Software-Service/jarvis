"use server";

import { revalidatePath } from "next/cache";
import {
  dashboardPath,
  fieldErrors,
  fmt,
  helloPath,
  PROJECT_LIMIT,
  projectIdSchema,
  projectSchema,
  strings,
  type Locale,
} from "@jarvis/core";
import { createServerSupabase } from "@/lib/supabase/server";
import { getRequestLocale } from "@/lib/locale";
import { fail, requireUser, type ActionResult } from "./guard";

/**
 * «Миний төслүүд» — keep, change and take down the link to something a
 * student made.
 *
 * `user_id` comes from the **session**, never the form, like `sendFeedback`:
 * the policy would refuse a forged one, but the honest version never sends it.
 */

/**
 * One action for adding and for changing. A form with an `id` edits that
 * project; without one it adds a new project.
 *
 * The edit filters on `user_id` as well as `id`. The policy already confines it
 * to the student's own rows, and saying so here as well means a forged id
 * matches nothing even if that policy is ever loosened.
 */
export async function saveProject(_prev: unknown, form: FormData): Promise<ActionResult> {
  const locale = await getRequestLocale();
  const copy = strings(locale).learn.projects;

  const user = await requireUser();
  if (!user.ok) return fail(user.error);

  const parsed = projectSchema(copy.validation).safeParse({
    url: form.get("url") ?? "",
    title: form.get("title") ?? "",
    description: form.get("description") ?? "",
  });
  if (!parsed.success) return fail(copy.failed, fieldErrors(parsed.error));

  const rawId = form.get("id");
  const id = rawId ? projectIdSchema.safeParse(rawId) : null;
  if (id && !id.success) return fail(copy.failed);

  const supabase = createServerSupabase();
  const { error } = id
    ? await supabase
        .from("projects")
        .update(parsed.data)
        .eq("id", id.data)
        .eq("user_id", user.userId)
    : await supabase.from("projects").insert({ user_id: user.userId, ...parsed.data });

  if (error) return fail(describeProjectError(error, copy));

  revalidateProjects(locale);
  return { ok: true };
}

/** Delete by (session, id): only one row it can be, and only theirs. */
export async function removeProject(_prev: unknown, form: FormData): Promise<ActionResult> {
  const locale = await getRequestLocale();
  const copy = strings(locale).learn.projects;

  const user = await requireUser();
  if (!user.ok) return fail(user.error);

  const id = projectIdSchema.safeParse(form.get("id"));
  if (!id.success) return fail(copy.failed);

  const supabase = createServerSupabase();
  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", id.data)
    .eq("user_id", user.userId);

  if (error) return fail(copy.failed);

  revalidateProjects(locale);
  return { ok: true };
}

/**
 * The one refusal a correct form can still meet, named: `project_limit`, the
 * trigger (20261002000300) turning away an eleventh project. The dashboard
 * hides the form at ten, so this is a second tab, or a race. Anything else is
 * "saving failed" — there is no enrolment check to explain any more, so a
 * 42501 here would be a bug, not a student's situation.
 */
function describeProjectError(
  error: { code?: string; message?: string },
  copy: ReturnType<typeof strings>["learn"]["projects"],
): string {
  if (error.message?.includes("project_limit")) return fmt(copy.limit, { count: PROJECT_LIMIT });
  return copy.failed;
}

/** The dashboard lists the student's own; «Сайн уу» shows everybody's. */
function revalidateProjects(locale: Locale): void {
  revalidatePath(dashboardPath(locale));
  revalidatePath(helloPath(locale));
}
