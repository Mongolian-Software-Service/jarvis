"use server";

import { z } from "zod";
import { mn } from "@jarvis/core";
import { createServerSupabase } from "@/lib/supabase/server";
import { describeError, fail, requireAdmin, type ActionResult } from "../guard";
import { revalidateAdmin } from "./shared";

/**
 * Take a message out of «Мэдэхгүй зүйлээ асуу», from the console.
 *
 * The room already lets the team delete anybody's message (`chat_delete`,
 * 20261003000100); this is the same delete from a list of every message at
 * once, rather than the room's last screenful. Realtime tells every open room
 * the row is gone, so it disappears there without a reload.
 *
 * Through the request-scoped client, so `chat_delete` is the gate and not this
 * code. A delete RLS refuses matches nothing rather than erroring, so the row
 * count is read and «nothing happened» is said instead of reported as success.
 */
export async function removeChatMessage(id: string): Promise<ActionResult> {
  const parsed = z.uuid().safeParse(id);
  if (!parsed.success) return fail(mn.admin.errors.saveFailed);

  const admin = await requireAdmin();
  if (!admin.ok) return fail(admin.error);

  const supabase = createServerSupabase();
  const { error, count } = await supabase
    .from("chat_messages")
    .delete({ count: "exact" })
    .eq("id", parsed.data);

  if (error) return fail(describeError(error));
  if (!count) return fail(mn.admin.errors.saveFailed);

  // The console's list, and the room's first screen for the next visitor.
  await revalidateAdmin();
  return { ok: true };
}
