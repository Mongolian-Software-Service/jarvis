import Link from "next/link";
import { Plus } from "lucide-react";
import { dashboardPath, fmt, groupDigits, type Locale, type Strings } from "@jarvis/core";
import type { ShowcaseProject } from "@/lib/queries/learn";
import { buttonClass } from "@/components/ui/button";
import { ShowcaseCard } from "./showcase-card";

/**
 * «Сурагчдын төслүүд» — the bottom of «Сайн уу», where the long guide was.
 *
 * The guide explained what the school was for, in a page of prose that had
 * gone on promising things the school no longer does. What other students
 * actually built says the same thing better, and stays true by itself: it is
 * written by the people it describes.
 *
 * A feed down one column, so it reads like the list it is, with an aside
 * beside it on a laptop that says how to get onto it (§3: a reading column
 * paired with something that earns the rest of the width). On a phone the
 * aside comes **first** — after sixty cards nobody would scroll back for it.
 */
export function HelloShowcase({
  projects,
  locale,
  t,
}: {
  projects: ShowcaseProject[];
  locale: Locale;
  t: Strings;
}) {
  const copy = t.guide.showcase;

  return (
    <section
      aria-labelledby="showcase-title"
      className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:items-start lg:gap-8"
    >
      <header className="lg:col-span-2">
        <h2 id="showcase-title" className="font-display text-[24px] leading-[1.15] sm:text-[28px]">
          {copy.title}
        </h2>
        <p className="text-ink-3 measure mt-2 text-[15px]">{copy.deck}</p>
      </header>

      <aside className="panel-raised p-5 sm:p-6 lg:sticky lg:top-20 lg:col-start-2 lg:row-start-2">
        <p className="font-display text-[17px]">{copy.add.title}</p>
        <p className="text-ink-2 mt-2 text-[13.5px] leading-[1.7]">{copy.add.body}</p>
        {projects.length > 0 ? (
          <p className="text-ink-3 tabular mt-4 text-[12.5px]">
            {fmt(copy.count, { count: groupDigits(projects.length) })}
          </p>
        ) : null}
        <Link
          href={`${dashboardPath(locale)}#projects`}
          className={buttonClass("primary", "md", "mt-5")}
        >
          <Plus className="size-3.5" aria-hidden="true" />
          {copy.add.action}
        </Link>
      </aside>

      <div className="min-w-0 lg:col-start-1 lg:row-start-2">
        {projects.length === 0 ? (
          <p className="panel border-line text-ink-3 border-dashed px-4 py-10 text-center text-[14px]">
            {copy.empty}
          </p>
        ) : (
          <ol className="space-y-3">
            {projects.map((project) => (
              <li key={project.id}>
                <ShowcaseCard project={project} locale={locale} t={t} />
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
