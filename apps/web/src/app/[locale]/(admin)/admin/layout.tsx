import { redirect } from "next/navigation";
import { homePath } from "@jarvis/core";
import { getIntl } from "@/lib/locale";
import { getViewer } from "@/lib/queries/viewer";
import { AdminSidebar } from "@/components/admin/sidebar";

/**
 * Never prerendered, never cached.
 *
 * Layouts and pages render in parallel, so without this the *page* under this
 * layout is prerendered at build time even though the layout would redirect —
 * which is how a build with no Supabase credentials ends up failing inside a
 * console query. Every screen here is per-admin and per-moment anyway.
 */
export const dynamic = "force-dynamic";

/**
 * The console's shell, and its second lock.
 *
 * The proxy turns away anyone without a session; this turns away anyone who has
 * one and is not an admin. Neither is the real gate — the policies are, and
 * every action re-checks — but a signed-in student who types `/admin` should
 * land on the site rather than on an empty console full of failed reads.
 *
 * No locale switcher here: the team edits both languages at once on the same
 * screen, so switching the interface language is meaningless work.
 */
export default async function AdminLayout({ children }: LayoutProps<"/[locale]">) {
  const { locale, t } = await getIntl();
  const viewer = await getViewer();

  if (!viewer) redirect(`/${locale}/sign-in?next=${encodeURIComponent(`/${locale}/admin`)}`);
  if (viewer.role !== "admin") redirect(homePath(locale));

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[15rem_1fr]">
      <div className="border-b border-line px-5 lg:sticky lg:top-0 lg:h-dvh lg:border-b-0 lg:px-0">
        <AdminSidebar locale={locale} t={t} />
      </div>
      <main className="min-w-0 p-5 lg:p-8">{children}</main>
    </div>
  );
}
