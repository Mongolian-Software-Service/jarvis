import "server-only";
import { toChatMessage, type ChatMessage } from "@jarvis/core";
import { createServerSupabase, supabaseConfigured } from "@/lib/supabase/server";

/**
 * Every message in «Мэдэхгүй зүйлээ асуу», newest first, for the team to read
 * and take down.
 *
 * Through the admin's own session: `chat_read` asks `is_chat_member()`, which
 * says yes to the team (20261004000100), so a demoted admin reads nothing here
 * a moment after the role changes. The room shows its last `CHAT_HISTORY`
 * oldest-first; the console reads further back and newest-first, because what
 * the team comes here for is what was just said.
 *
 * The author is the printed name the insert trigger copied onto the row.
 * Which account wrote it lives in `chat_authors`, readable by its author
 * alone — and taking a message down does not need it.
 */
export async function listChatForAdmin(
  limit = 500,
): Promise<{ messages: ChatMessage[]; total: number }> {
  if (!supabaseConfigured()) return { messages: [], total: 0 };

  const supabase = createServerSupabase();
  const { data, error, count } = await supabase
    .from("chat_messages")
    .select("id, body, author_first_name, author_initial, is_team, is_teacher, created_at", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return { messages: [], total: 0 };

  const messages = data
    .map((row) => toChatMessage(row, false))
    .filter((message): message is ChatMessage => message !== null);
  return { messages, total: count ?? messages.length };
}
