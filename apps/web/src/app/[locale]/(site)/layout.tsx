import { getIntl } from "@/lib/locale";
import { getViewer } from "@/lib/queries/viewer";
import { AppShell } from "@/components/app/shell";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { SiteTabBar } from "@/components/layout/site-tab-bar";

/**
 * Rendered per request, not at build time.
 *
 * Every page under this layout depends on who is reading, so a prerendered copy
 * is one visitor's session served to everybody. Without this the answer depends
 * on whether Supabase credentials happened to be present during the build — a
 * route that is static on one machine and dynamic on another is worse than
 * either.
 */
export const dynamic = "force-dynamic";

/**
 * The public pages — catalogue, course, about, contact, checkout — in whichever
 * shell suits the reader.
 *
 * **A signed-in person never sees the marketing chrome.** These URLs are public
 * because a stranger has to be able to read them, not because a student should
 * be thrown back out to the sales bar — with its «Нүүр» link to the pitch and
 * its «Бүртгүүлэх» button — every time they open the catalogue from their own
 * rail. So the URL stays one URL and the shell follows the reader: the app rail
 * for somebody signed in, the header and footer for somebody deciding.
 *
 * The landing page is the exception, and handles itself: it redirects a
 * signed-in visitor to their dashboard before any of this matters.
 */
export default async function SiteLayout({ children }: LayoutProps<"/[locale]">) {
  const { locale, t } = await getIntl();
  const viewer = await getViewer();

  if (viewer) {
    return (
      <AppShell locale={locale} t={t} viewer={viewer}>
        {children}
      </AppShell>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <Header locale={locale} t={t} />
      {/*
       * `id` is the skip link's target — see the header.
       *
       * `pb-24` is not decoration: below `lg` the visitor's tab bar is fixed to
       * the bottom, so without it the last line of every page sits underneath
       * the navigation. The signed-in shell pays the same toll for the same bar.
       */}
      <main id="main" className="flex-1 pb-24 lg:pb-0">
        {children}
      </main>
      <Footer locale={locale} t={t} />

      {/*
       * A sibling of the header, never a child of it.
       *
       * `.bar` sets `backdrop-filter`, and an element with one becomes the
       * containing block for every `position: fixed` descendant — so inside the
       * header this bar's `bottom-0` resolved to the bottom of a 56px strip and
       * it rendered across the top of the page, over the wordmark.
       */}
      <SiteTabBar locale={locale} t={t} />
    </div>
  );
}
