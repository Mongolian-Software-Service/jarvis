import Link from "next/link";
import { accountPath, type Locale, type Strings } from "@jarvis/core";
import { Markdown } from "@/components/lesson/markdown";
import { buttonClass } from "@/components/ui/button";

/** «Хэрхэн суралцах вэ» — the long read, and three lines for whoever will not
 *  read it. */
export function HelloGuide({
  locale,
  t,
}: {
  locale: Locale;
  t: Strings;
}) {
  return (
      <section className="grid gap-6 lg:grid-cols-[1.6fr_1fr] lg:items-start lg:gap-8">
        <div className="panel p-5 sm:p-8">
          <Markdown
            source={t.guide.body}
            copyLabels={{ copy: t.actions.copy, copied: t.actions.copied }}
          />
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20">
          <div className="panel-raised p-5 sm:p-6">
            <p className="font-display text-[17px]">{t.guide.tips.title}</p>
            <ol className="mt-4 space-y-4">
              {[t.guide.tips.one, t.guide.tips.two, t.guide.tips.three].map((tip, index) => (
                <li key={tip} className="flex gap-3">
                  <span className="bg-panel-2 text-ink-3 tabular mt-0.5 grid size-6 shrink-0 place-items-center rounded-full text-[12px]">
                    {index + 1}
                  </span>
                  <span className="text-ink-2 text-[13.5px] leading-[1.7]">{tip}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="panel p-5 sm:p-6">
            <p className="text-ink-2 text-[13.5px] leading-[1.7]">{t.guide.tips.help}</p>
            <Link
              href={accountPath(locale, "/help")}
              className={buttonClass("secondary", "md", "mt-4 w-full")}
            >
              {t.nav.contact}
            </Link>
          </div>
        </aside>
      </section>
  );
}
