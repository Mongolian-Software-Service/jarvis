"use client";

import { useTransition } from "react";
import { GraduationCap, Loader2, Trash2 } from "lucide-react";
import { formatClock, type ChatMessage, type Strings } from "@jarvis/core";
import { StudentAvatar } from "@/components/ui/student-avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";

/**
 * One line of the room: who, when, and what they said.
 *
 * A list, not bubbles left and right. A room this size is read like a thread —
 * the answer under the question — and bubbles push half of every message to
 * the far side of a laptop screen. The reader's own messages are told apart by
 * «Та» beside the name and a faint ground, which is enough to find them.
 *
 * The body is text and nothing else: whitespace kept, nothing turned into a
 * link or markup, because anybody in the school can write here.
 *
 * A teacher's message is the one exception to "a list, all alike": an accent
 * rule down its left edge, a faint accent ground, an accent ring on the
 * avatar and «Багш» beside the name. A student scanning a long thread for the
 * answer they can trust should find it without reading every line — and the
 * mark comes from `teacher_emails` through the insert trigger, so nobody can
 * give it to themselves.
 *
 * Deleting is offered on the reader's own messages and, to the team, on all of
 * them. On a mouse it appears on hover; on a touch screen there is no hover to
 * wait for, so it is simply there.
 */
export function ChatLine({
  message,
  canDelete,
  onDelete,
  t,
}: {
  message: ChatMessage;
  canDelete: boolean;
  onDelete: (id: string) => Promise<void>;
  t: Strings;
}) {
  const copy = t.ask;
  const [pending, start] = useTransition();

  return (
    <li
      className={cn(
        "group flex gap-3 rounded-lg px-3 py-2.5 transition-colors",
        message.isTeacher
          ? "bg-accent-soft/60 border-accent border-l-2 pl-[10px]"
          : message.isMine
            ? "bg-panel-2/60"
            : "hover:bg-panel-2/40",
      )}
    >
      <StudentAvatar
        id={message.id}
        className={cn("mt-0.5 size-8", message.isTeacher && "border-accent ring-accent/30 ring-2")}
      />

      <div className="min-w-0 flex-1">
        <p className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5">
          <span
            className={cn("truncate text-[13.5px] font-medium", message.isTeacher && "text-accent")}
          >
            {message.author ?? copy.anonymous}
          </span>
          {/* A teacher who is also on the team is shown as the teacher: that
              is the mark a student is looking for. */}
          {message.isTeacher ? (
            <Badge tone="accent">
              <GraduationCap className="size-3" aria-hidden="true" />
              {copy.teacher}
            </Badge>
          ) : message.isTeam ? (
            <Badge tone="accent">{copy.team}</Badge>
          ) : null}
          {message.isMine ? <span className="text-ink-3 text-[12px]">{copy.you}</span> : null}
          <time dateTime={message.createdAt} className="text-ink-3 tabular text-[12px]">
            {formatClock(message.createdAt)}
          </time>
        </p>
        <p
          className={cn(
            "mt-0.5 text-[14px] leading-[1.65] break-words whitespace-pre-wrap",
            message.isTeacher ? "text-ink" : "text-ink-2",
          )}
        >
          {message.body}
        </p>
      </div>

      {canDelete ? (
        <button
          type="button"
          disabled={pending}
          onClick={() => start(() => onDelete(message.id))}
          aria-label={copy.remove}
          title={copy.remove}
          className={cn(
            "text-ink-3 hover:text-bad grid size-7 shrink-0 place-items-center rounded-md transition",
            "focus-visible:opacity-100 pointer-fine:opacity-0 pointer-fine:group-hover:opacity-100",
          )}
        >
          {pending ? (
            <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <Trash2 className="size-3.5" aria-hidden="true" />
          )}
        </button>
      ) : null}
    </li>
  );
}
