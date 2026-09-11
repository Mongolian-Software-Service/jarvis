import { getIntl } from "@/lib/locale";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

/**
 * Rendered per request, not at build time.
 *
 * Every page under this layout wears a header that says who is signed in, so a
 * prerendered copy is one visitor's session served to everybody. Without this
 * the answer depends on whether Supabase credentials happened to be present
 * during the build — a route that is static on one machine and dynamic on
 * another is worse than either.
 */
export const dynamic = "force-dynamic";

/** The public shell: bar, page, footer. The admin has its own. */
export default async function SiteLayout({ children }: LayoutProps<"/[locale]">) {
  const { locale, t } = await getIntl();

  return (
    <div className="flex min-h-dvh flex-col">
      <Header locale={locale} t={t} />
      <main className="flex-1">{children}</main>
      <Footer locale={locale} t={t} />
    </div>
  );
}
