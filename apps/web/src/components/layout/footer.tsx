import Link from "next/link";
import {
  COMPANY_NAME,
  COMPANY_URL,
  SITE_NAME,
  aboutPath,
  contactPath,
  coursesPath,
  homePath,
  privacyPath,
  termsPath,
  type Locale,
  type Strings,
} from "@jarvis/core";
import { CompanyMark, LogoMark } from "./logo";

export function Footer({ locale, t }: { locale: Locale; t: Strings }) {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-line bg-panel">
      <div className="shell flex flex-col gap-8 py-12 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-xs space-y-3">
          <span className="inline-flex items-center gap-2 text-ink">
            <span className="grid size-6 place-items-center rounded-md bg-solid text-solid-ink">
              <LogoMark className="size-4" />
            </span>
            <span className="font-display text-[15px] font-semibold tracking-[-0.01em]">{SITE_NAME}</span>
          </span>
          <p className="text-sm text-ink-3">{t.marketing.hero.deck}</p>
        </div>

        {/* Three columns at 360 leave ~75px each and wrap every label onto two
            lines; two columns there are comfortable and the third falls to a
            second row. Above `sm` there is room for the original single row. */}
        <nav className="grid grid-cols-2 gap-x-8 gap-y-8 text-sm sm:flex sm:gap-12">
          <div className="space-y-2">
            <p className="kicker">{t.footer.product}</p>
            <Link href={homePath(locale)} className="block text-ink-2 hover:text-ink">
              {t.nav.home}
            </Link>
            <Link href={coursesPath(locale)} className="block text-ink-2 hover:text-ink">
              {t.nav.courses}
            </Link>
          </div>
          <div className="space-y-2">
            <p className="kicker">{t.footer.company}</p>
            <Link href={aboutPath(locale)} className="block text-ink-2 hover:text-ink">
              {t.nav.about}
            </Link>
            <Link href={contactPath(locale)} className="block text-ink-2 hover:text-ink">
              {t.nav.contact}
            </Link>
          </div>
          <div className="space-y-2">
            <p className="kicker">{t.footer.legal}</p>
            {/* Links now, not text. They were spans because the pages did not
                exist — a footer naming two documents nobody could open. */}
            <Link href={termsPath(locale)} className="block text-ink-2 hover:text-ink">
              {t.footer.terms}
            </Link>
            <Link href={privacyPath(locale)} className="block text-ink-2 hover:text-ink">
              {t.footer.privacy}
            </Link>
          </div>
        </nav>
      </div>

      {/*
       * Two lines that say different things, so they sit at opposite ends
       * rather than stacked: the left is the school's own claim, the right is
       * who stands behind it. Below `sm` they stack and the company line comes
       * first — it is the one a reader is more likely to want to tap.
       */}
      <div className="shell hairline flex flex-col-reverse gap-3 py-6 text-xs text-ink-3 sm:flex-row sm:items-center sm:justify-between sm:gap-1">
        <p>
          © {year} {SITE_NAME}. {t.footer.rights}
        </p>

        <a
          href={COMPANY_URL}
          target="_blank"
          rel="noreferrer"
          className="hover:text-ink inline-flex w-fit items-center gap-1.5 transition-colors"
        >
          <span>{t.footer.poweredBy}</span>
          <CompanyMark className="size-3.5" />
          <span className="font-display text-ink-2 font-semibold tracking-[-0.01em]">
            {COMPANY_NAME}
          </span>
        </a>
      </div>
    </footer>
  );
}
