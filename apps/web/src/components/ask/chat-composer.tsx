"use client";

import { useState, useTransition, type KeyboardEvent } from "react";
import { Loader2, SendHorizontal } from "lucide-react";
import { CHAT_MESSAGE_MAX, type ChatMessage, type Strings } from "@jarvis/core";
import { sendChatMessage } from "@/lib/actions/chat";
import { cn } from "@/lib/cn";

/**
 * Where a question is written.
 *
 * Enter sends and Shift+Enter starts a new line — the convention of every chat
 * a student already uses — except while a keyboard is still composing a
 * character, when Enter belongs to the keyboard and not to us.
 *
 * What was typed is kept until the server has the message. Clearing the box on
 * the keypress and then failing would lose a question somebody took a minute
 * to word; the error says why, and the words are still there to send again.
 */
export function ChatComposer({
  onSent,
  t,
}: {
  onSent: (message: ChatMessage) => void;
  t: Strings;
}) {
  const copy = t.ask;
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function send() {
    if (pending || body.trim() === "") return;
    setError(null);
    start(async () => {
      const result = await sendChatMessage(body);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setBody("");
      onSent(result.data);
    });
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) return;
    event.preventDefault();
    send();
  }

  return (
    <div className="border-line border-t p-3">
      {error ? <p className="text-bad mb-2 px-1 text-[12.5px]">{error}</p> : null}

      <div className="bg-panel-2 border-line focus-within:border-accent flex items-end gap-2 rounded-xl border p-2 transition-colors">
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          onKeyDown={onKeyDown}
          rows={1}
          maxLength={CHAT_MESSAGE_MAX}
          placeholder={copy.placeholder}
          aria-label={copy.placeholder}
          // `field-sizing` grows the box with what is typed, up to the cap; a
          // browser without it keeps one line and scrolls inside, which works.
          className="placeholder:text-ink-3 [field-sizing:content] max-h-40 min-h-9 flex-1 resize-none bg-transparent px-2 py-1.5 text-[14px] leading-[1.5] focus:outline-none"
        />
        <button
          type="button"
          onClick={send}
          disabled={pending || body.trim() === ""}
          aria-label={pending ? copy.sending : copy.send}
          title={copy.send}
          className={cn(
            "bg-solid text-solid-ink hover:bg-solid-hover grid size-9 shrink-0 place-items-center rounded-full transition-colors",
            "disabled:pointer-events-none disabled:opacity-40",
          )}
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <SendHorizontal className="size-4" aria-hidden="true" />
          )}
        </button>
      </div>

      <p className="text-ink-3 mt-2 px-1 text-[11.5px]">
        <span className="hidden sm:inline">{copy.hint} · </span>
        {copy.tips.privacy}
      </p>
    </div>
  );
}
