"use server";

import { feedbackSchema, fieldErrors, strings } from "@jarvis/core";
import { createServerSupabase } from "@/lib/supabase/server";
import { getRequestLocale } from "@/lib/locale";
import { fail, requireUser, type ActionResult } from "./guard";

/**
 * A student says something, and it reaches the console.
 *
 * `user_id` is taken from the **session**, never from the form. A hidden field
 * would let anybody post a message as anybody else, and the policy would allow
 * it — `feedback_insert_own` checks the row against `auth.uid()`, so a forged
 * id is refused by Postgres, but the honest version never sends one.
 *
 * Nothing else is stored: the name, phone and address the console shows come
 * from the profile at read time, so they are whatever the student has since
 * corrected them to.
 */
export async function sendFeedback(_prev: unknown, form: FormData): Promise<ActionResult> {
  const locale = await getRequestLocale();
  const t = strings(locale);
  const copy = t.marketing.contact.feedback;

  const user = await requireUser();
  if (!user.ok) return fail(user.error);

  const parsed = feedbackSchema(copy).safeParse({ body: form.get("body") });
  if (!parsed.success) return fail(copy.failed, fieldErrors(parsed.error));

  const supabase = createServerSupabase();
  const { error } = await supabase
    .from("feedback")
    .insert({ user_id: user.userId, body: parsed.data.body });

  if (error) return fail(copy.failed);

  /*
   * Deliberately no `revalidatePath`. The student's own screen shows the thank
   * you from the action's own result, and the console is `force-dynamic` (§6.4)
   * — so the message is on the next admin who loads the page without anything
   * being rebuilt here.
   */
  return { ok: true };
}
