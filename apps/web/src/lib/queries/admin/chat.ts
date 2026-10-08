import "server-only";
import { formatFullName, toChatMessage, type ChatMessage } from "@jarvis/core";
import { createServerSupabase, supabaseConfigured } from "@/lib/supabase/server";

/** A message as the console sees it: whose account wrote it, and whether it is blocked. */
export type AdminChatMessage = ChatMessage & {
  /** Null for a message whose author row is gone, which cannot be blocked. */
  authorId: string | null;
  authorBlocked: boolean;
};

export type BlockedChatUser = {
  userId: string;
  name: string | null;
  email: string | null;
  since: string;
};

type MessageRow = {
  id: string;
  body: string;
  author_first_name: string | null;
  author_initial: string | null;
  is_team: boolean;
  is_teacher: boolean;
  created_at: string;
  chat_authors: { user_id: string } | null;
};

type BlockRow = {
  user_id: string;
  created_at: string;
  profiles: { first_name: string | null; last_name: string | null; email: string | null } | null;
};

/**
 * Every message in «Мэдэхгүй зүйлээ асуу», newest first, and everybody blocked
 * from it — for the team to read, take down and block.
 *
 * Through the admin's own session: `chat_read` lets the team through
 * (20261004000100), and since 20261008000100 so do `chat_authors` and
 * `chat_blocks`, which is what puts an account behind each message. A demoted
 * admin reads nothing here a moment after the role changes.
 *
 * The author is embedded (`chat_authors` is one-to-one with the message)
 * rather than asked about with `.in(...)`: five hundred ids in a query string
 * is a URL of twenty kilobytes.
 */
export async function listChatForAdmin(limit = 500): Promise<{
  messages: AdminChatMessage[];
  total: number;
  blocked: BlockedChatUser[];
}> {
  if (!supabaseConfigured()) return { messages: [], total: 0, blocked: [] };

  const supabase = createServerSupabase();
  const [messageRead, blockRead] = await Promise.all([
    supabase
      .from("chat_messages")
      .select(
        "id, body, author_first_name, author_initial, is_team, is_teacher, created_at, chat_authors (user_id)",
        { count: "exact" },
      )
      .order("created_at", { ascending: false })
      .limit(limit),
    supabase
      .from("chat_blocks")
      .select(
        "user_id, created_at, profiles!chat_blocks_user_id_fkey (first_name, last_name, email)",
      )
      .order("created_at", { ascending: false }),
  ]);

  const blocks = (blockRead.data ?? []) as unknown as BlockRow[];
  const blockedIds = new Set(blocks.map((row) => row.user_id));

  const messages = ((messageRead.data ?? []) as unknown as MessageRow[]).flatMap((row) => {
    const message = toChatMessage(row, false);
    if (!message) return [];
    const authorId = row.chat_authors?.user_id ?? null;
    return [{ ...message, authorId, authorBlocked: authorId ? blockedIds.has(authorId) : false }];
  });

  return {
    messages,
    total: messageRead.count ?? messages.length,
    blocked: blocks.map((row) => ({
      userId: row.user_id,
      name: formatFullName(row.profiles?.last_name, row.profiles?.first_name),
      email: row.profiles?.email ?? null,
      since: row.created_at,
    })),
  };
}
