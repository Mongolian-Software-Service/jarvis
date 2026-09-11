"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BookOpen, CreditCard, ExternalLink, Plus, Users } from "lucide-react";
import { adminPath, homePath, type Locale, type Strings } from "@jarvis/core";
import { Logo } from "@/components/layout/logo";
import { buttonClass } from "@/components/ui/button";
import { cn } from "@/lib/cn";

/**
 * The console's chrome: a rail, not a top bar.
 *
 * The editor below it wants the full height of the window, and a rail leaves it
 * there. Below `lg` it folds into a scrolling row, because 15rem of a phone is
 * most of the phone.
 *
 * Current section is matched by **longest prefix**, so `/admin/courses/new`
 * lights "Нийтлэх" while `/admin/courses/<id>` keeps "Сургалт" lit.
 */
export function AdminSidebar({ locale, t }: { locale: Locale; t: Strings }) {
  const pathname = usePathname();

  const links = [
    { href: adminPath(locale), label: t.admin.nav.overview, icon: BarChart3 },
    { href: adminPath(locale, "/courses"), label: t.admin.nav.courses, icon: BookOpen },
    { href: adminPath(locale, "/students"), label: t.admin.nav.students, icon: Users },
    { href: adminPath(locale, "/payments"), label: t.admin.nav.payments, icon: CreditCard },
  ];

  const newCourse = adminPath(locale, "/courses/new");
  const current = [...links, { href: newCourse, label: "", icon: Plus }]
    .filter((link) => pathname === link.href || pathname.startsWith(`${link.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  return (
    <div className="flex h-full flex-col gap-6 border-line lg:border-r lg:p-5">
      <div className="flex items-center justify-between gap-4 px-1 pt-4 lg:pt-0">
        <Link href={homePath(locale)}>
          <Logo />
        </Link>
      </div>

      <Link href={newCourse} className={buttonClass("primary", "md", "w-full")}>
        <Plus className="size-4" />
        {t.admin.courses.create}
      </Link>

      <nav className="-mx-1 flex gap-1 overflow-x-auto px-1 lg:flex-col lg:overflow-visible">
        {links.map((link) => {
          const active = current === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex shrink-0 items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-colors",
                active ? "bg-panel-2 text-ink" : "text-ink-3 hover:bg-panel-2 hover:text-ink",
              )}
            >
              <link.icon className="size-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto hidden pt-4 lg:block">
        <Link
          href={homePath(locale)}
          className="flex items-center gap-2 px-2.5 py-1.5 text-[13px] text-ink-3 hover:text-ink"
        >
          <ExternalLink className="size-4" />
          {t.admin.nav.viewSite}
        </Link>
      </div>
    </div>
  );
}
