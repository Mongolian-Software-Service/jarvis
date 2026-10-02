import { getIntl } from "@/lib/locale";
import { SettingsNav } from "@/components/settings/settings-nav";

/**
 * «Тохиргоо» — a section with categories, not one form.
 *
 * The student's own details, and the two documents that say what the school
 * does with them, in one place: somebody looking for "what do you keep about
 * me" goes to their settings, not to a footer the signed-in shell does not
 * have (§3 — the app rail carries no footer).
 *
 * This layout owns the column (`.shell`); the categories under it never add
 * one. On a laptop the categories are a column beside the page and stay put
 * while a long policy scrolls; on a phone they are a row above it.
 *
 * No lock here — `(app)/layout.tsx` already holds one for everything below it.
 */
export default async function SettingsLayout({ children }: LayoutProps<"/[locale]/account">) {
  const { locale, t } = await getIntl();

  return (
    <div className="shell py-8 lg:py-12">
      <div className="lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-12">
        {/* `top-20` clears the 56px bar above with room to breathe. */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <p className="font-display mb-5 hidden px-2.5 text-[15px] lg:block">
            {t.auth.settings.title}
          </p>
          <SettingsNav locale={locale} t={t} />
        </aside>

        <div className="mt-8 min-w-0 lg:mt-0">{children}</div>
      </div>
    </div>
  );
}
