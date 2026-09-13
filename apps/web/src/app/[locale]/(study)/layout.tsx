import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { SITE_NAME, dashboardPath, signInPath } from "@jarvis/core";
import { getIntl } from "@/lib/locale";
import { getViewer } from "@/lib/queries/viewer";
import { Logo } from "@/components/layout/logo";

/**
 * The lesson screen's shell: a thin bar and nothing else.
 *
 * Separate from the app rail on purpose. A lesson already carries its own
 * syllabus column, and a second permanent sidebar beside it would leave the
 * thing somebody came to read squeezed between two navigations. One way out —
 * back to the dashboard — is all the chrome a page like this needs.
 */
export const dynamic = "force-dynamic";

export default async function StudyLayout({ children }: LayoutProps<"/[locale]">) {
  const { locale, t } = await getIntl();
  const viewer = await getViewer();
  if (!viewer) redirect(signInPath(locale));

  return (
    <div className="min-h-dvh">
      <header className="bar sticky top-0 z-40">
        <div className="shell flex h-14 items-center gap-4">
          <Link href={dashboardPath(locale)} aria-label={SITE_NAME} className="shrink-0">
            <Logo />
          </Link>
          <Link
            href={dashboardPath(locale)}
            className="ml-auto inline-flex items-center gap-1.5 text-[13px] text-ink-3 transition-colors hover:text-ink"
          >
            <ArrowLeft className="size-3.5" />
            {t.nav.dashboard}
          </Link>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
