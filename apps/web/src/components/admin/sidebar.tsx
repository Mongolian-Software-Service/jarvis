"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  CreditCard,
  Globe,
  KeyRound,
  LogOut,
  MessageSquare,
  MessagesSquare,
  Plus,
  Users,
} from "lucide-react";
import { SITE_NAME, adminPath, type Locale, type Strings } from "@jarvis/core";
import { signOut } from "@/lib/actions/auth";
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
 * That row is **pinned** (see the layout), which is what decides its contents.
 * The full rail is 220px tall and pinning that much of a phone would be worse
 * than losing it, so below `lg` only what you navigate with survives: the
 * links, and the two actions as icons. The wordmark goes because the first
 * link already points where it pointed, and a pinned bar has no room to say
 * the same thing twice.
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
    { href: adminPath(locale, "/access"), label: t.admin.nav.access, icon: KeyRound },
    { href: adminPath(locale, "/projects"), label: t.admin.nav.projects, icon: Globe },
    { href: adminPath(locale, "/chat"), label: t.admin.nav.chat, icon: MessagesSquare },
    { href: adminPath(locale, "/feedback"), label: t.admin.nav.feedback, icon: MessageSquare },
  ];

  const newCourse = adminPath(locale, "/courses/new");
  const current = [...links, { href: newCourse, label: "", icon: Plus }]
    .filter((link) => pathname === link.href || pathname.startsWith(`${link.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  return (
    <div className="border-line flex h-full flex-col gap-6 py-2.5 lg:border-r lg:p-5">
      <div className="hidden items-center justify-between gap-4 px-1 lg:flex">
        <Link href={adminPath(locale)} aria-label={SITE_NAME}>
          <Logo />
        </Link>
      </div>

      <Link
        href={newCourse}
        className={buttonClass("primary", "md", "hidden w-full lg:inline-flex")}
      >
        <Plus className="size-4" />
        {t.admin.courses.create}
      </Link>

      {/* One row below `lg` — the links scroll inside it and the actions hold
          the end; at `lg` the row dissolves and the nav becomes the column. */}
      <div className="flex min-w-0 items-center gap-2 lg:block">
        <nav className="rail-scroll flex min-w-0 flex-1 gap-1 px-1 lg:-mx-1 lg:flex-col">
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

        {/* The same two actions the column carries, as icons, for the bar. */}
        <div className="flex shrink-0 items-center gap-1 lg:hidden">
          <Link
            href={newCourse}
            aria-label={t.admin.courses.create}
            title={t.admin.courses.create}
            className="bg-solid text-solid-ink grid size-8 place-items-center rounded-full"
          >
            <Plus className="size-4" />
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              aria-label={t.auth.account.signOut}
              title={t.auth.account.signOut}
              className="text-ink-3 hover:bg-panel-2 hover:text-ink grid size-8 place-items-center rounded-full transition-colors"
            >
              <LogOut className="size-4" aria-hidden="true" />
            </button>
          </form>
        </div>
      </div>

      {/*
       * The one way out, and the only thing down here.
       *
       * There used to be a "view site" link beside it. It went, because the
       * console is somewhere you are *working*: the rail's job is to move you
       * between its own screens and then let you leave, and a link back to the
       * shop floor is a way to lose your place mid-edit. Looking at a course
       * you just changed still has its own link, on that course's row, where
       * the thing being previewed is unambiguous.
       */}
      <form action={signOut} className="mt-auto hidden pt-4 lg:block">
        <button
          type="submit"
          className="text-ink-3 hover:bg-panel-2 hover:text-ink flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-[13px] transition-colors"
        >
          <LogOut className="size-4" aria-hidden="true" />
          {t.auth.account.signOut}
        </button>
      </form>
    </div>
  );
}
