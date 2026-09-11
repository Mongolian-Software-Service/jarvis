import Link from "next/link";
import { homePath } from "@jarvis/core";
import { getIntl } from "@/lib/locale";
import { Logo } from "@/components/layout/logo";

/**
 * The auth shell: no navigation, nothing to click but the form.
 *
 * A header full of links on a sign-in page is an invitation to wander off
 * halfway through the one thing this screen exists for.
 */
export default async function AuthLayout({ children }: LayoutProps<"/[locale]"> ) {
  const { locale } = await getIntl();

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-5 py-12">
      <Link href={homePath(locale)} className="mb-8">
        <Logo />
      </Link>
      <div className="panel-raised w-full max-w-sm p-7">{children}</div>
    </div>
  );
}
