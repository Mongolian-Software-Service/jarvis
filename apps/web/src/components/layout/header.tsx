import Link from "next/link";
import {
  SITE_NAME,
  aboutPath,
  contactPath,
  coursesPath,
  homePath,
  signInPath,
  signUpPath,
  type Locale,
  type Strings,
} from "@jarvis/core";
import { buttonClass } from "@/components/ui/button";
import { Logo } from "./logo";
import { SiteNav, type MenuLink } from "./site-nav";

/**
 * The bar a *visitor* reads — somebody deciding about the school.
 *
 * It knows nothing about sessions, and does not ask: `(site)/layout.tsx` draws
 * the app rail instead the moment there is a reader who is signed in, so this
 * bar only ever renders for somebody who is not. That is why there is no
 * sign-out button here and no admin link — a branch nobody can reach is a
 * branch that quietly stops being true.
 */
export function Header({ locale, t }: { locale: Locale; t: Strings }) {
  /*
   * One array: the bar draws it above `lg` and the sheet draws the same thing
   * below, so a link cannot exist on one and not the other.
   */
  const links: MenuLink[] = [
    { href: homePath(locale), label: t.nav.home },
    { href: coursesPath(locale), label: t.nav.courses },
    { href: contactPath(locale), label: t.nav.contact },
    { href: aboutPath(locale), label: t.nav.about },
  ];

  return (
    <header className="bar sticky top-0 z-40">
      {/*
       * The first thing the tab key reaches, and the only thing on the page
       * that is invisible until it is focused. Without it a keyboard reader
       * walks the whole bar again on every page they open.
       */}
      <a href="#main" className="skip-link">
        {t.nav.skip}
      </a>

      <div className="shell flex h-14 items-center gap-4">
        <Link href={homePath(locale)} aria-label={SITE_NAME} className="shrink-0">
          <Logo />
        </Link>

        <SiteNav links={links} label={t.nav.tab.menu} />

        {/*
         * Below `lg` the bar carries the wordmark and **one** control, and the
         * one it should be is the ask. Everything else — including «Нэвтрэх» —
         * lives in the tab bar along the bottom, where a thumb already is.
         */}
        <div className="ml-auto flex items-center gap-2">
          <Link
            href={signInPath(locale)}
            className={buttonClass("ghost", "sm", "hidden lg:inline-flex")}
          >
            {t.nav.signIn}
          </Link>
          <Link href={signUpPath(locale)} className={buttonClass("primary", "sm")}>
            {t.nav.signUp}
          </Link>
        </div>
      </div>
    </header>
  );
}
