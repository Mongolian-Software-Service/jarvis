"use server";

import { z } from "zod";
import { chatMessageSchema, strings, toChatMessage, type ChatMessage } from "@jarvis/core";
import { createServerSupabase } from "@/lib/supabase/server";
import { getRequestLocale } from "@/lib/locale";
import { fail, requireUser, type ActionResult } from "./guard";

/**
 * «Мэдэхгүй зүйлээ асуу» — speak in the room, or take something back.
 *
 * Called with a value rather than a form: the composer is a live control, not
 * a page that posts. Neither action revalidates — the room is kept current by
 * Realtime in every open browser, including the sender's.
 */

const COLUMNS = "id, body, author_first_name, author_initial, is_team, is_teacher, created_at";

/**
 * Send a message, and hand it back.
 *
 * Only `body` is sent. Who said it is the session, and the trigger writes the
 * name and the team flag from `profiles` (20261003000100) — there is no field
 * here for a client to fill with somebody else's.
 *
 * The message comes back so the sender sees it at once and knows it is theirs:
 * Realtime may deliver the same row a moment earlier or later, and the room
 * matches the two by id.
 */
export async function sendChatMessage(body: string): Promise<ActionResult<ChatMessage>> {
  const copy = strings(await getRequestLocale()).ask.errors;

  const user = await requireUser();
  if (!user.ok) return fail(user.error);

  const parsed = chatMessageSchema(copy).safeParse({ body });
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? copy.failed);

  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("chat_messages")
    .insert({ body: parsed.data.body })
    .select(COLUMNS)
    .single();

  if (error) {
    // Both are the triggers' own words (20261003000200, 20261008000100), read
    // by name so a reader is told which wall they met rather than "failed".
    if (error.message?.includes("chat_blocked")) return fail(copy.blocked);
    return fail(error.message?.includes("chat_rate_limit") ? copy.rate : copy.failed);
  }

  const message = toChatMessage(data, true);
  return message ? { ok: true, data: message } : fail(copy.failed);
}

/**
 * Take a message down. Your own, or — for the team — anybody's.
 *
 * By id alone: `chat_delete` decides whether this reader may, and a delete the
 * policy refuses matches nothing rather than erroring, so the returned rows are
 * how "not yours" is told apart from "gone".
 */
export async function deleteChatMessage(id: string): Promise<ActionResult> {
  const copy = strings(await getRequestLocale()).ask.errors;

  const user = await requireUser();
  if (!user.ok) return fail(user.error);

  const parsed = z.uuid().safeParse(id);
  if (!parsed.success) return fail(copy.failed);

  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("chat_messages")
    .delete()
    .eq("id", parsed.data)
    .select("id");

  if (error || !data?.length) return fail(copy.failed);
  return { ok: true };
}
