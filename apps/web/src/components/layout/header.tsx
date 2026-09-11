import Link from "next/link";
import {
  aboutPath,
  adminPath,
  canSeeAdmin,
  contactPath,
  coursesPath,
  homePath,
  learnPath,
  signInPath,
  type Locale,
  type Strings,
} from "@jarvis/core";
import { getViewer } from "@/lib/queries/viewer";
import { signOut } from "@/lib/actions/auth";
import { buttonClass } from "@/components/ui/button";
import { Logo } from "./logo";
import { LocaleSwitcher } from "./locale-switcher";
import { MobileMenu, type MenuLink } from "./mobile-menu";

/**
 * The bar, on every page of the site.
 *
 * A server component: it asks who is reading and draws accordingly. What that
 * person may *do* is never decided here — hiding the admin link is courtesy,
 * and `requireAdmin()` plus the policies are the actual gate.
 */
export async function Header({ locale, t }: { locale: Locale; t: Strings }) {
  const viewer = await getViewer();

  /*
   * The four public links first, in this order, then whatever this particular
   * reader also has. One array: the bar draws it above `lg` and the sheet draws
   * the same thing below, so a link cannot exist on one and not the other.
   */
  const links: MenuLink[] = [
    { href: homePath(locale), label: t.nav.home },
    { href: coursesPath(locale), label: t.nav.courses },
    { href: contactPath(locale), label: t.nav.contact },
    { href: aboutPath(locale), label: t.nav.about },
  ];
  if (viewer) links.push({ href: learnPath(locale), label: t.nav.learn });
  if (canSeeAdmin(viewer?.role)) links.push({ href: adminPath(locale), label: t.nav.admin });
  if (viewer) links.push({ href: `/${locale}/account`, label: t.nav.account });

  return (
    <header className="bar sticky top-0 z-40">
      <div className="shell flex h-14 items-center gap-4">
        <Link href={homePath(locale)} aria-label="Jarvis" className="shrink-0">
          <Logo />
        </Link>

        <nav className="ml-2 hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-2.5 py-1.5 text-[13px] text-ink-3 transition-colors hover:bg-panel-2 hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <LocaleSwitcher locale={locale} label={t.language.switch} />

          {viewer ? (
            <form action={signOut} className="hidden lg:block">
              <button type="submit" className={buttonClass("secondary", "sm")}>
                {t.nav.signOut}
              </button>
            </form>
          ) : (
            <div className="hidden items-center gap-2 lg:flex">
              <Link href={signInPath(locale)} className={buttonClass("ghost", "sm")}>
                {t.nav.signIn}
              </Link>
              <Link href={`/${locale}/sign-up`} className={buttonClass("primary", "sm")}>
                {t.nav.signUp}
              </Link>
            </div>
          )}

          <MobileMenu
            label={t.nav.home}
            links={
              viewer
                ? links
                : [
                    ...links,
                    { href: signInPath(locale), label: t.nav.signIn },
                    { href: `/${locale}/sign-up`, label: t.nav.signUp },
                  ]
            }
          />
        </div>
      </div>
    </header>
  );
}
