"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import {
  formatChatDay,
  toChatMessage,
  type ChatMessage,
  type ChatRow,
  type Strings,
} from "@jarvis/core";
import { browserSupabase } from "@/lib/supabase/client";
import { deleteChatMessage } from "@/lib/actions/chat";
import { cn } from "@/lib/cn";
import { ChatLine } from "./chat-message";
import { ChatComposer } from "./chat-composer";
import { ChatBlocked } from "./chat-blocked";

/** How much of the room one open tab keeps; older lines drop off the top. */
const KEEP = 500;

/**
 * The room, live.
 *
 * The first screenful arrives from the server; after that, every insert and
 * delete in `chat_messages` comes in over Supabase Realtime. That is the one
 * read in this codebase a client component makes, and it is a subscription
 * rather than a query: the server cannot push to a page it has finished.
 * Writes still go through server actions (§6.2).
 *
 * The browser knows a message is the reader's own by its id — the ones the
 * page loaded with, and the ones the composer just sent. Realtime may deliver
 * the sender's own row before the action returns or after it, so both paths
 * add by id and never twice.
 */
export function ChatRoom({
  initial,
  canModerate,
  blocked = false,
  t,
}: {
  initial: ChatMessage[];
  canModerate: boolean;
  /** Blocked from writing (20261008000100): the room reads, the composer goes. */
  blocked?: boolean;
  t: Strings;
}) {
  const copy = t.ask;
  const [messages, setMessages] = useState(initial);
  const [live, setLive] = useState<"connecting" | "live" | "offline">("connecting");
  const mine = useRef(new Set(initial.filter((m) => m.isMine).map((m) => m.id)));
  const list = useRef<HTMLDivElement>(null);
  // Whether the reader is at the bottom. Only then does a new line pull them
  // down — somebody scrolled up to read an old answer is left where they are.
  const pinned = useRef(true);

  const add = useCallback((message: ChatMessage) => {
    setMessages((prev) =>
      prev.some((m) => m.id === message.id)
        ? prev.map((m) => (m.id === message.id ? { ...m, isMine: m.isMine || message.isMine } : m))
        : [...prev, message].slice(-KEEP),
    );
  }, []);

  useEffect(() => {
    const supabase = browserSupabase();
    const channel = supabase
      .channel("chat-room")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages" },
        (payload) => {
          const row = payload.new as ChatRow;
          const message = toChatMessage(row, Boolean(row.id && mine.current.has(row.id)));
          if (message) add(message);
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "chat_messages" },
        (payload) => {
          const id = (payload.old as { id?: string }).id;
          if (id) setMessages((prev) => prev.filter((m) => m.id !== id));
        },
      )
      .subscribe((status) => {
        setLive(
          status === "SUBSCRIBED"
            ? "live"
            : status === "CHANNEL_ERROR" || status === "TIMED_OUT"
              ? "offline"
              : "connecting",
        );
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [add]);

  // Follow the conversation while the reader is following it.
  useEffect(() => {
    const box = list.current;
    if (box && pinned.current) box.scrollTop = box.scrollHeight;
  }, [messages]);

  function onSent(message: ChatMessage) {
    mine.current.add(message.id);
    pinned.current = true;
    add(message);
  }

  async function onDelete(id: string) {
    const result = await deleteChatMessage(id);
    if (result.ok) setMessages((prev) => prev.filter((m) => m.id !== id));
  }

  return (
    <section aria-label={copy.title} className="panel flex min-h-0 flex-col overflow-hidden">
      <div className="border-line flex items-center justify-end gap-2 border-b px-4 py-2 text-[12px]">
        <span
          aria-hidden="true"
          className={cn(
            "size-1.5 rounded-full",
            live === "live" ? "bg-ok" : live === "offline" ? "bg-bad" : "bg-ink-3",
          )}
        />
        <span className="text-ink-3" role="status">
          {live === "offline" ? copy.offline : copy.live}
        </span>
      </div>

      <div
        ref={list}
        onScroll={(event) => {
          const box = event.currentTarget;
          pinned.current = box.scrollHeight - box.scrollTop - box.clientHeight < 80;
        }}
        className="min-h-0 flex-1 overflow-y-auto px-2 py-3"
      >
        {messages.length === 0 ? (
          <p className="text-ink-3 grid h-full place-items-center px-4 text-center text-[14px]">
            {copy.empty}
          </p>
        ) : (
          <ol aria-live="polite" className="space-y-0.5">
            {messages.map((message, index) => {
              const day = formatChatDay(message.createdAt);
              const newDay = index === 0 || day !== formatChatDay(messages[index - 1]!.createdAt);
              return (
                <Fragment key={message.id}>
                  {newDay ? (
                    <li
                      aria-hidden="true"
                      className="text-ink-3 flex items-center gap-3 px-3 py-3 text-[11.5px]"
                    >
                      <span className="bg-line h-px flex-1" />
                      {day}
                      <span className="bg-line h-px flex-1" />
                    </li>
                  ) : null}
                  <ChatLine
                    message={message}
                    canDelete={message.isMine || canModerate}
                    onDelete={onDelete}
                    t={t}
                  />
                </Fragment>
              );
            })}
          </ol>
        )}
      </div>

      {blocked ? <ChatBlocked t={t} /> : <ChatComposer onSent={onSent} t={t} />}
    </section>
  );
}
