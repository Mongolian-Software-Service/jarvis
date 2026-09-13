"use client";

import { useState } from "react";
import { Mail, MessageSquare, Phone, User } from "lucide-react";
import { formatDate, type Locale, type Strings } from "@jarvis/core";
import type { FeedbackMessage } from "@/lib/queries/admin";
import { FeedbackDialog } from "./feedback-dialog";

/**
 * The queue: who wrote, how to reach them, and when.
 *
 * The message itself is **not** in the row. A hundred-word request set in a
 * table cell either wraps the row to six lines or is truncated to a fragment
 * that reads like a different sentence — so the row carries the three things
 * that identify the sender, and the words open in a dialog on top of it.
 *
 * The whole row is the button. A small "view" link at the end of a row is a
 * 24px target on a phone beside 300px of dead space that looks tappable.
 */
export function FeedbackTable({
  messages,
  locale,
  t,
}: {
  messages: FeedbackMessage[];
  locale: Locale;
  t: Strings;
}) {
  const copy = t.admin.feedback;
  const [open, setOpen] = useState<FeedbackMessage | null>(null);

  if (messages.length === 0) {
    return (
      <p className="panel border-line text-ink-3 border-dashed px-4 py-10 text-center text-sm">
        {copy.empty}
      </p>
    );
  }

  return (
    <>
      <div className="panel divide-line divide-y overflow-hidden">
        {messages.map((message) => (
          <button
            key={message.id}
            type="button"
            onClick={() => setOpen(message)}
            className="hover:bg-panel-2 block w-full px-4 py-3 text-left transition-colors"
          >
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
              <span className="text-ink flex min-w-0 items-center gap-2 text-[13.5px] font-medium">
                <User className="text-ink-3 size-4 shrink-0" aria-hidden="true" />
                <span className="truncate">{message.author.name ?? copy.noPhone}</span>
              </span>

              <span className="text-ink-2 flex items-center gap-1.5 text-[13px]">
                <Phone className="text-ink-3 size-3.5 shrink-0" aria-hidden="true" />
                {message.author.phone ?? copy.noPhone}
              </span>

              <span className="text-ink-2 flex min-w-0 items-center gap-1.5 text-[13px]">
                <Mail className="text-ink-3 size-3.5 shrink-0" aria-hidden="true" />
                <span className="truncate">{message.author.email ?? copy.noPhone}</span>
              </span>

              <span className="text-ink-3 ml-auto shrink-0 text-xs">
                {formatDate(message.createdAt, locale)}
              </span>
            </div>

            {/* One line of the message, as a hint at what the row opens. */}
            <p className="text-ink-3 mt-1.5 flex items-start gap-2 text-[13px]">
              <MessageSquare className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
              <span className="line-clamp-1">{message.body}</span>
            </p>
          </button>
        ))}
      </div>

      {open ? (
        <FeedbackDialog message={open} locale={locale} t={t} onClose={() => setOpen(null)} />
      ) : null}
    </>
  );
}
