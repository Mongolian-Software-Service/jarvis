import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Ban } from "lucide-react";
import { askPath, fmt, formatChatDay, formatClock, groupDigits } from "@jarvis/core";
import { getIntl } from "@/lib/locale";
import { listChatForAdmin } from "@/lib/queries/admin";
import { blockChatUser, removeChatMessage } from "@/lib/actions/admin";
import { DeleteButton } from "@/components/admin/delete-button";
import { ChatBlockedUsers } from "@/components/admin/chat-blocked-users";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { robots: { index: false } };

/**
 * «Чат» — everything said in «Мэдэхгүй зүйлээ асуу», and the place to take
 * down what should not be there.
 *
 * The team could already delete any message from inside the room, but only
 * from its last screenful and only one at a time while reading the
 * conversation. Moderating wants the opposite: every message, newest first,
 * the author and the exact time beside each, and a delete that asks once.
 *
 * And a block, for the person rather than the message: a student's message
 * carries one, the people blocked are listed above with the way back, and a
 * blocked author's messages wear a mark (20261008000100).
 *
 * A list, like «Төслүүд»: the words are the thing being judged, and a table
 * would give them one narrow column of four on a phone. The body keeps its
 * line breaks and wraps a long unbroken string rather than widening the page.
 */
export default async function AdminChatPage() {
  const { locale, t } = await getIntl();
  const copy = t.admin.chat;
  const { messages, total, blocked } = await listChatForAdmin();

  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h1 className="font-display text-[26px]">{copy.title}</h1>
          <Link
            href={askPath(locale)}
            className="text-ink-3 hover:text-ink inline-flex items-center gap-1 text-[13px] transition-colors"
          >
            {copy.openRoom}
            <ArrowUpRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
        <p className="text-ink-3 measure text-[13.5px]">{copy.deck}</p>
        {total > 0 ? (
          <p className="text-ink-3 tabular text-[12.5px]">
            {fmt(copy.count, { count: groupDigits(total) })}
            {total > messages.length
              ? ` · ${fmt(copy.limited, { count: groupDigits(messages.length) })}`
              : ""}
          </p>
        ) : null}
      </header>

      <ChatBlockedUsers users={blocked} locale={locale} t={t} />

      {messages.length === 0 ? (
        <p className="panel border-line text-ink-3 border-dashed px-4 py-10 text-center text-sm">
          {copy.empty}
        </p>
      ) : (
        <ul className="panel divide-line divide-y overflow-hidden">
          {messages.map((message) => (
            <li key={message.id} className="flex items-start gap-3 px-4 py-3.5">
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px]">
                  <span className="text-ink font-medium">{message.author ?? t.ask.anonymous}</span>
                  {message.isTeacher ? (
                    <Badge tone="accent">{t.ask.teacher}</Badge>
                  ) : message.isTeam ? (
                    <Badge>{t.ask.team}</Badge>
                  ) : null}
                  {message.authorBlocked ? <Badge tone="bad">{copy.blockedBadge}</Badge> : null}
                  {/* Ulaanbaatar's calendar and clock, like the room — the
                      server and the browser cannot disagree about either. */}
                  <span className="text-ink-3 tabular">
                    {formatChatDay(message.createdAt)} · {formatClock(message.createdAt)}
                  </span>
                </p>
                <p className="text-ink-2 mt-1 text-[14px] leading-relaxed break-words whitespace-pre-wrap">
                  {message.body}
                </p>
              </div>

              {/* Bound server actions: the id travels with the reference, so
                  this page stays a server component. A block is offered on a
                  student's message only — never the team's, and not on one
                  whose author is already blocked (the list above unblocks). */}
              <div className="flex shrink-0 flex-col items-end gap-1 sm:flex-row sm:items-center">
                {message.authorId && !message.isTeam && !message.authorBlocked ? (
                  <DeleteButton
                    onDelete={blockChatUser.bind(null, message.authorId)}
                    icon={<Ban className="size-4" />}
                    labels={{
                      delete: copy.block,
                      confirm: copy.confirmBlock,
                      cancel: t.actions.cancel,
                    }}
                  />
                ) : null}
                <DeleteButton
                  onDelete={removeChatMessage.bind(null, message.id)}
                  labels={{
                    delete: t.actions.delete,
                    confirm: t.actions.confirmDelete,
                    cancel: t.actions.cancel,
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
