"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

export type MenuLink = { href: string; label: string };

/**
 * The bar's links, with the current one marked.
 *
 * A client component for one reason: `usePathname`. The header around it stays
 * a server component, and only this list re-renders on the client — the same
 * split the admin rail uses.
 *
 * Current is matched by **longest prefix**. `/mn` is a prefix of every other
 * link, so a plain `startsWith` would light «Нүүр» on every page; the longest
 * match is the page you are actually on.
 *
 * `aria-current="page"` is not decoration either: the colour change is the
 * sighted half of the same signal, and a screen reader has nothing without it.
 */
export function SiteNav({ links, label }: { links: MenuLink[]; label: string }) {
  const pathname = usePathname();

  const current = links
    .filter((link) => pathname === link.href || pathname.startsWith(`${link.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  return (
    <nav aria-label={label} className="ml-2 hidden items-center gap-1 lg:flex">
      {links.map((link) => {
        const active = current === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-md px-2.5 py-1.5 text-[13px] transition-colors",
              active ? "bg-panel-2 text-ink" : "text-ink-3 hover:bg-panel-2 hover:text-ink",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
