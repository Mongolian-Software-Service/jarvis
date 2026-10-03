import "server-only";
import { CHAT_HISTORY, toChatMessage, type ChatMessage } from "@jarvis/core";
import { createServerSupabase, getUserId, supabaseConfigured } from "@/lib/supabase/server";

/**
 * The room's first screenful: the last `CHAT_HISTORY` messages, oldest first,
 * each knowing whether the reader wrote it.
 *
 * Two plain reads rather than a view. The messages are readable by everybody;
 * authorship is in `chat_authors`, whose policy returns only the reader's own
 * rows — so asking it about these ids answers "which of them are mine" and
 * nothing about anybody else (20261003000100).
 *
 * No `locale`, like `listFeedback`: nothing in a message is bilingual. An
 * error is an empty room, so the page still renders before the migration has.
 */
export async function listChat(): Promise<ChatMessage[]> {
  if (!supabaseConfigured()) return [];
  const userId = await getUserId();
  if (!userId) return [];

  const supabase = createServerSupabase();
  const { data: rows, error } = await supabase
    .from("chat_messages")
    .select("id, body, author_first_name, author_initial, is_team, is_teacher, created_at")
    .order("created_at", { ascending: false })
    .limit(CHAT_HISTORY);

  if (error || !rows?.length) return [];

  const { data: authored } = await supabase
    .from("chat_authors")
    .select("message_id")
    .in(
      "message_id",
      rows.map((row) => row.id),
    );
  const mine = new Set((authored ?? []).map((row) => row.message_id));

  // Newest first to take the right hundred; oldest first to read them.
  return rows
    .map((row) => toChatMessage(row, mine.has(row.id)))
    .filter((message): message is ChatMessage => message !== null)
    .reverse();
}
