import Link from "next/link";
import { ChevronRight, Mail, User } from "lucide-react";
import { adminPath, fmt, formatDate, type Locale, type Strings } from "@jarvis/core";
import type { GrantedPerson } from "@/lib/queries/admin";
import { cn } from "@/lib/cn";
import { GrantKindBadge } from "./grant-kind-badge";

/**
 * «Эрх олгосон хүмүүс» — everybody the team has opened the school for.
 *
 * The search above answers "can I open it for this address"; this answers the
 * question the team asks next, "who did we open it for". Each row is a link to
 * the same page with that address in the search, so the card with «хаах» on it
 * is one tap away rather than an address to copy and paste back up the page.
 *
 * Plain links, not client state, for the reason the search is a GET form: the
 * person being looked at lives in the URL. The row for them is marked, and
 * every row says why they were let in — VIP or Бэлэг.
 */
export function GrantedList({
  people,
  selected,
  locale,
  t,
}: {
  people: GrantedPerson[];
  selected: string;
  locale: Locale;
  t: Strings;
}) {
  const copy = t.admin.access.list;
  const base = adminPath(locale, "/access");

  return (
    <section className="space-y-3">
      <div>
        <h2 className="font-display flex items-baseline gap-2 text-[17px]">
          {copy.title}
          {people.length > 0 ? (
            <span className="text-ink-3 tabular text-[13px]">{people.length}</span>
          ) : null}
        </h2>
        <p className="text-ink-3 measure mt-1 text-[13px]">{copy.deck}</p>
      </div>

      {people.length === 0 ? (
        <p className="panel border-line text-ink-3 border-dashed px-4 py-8 text-center text-sm">
          {copy.empty}
        </p>
      ) : (
        <ul className="panel divide-line divide-y overflow-hidden">
          {people.map((person) => {
            const current = Boolean(person.email) && person.email === selected;
            const body = (
              <>
                <span className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
                  <span className="text-ink flex min-w-0 items-center gap-2 text-[13.5px] font-medium sm:w-56 sm:shrink-0">
                    <User className="text-ink-3 size-4 shrink-0" aria-hidden="true" />
                    <span className="truncate">{person.name ?? "—"}</span>
                    <GrantKindBadge kind={person.kind} t={t} className="shrink-0" />
                  </span>
                  <span className="text-ink-2 flex min-w-0 items-center gap-2 text-[13px]">
                    <Mail className="text-ink-3 size-3.5 shrink-0" aria-hidden="true" />
                    <span className="truncate">{person.email ?? "—"}</span>
                  </span>
                </span>
                <span className="text-ink-3 shrink-0 text-right text-[12px]">
                  <span className="tabular block">
                    {fmt(copy.courses, { count: person.courses })}
                  </span>
                  <span className="hidden sm:block">
                    {fmt(copy.since, { date: formatDate(person.grantedAt, locale) })}
                  </span>
                </span>
              </>
            );

            return (
              <li key={person.id}>
                {person.email ? (
                  <Link
                    href={`${base}?email=${encodeURIComponent(person.email)}`}
                    aria-current={current ? "true" : undefined}
                    className={cn(
                      "hover:bg-panel-2 flex items-center gap-3 px-4 py-3 transition-colors",
                      current && "bg-panel-2",
                    )}
                  >
                    {body}
                    <ChevronRight className="text-ink-3 size-4 shrink-0" aria-hidden="true" />
                  </Link>
                ) : (
                  <div className="flex items-center gap-3 px-4 py-3">{body}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
