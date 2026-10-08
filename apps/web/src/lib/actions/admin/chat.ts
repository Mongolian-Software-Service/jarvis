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

/**
 * Stop somebody writing in the room (20261008000100). They keep reading it.
 *
 * Only `user_id` is sent — the column grant allows nothing else — so who
 * blocked and when are the database's own record. Not the team: the policy
 * refuses blocking yourself, and blocking another admin is refused here, where
 * the sentence can say why. A second block of the same person is not an
 * error, it is already true (`ignoreDuplicates`).
 *
 * Errors are not passed through `describeError()`: it reads a duplicate as a
 * taken slug and a policy refusal as "no permission", neither of which is
 * what happened here.
 */
export async function blockChatUser(userId: string): Promise<ActionResult> {
  const copy = mn.admin.chat;
  const parsed = z.uuid().safeParse(userId);
  if (!parsed.success) return fail(mn.admin.errors.saveFailed);

  const admin = await requireAdmin();
  if (!admin.ok) return fail(admin.error);
  if (parsed.data === admin.userId) return fail(copy.cannotBlockSelf);

  const supabase = createServerSupabase();
  const { data: target } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", parsed.data)
    .maybeSingle();
  if (target?.role === "admin") return fail(copy.cannotBlockTeam);

  const { error } = await supabase
    .from("chat_blocks")
    .upsert({ user_id: parsed.data }, { onConflict: "user_id", ignoreDuplicates: true });
  if (error) return fail(mn.admin.errors.saveFailed);

  await revalidateAdmin();
  return { ok: true };
}

/** Let them write again. Their old messages were never touched by the block. */
export async function unblockChatUser(userId: string): Promise<ActionResult> {
  const parsed = z.uuid().safeParse(userId);
  if (!parsed.success) return fail(mn.admin.errors.saveFailed);

  const admin = await requireAdmin();
  if (!admin.ok) return fail(admin.error);

  const supabase = createServerSupabase();
  const { error, count } = await supabase
    .from("chat_blocks")
    .delete({ count: "exact" })
    .eq("user_id", parsed.data);
  if (error || !count) return fail(mn.admin.errors.saveFailed);

  await revalidateAdmin();
  return { ok: true };
}
