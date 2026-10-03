"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GraduationCap,
  Hand,
  LayoutGrid,
  MessageCircleQuestion,
  Settings,
  Shield,
} from "lucide-react";
import {
  accountPath,
  adminPath,
  askPath,
  canSeeAdmin,
  dashboardPath,
  helloPath,
  learnPath,
  type Locale,
  type Role,
  type Strings,
} from "@jarvis/core";
import { cn } from "@/lib/cn";

/**
 * The student's navigation — one set of links, drawn two ways.
 *
 * On a phone it is a **tab bar along the bottom**, the shape every app on that
 * phone already taught the reader: four destinations, always visible, inside
 * the thumb's reach. A rail at the top of a small screen means the reader scrolls the
 * navigation away the moment they start reading, and then scrolls back up to
 * move anywhere.
 *
 * On a laptop it is a row in the top bar. A bottom bar on a 27-inch screen puts
 * the navigation as far from the content as the geometry allows.
 *
 * Both shapes are built from the same array in the same component, so a link
 * cannot exist on one and not the other — the failure mode that a second
 * component would produce on its first edit.
 */

type NavLink = {
  href: string;
  label: string;
  icon: typeof Hand;
};

function buildLinks(locale: Locale, t: Strings, role: Role | null): NavLink[] {
  const links: NavLink[] = [
    { href: helloPath(locale), label: t.nav.tab.hello, icon: Hand },
    { href: dashboardPath(locale), label: t.nav.tab.dashboard, icon: LayoutGrid },
    { href: learnPath(locale), label: t.nav.tab.learn, icon: GraduationCap },
    /* «Мэдэхгүй зүйлээ асуу». Five tabs fit 360px at 72px each — the width the
       labels were written for; an admin's sixth is the team's own cost. */
    { href: askPath(locale), label: t.nav.tab.ask, icon: MessageCircleQuestion },
    /* «Тусламж» was a fifth tab, pointing at the public contact page. It is a
       category of settings now (`/account/help`): the rail has no footer, and
       somebody whose payment went wrong still has to reach a person — they
       reach them from their own account, which is where they were looking. */
    { href: accountPath(locale), label: t.nav.tab.account, icon: Settings },
  ];

  if (canSeeAdmin(role)) {
    links.push({ href: adminPath(locale), label: t.nav.tab.admin, icon: Shield });
  }

  return links;
}

/**
 * Which link is the current one, by **longest prefix**.
 *
 * `/mn/dashboard` is a prefix of nothing else here, but `/mn` would be a prefix
 * of everything — and when two match, the longer one is the page you are on.
 */
function currentHref(pathname: string, links: NavLink[]): string | undefined {
  return links
    .filter((link) => pathname === link.href || pathname.startsWith(`${link.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;
}

/** The row that sits in the top bar on a laptop. */
export function AppNavBar({ locale, t, role }: { locale: Locale; t: Strings; role: Role | null }) {
  const pathname = usePathname();
  const links = buildLinks(locale, t, role);
  const current = currentHref(pathname, links);

  return (
    <nav aria-label={t.nav.tab.menu} className="hidden items-center gap-0.5 lg:flex">
      {links.map((link) => {
        const active = current === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-2 rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors",
              active ? "bg-accent-soft text-accent" : "text-ink-3 hover:bg-panel-2 hover:text-ink",
            )}
          >
            <link.icon className="size-4" aria-hidden="true" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

/**
 * The tab bar along the bottom of a phone.
 *
 * Fixed, not sticky: it stays put while the page scrolls under it, which is the
 * whole point. `pb-[env(safe-area-inset-bottom)]` keeps the labels above the
 * home indicator on an iPhone — without it the bottom row of text sits under a
 * bar the user cannot move.
 */
export function AppTabBar({ locale, t, role }: { locale: Locale; t: Strings; role: Role | null }) {
  const pathname = usePathname();
  const links = buildLinks(locale, t, role);
  const current = currentHref(pathname, links);

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
                {/*
                 * The pill behind the icon is the whole active state on a phone
                 * — a 10px label changing colour is not a signal anybody reads
                 * at arm's length.
                 */}
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
