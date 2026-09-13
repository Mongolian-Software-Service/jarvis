"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, House, Info, LifeBuoy, LogIn, type LucideIcon } from "lucide-react";
import {
  aboutPath,
  contactPath,
  coursesPath,
  homePath,
  signInPath,
  type Locale,
  type Strings,
} from "@jarvis/core";
import { cn } from "@/lib/cn";

/**
 * The visitor's navigation on a phone: a bar along the bottom, not a sheet.
 *
 * A hamburger hides every destination behind a tap and a wait, and then asks
 * for a second tap to put it away. A tab bar is the thing a phone user already
 * knows — and this app has one for people who are signed in (`AppTabBar`), so
 * a visitor meeting a drawer instead was two different products in one.
 *
 * `Нэвтрэх` is the fifth tab rather than a button in the bar above, because at
 * 360px the bar has room for the wordmark and **one** control — and the one it
 * should be is «Бүртгүүлэх», which is what this page is asking for.
 *
 * The labels are `nav.tab.*`, not `nav.*`: five tabs across 390px leave about
 * 70px each, and «Бидний тухай» and «Холбоо барих» both truncated. The short
 * forms exist for this, and the signed-in bar already uses them.
 *
 * Fixed, not sticky: it stays while the page scrolls under it, which is the
 * whole point. The safe-area padding and the translucent ground come from
 * `.tabbar`, shared with the signed-in bar so the two cannot drift apart.
 */

type TabLink = { href: string; label: string; icon: LucideIcon };

export function SiteTabBar({ locale, t }: { locale: Locale; t: Strings }) {
  const pathname = usePathname();

  const links: TabLink[] = [
    { href: homePath(locale), label: t.nav.home, icon: House },
    { href: coursesPath(locale), label: t.nav.tab.courses, icon: BookOpen },
    { href: aboutPath(locale), label: t.nav.tab.about, icon: Info },
    { href: contactPath(locale), label: t.nav.tab.contact, icon: LifeBuoy },
    { href: signInPath(locale), label: t.nav.signIn, icon: LogIn },
  ];

  /* Longest prefix, like the bar above: `/mn` is a prefix of every other link. */
  const current = links
    .filter((link) => pathname === link.href || pathname.startsWith(`${link.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  return (
    <nav aria-label={t.nav.tab.menu} className="tabbar fixed inset-x-0 bottom-0 z-40 lg:hidden">
      <ul className="mx-auto flex max-w-lg items-stretch">
        {links.map((link) => {
          const active = current === link.href;
          return (
            <li key={link.href} className="min-w-0 flex-1">
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-full min-h-[3.5rem] flex-col items-center justify-center gap-1 px-1 py-2 transition-colors",
                  active ? "text-ink" : "text-ink-3",
                )}
              >
                {/* The pill behind the icon is the whole active state on a
                    phone — a 10px label changing colour is not a signal
                    anybody reads at arm's length. */}
                <span
                  className={cn(
                    "grid h-7 w-12 place-items-center rounded-full transition-colors",
                    active ? "bg-accent-soft text-accent" : "",
                  )}
                >
                  <link.icon className="size-[18px]" aria-hidden="true" />
                </span>
                <span className="w-full truncate text-center text-[10.5px] leading-none font-medium">
                  {link.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
