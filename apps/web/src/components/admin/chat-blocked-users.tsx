import { Undo2 } from "lucide-react";
import { fmt, formatDate, type Locale, type Strings } from "@jarvis/core";
import { unblockChatUser } from "@/lib/actions/admin";
import type { BlockedChatUser } from "@/lib/queries/admin";
import { DeleteButton } from "./delete-button";

/**
 * Who is blocked from writing in the room, above the messages, each with the
 * way back (20261008000100).
 *
 * Listed by account, not by message: somebody blocked whose messages have all
 * been deleted still has to be findable to be unblocked. The name is the one on
 * their profile and the address beside it, because «Сурагч» on a message is not
 * enough to know who a block is about.
 */
export function ChatBlockedUsers({
  users,
  locale,
  t,
}: {
  users: BlockedChatUser[];
  locale: Locale;
  t: Strings;
}) {
  const copy = t.admin.chat;
  if (users.length === 0) return null;

  return (
    <section className="space-y-3">
      <div>
        <h2 className="font-display text-[17px]">{copy.blockedTitle}</h2>
        <p className="text-ink-3 mt-0.5 text-[13px]">{copy.blockedDeck}</p>
      </div>
      <ul className="panel divide-line divide-y overflow-hidden">
        {users.map((user) => (
          <li key={user.userId} className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="text-ink truncate text-[14px]">{user.name ?? user.email ?? "—"}</p>
              <p className="text-ink-3 truncate text-[12.5px]">
                {user.name && user.email ? `${user.email} · ` : ""}
                {fmt(copy.blockedSince, { date: formatDate(user.since, locale) })}
              </p>
            </div>
            <DeleteButton
              onDelete={unblockChatUser.bind(null, user.userId)}
              icon={<Undo2 className="size-4" />}
              tone="neutral"
              labels={{
                delete: copy.unblock,
                confirm: copy.confirmUnblock,
                cancel: t.actions.cancel,
              }}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
