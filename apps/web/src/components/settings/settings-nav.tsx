"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, LifeBuoy, ShieldCheck, UserRound } from "lucide-react";
import { accountPath, type Locale, type Strings } from "@jarvis/core";
import { cn } from "@/lib/cn";

/**
 * The categories of «Тохиргоо», drawn two ways from one array.
 *
 * On a laptop it is a column of groups beside the page, the way Linear lays out
 * its own settings: a group label, then its links. Below `lg` the column folds
 * into one row of pills that scrolls inside itself (`.rail-scroll`) — a column
 * on a phone would push the page a screen down before anybody reached it, and
 * the group labels go, because a row has nowhere to put a heading.
 *
 * Current category is the **exact** path, not the longest prefix: `/account`
 * is a prefix of the other two, and here the first category is that URL
 * itself rather than a parent of them.
 */

type Item = { href: string; label: string; icon: typeof UserRound };
type Group = { label: string; items: Item[] };

function buildGroups(locale: Locale, t: Strings): Group[] {
  const copy = t.auth.settings;
  return [
    {
      label: copy.groups.account,
      items: [
        { href: accountPath(locale), label: copy.profile, icon: UserRound },
        /* Under «Бүртгэл» because what somebody needs help with is, nearly
           always, their account: a payment, a course that did not open. */
        { href: accountPath(locale, "/help"), label: copy.help, icon: LifeBuoy },
      ],
    },
    {
      label: copy.groups.legal,
      items: [
        { href: accountPath(locale, "/terms"), label: copy.terms, icon: FileText },
        { href: accountPath(locale, "/privacy"), label: copy.privacy, icon: ShieldCheck },
      ],
    },
  ];
}

export function SettingsNav({ locale, t }: { locale: Locale; t: Strings }) {
  const pathname = usePathname();
  const groups = buildGroups(locale, t);

  return (
    <nav
      aria-label={t.auth.settings.menu}
      className="rail-scroll -mx-1 flex gap-1 px-1 lg:mx-0 lg:flex-col lg:gap-6 lg:px-0"
    >
      {groups.map((group) => (
        /* `contents` below `lg`: the group stops being a box, so every pill sits
           in the one scrolling row rather than in a row per group. */
        <div key={group.label} className="contents lg:block lg:space-y-0.5">
          <p className="kicker mb-2 hidden px-2.5 lg:block">{group.label}</p>
          {group.items.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex shrink-0 items-center gap-2.5 rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors",
                  "lg:rounded-md lg:px-2.5",
                  active
                    ? "bg-accent-soft text-accent lg:bg-panel-2 lg:text-ink"
                    : "text-ink-3 hover:bg-panel-2 hover:text-ink",
                )}
              >
                <item.icon className="size-4" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
