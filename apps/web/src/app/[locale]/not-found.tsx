import Link from "next/link";
import { homePath } from "@jarvis/core";
import { getIntl } from "@/lib/locale";
import { buttonClass } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";

export default async function NotFound() {
  const { locale, t } = await getIntl();

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-5 text-center">
      <Logo />
      <p className="font-display text-6xl font-medium text-ink-3 tabular">404</p>
      <div>
        <h1 className="font-display text-2xl font-medium">{t.states.notFound}</h1>
        <p className="mt-1 text-sm text-ink-2">{t.states.notFoundHelp}</p>
      </div>
      <Link href={homePath(locale)} className={buttonClass("primary", "md")}>
        {t.nav.home}
      </Link>
    </div>
  );
}
