import Link from "next/link";
import { cookies } from "next/headers";
import { SITE_NAME, dashboardPath, PROFILE_LATER_COOKIE, type Locale, type Strings } from "@jarvis/core";
import { profileIsComplete } from "@/lib/queries/viewer";
import { ProfileGate } from "@/components/auth/profile-gate";
import { AppNavBar, AppTabBar } from "@/components/app/nav";
import { Logo } from "@/components/layout/logo";
import type { Viewer } from "@/lib/queries/viewer";

/**
 * Where a signed-in person is, whatever they are looking at.
 *
 * A bar at the top, the page, and — on anything narrower than a laptop — a tab
 * bar along the bottom, the same five destinations the phone app carries. The
 * vertical rail this replaced cost a sixth of the width on a laptop and, on a
 * phone, scrolled out of sight the moment somebody started reading.
 *
 * It is a component rather than a layout because two route groups need it:
 * `(app)` for the screens only a student has, and `(site)` for the public ones
 * a student is also allowed to read. The catalogue has one URL, and which
 * chrome it wears is a fact about the reader, not about the URL.
 *
 * The wordmark goes to the dashboard, not to `/`. Inside the product it is the
 * way home to *their* home — sending them to the sales page from their own bar
 * is how somebody ends up outside, reading the pitch for a thing they bought.
 */
export async function AppShell({
  locale,
  t,
  viewer,
  children,
}: {
  locale: Locale;
  t: Strings;
  viewer: Viewer;
  children: React.ReactNode;
}) {
  /*
   * Ask for овог, нэр and утас once, from whoever arrived without them —
   * which in practice means everybody who signed in with Google. Decided here
   * rather than in the dialog so there is no flash of it for somebody who has
   * already answered, and so «дараа бөглөнө» costs one cookie read.
   */
  const postponed = (await cookies()).has(PROFILE_LATER_COOKIE);
  const ask = !profileIsComplete(viewer) && !postponed;

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="bar sticky top-0 z-40">
        <div className="shell flex h-14 items-center gap-3">
          <Link href={dashboardPath(locale)} aria-label={SITE_NAME} className="shrink-0">
            <Logo />
          </Link>

          <div className="ml-2 min-w-0">
            <AppNavBar locale={locale} t={t} role={viewer.role} />
          </div>

          {/* Their name only where there is room for it. On a phone the
              account tab is two taps away and says the same thing. */}
          <span className="text-ink-3 ml-auto hidden max-w-48 shrink-0 truncate text-[13px] lg:block">
            {viewer.fullName ?? viewer.email}
          </span>
        </div>
      </header>

      {/*
       * The shell adds no column of its own — every page already carries
       * `.shell`, and two of them nested doubles the gutter, which on a 390px
       * phone costs a fifth of the width.
       *
       * `pb-24` is not decoration: the tab bar is fixed, so without it the last
       * line of every page sits underneath the navigation.
       */}
      <main className="flex-1 pb-24 lg:pb-0">{children}</main>

      <AppTabBar locale={locale} t={t} role={viewer.role} />

      {ask ? (
        <ProfileGate
          values={{ lastName: viewer.lastName, firstName: viewer.firstName, phone: viewer.phone }}
          copy={{
            title: t.auth.complete.title,
            deck: t.auth.complete.deck,
            lastName: t.auth.account.lastName,
            firstName: t.auth.account.firstName,
            phone: t.auth.account.phone,
            submit: t.auth.complete.submit,
            submitting: t.auth.complete.submitting,
            later: t.auth.complete.later,
          }}
        />
      ) : null}
    </div>
  );
}
