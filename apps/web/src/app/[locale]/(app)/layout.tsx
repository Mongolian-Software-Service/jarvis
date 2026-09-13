import { redirect } from "next/navigation";
import { signInPath } from "@jarvis/core";
import { getIntl } from "@/lib/locale";
import { getViewer } from "@/lib/queries/viewer";
import { AppShell } from "@/components/app/shell";

/**
 * The screens only a signed-in person has: the guide, the dashboard, their
 * courses, their account.
 *
 * The shell itself lives in `AppShell`, because `(site)` reaches for the same
 * one the moment it has a reader who is signed in. All this layout adds is the
 * lock.
 *
 * Never prerendered: every screen under here is one person's.
 */
export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: LayoutProps<"/[locale]">) {
  const { locale, t } = await getIntl();
  const viewer = await getViewer();

  // The proxy already turns anonymous visitors away; this is the second lock,
  // and the one that still holds if the proxy's matcher is ever loosened.
  if (!viewer) redirect(signInPath(locale));

  return (
    <AppShell locale={locale} t={t} viewer={viewer}>
      {children}
    </AppShell>
  );
}
