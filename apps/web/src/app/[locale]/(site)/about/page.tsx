import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { coursesPath } from "@jarvis/core";
import { getIntl } from "@/lib/locale";
import { pageMetadata } from "@/lib/seo";
import { buttonClass } from "@/components/ui/button";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getIntl();
  return pageMetadata({
    locale,
    title: t.marketing.about.title,
    description: t.marketing.about.deck,
    path: "/about",
  });
}

/**
 * What the school is, as opposed to what it sells.
 *
 * All of it is copy from `packages/core` — nothing is queried — but the page
 * still sits under `(site)`, which is `force-dynamic`, because it wears the
 * header that says who is signed in (CLAUDE.md §6.4).
 */
export default async function AboutPage() {
  const { locale, t } = await getIntl();
  const about = t.marketing.about;

  return (
    <>
      <section className="shell pt-16 pb-12 sm:pt-20">
        <p className="kicker mb-4">{about.kicker}</p>
        {/* The leading is named because `text-5xl` ships `line-height: 1`, which
            sets a two-line Mongolian headline solid (CLAUDE.md §4). */}
        <h1 className="font-display max-w-3xl text-[2rem] leading-[1.1] sm:text-[2.75rem]">
          {about.title}
        </h1>
        <p className="measure mt-5 text-[15px] text-ink-2">{about.deck}</p>
      </section>

      <section className="shell border-t border-line py-12">
        <h2 className="font-display text-xl leading-[1.2]">{about.story.title}</h2>
        <div className="measure mt-4 space-y-4 text-[15px] leading-[1.75] text-ink-2">
          {about.story.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>

      <section className="shell border-t border-line py-12">
        <h2 className="font-display text-xl leading-[1.2]">{about.principles.title}</h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {about.principles.items.map((item, index) => (
            <li key={item.title} className="panel p-6">
              <p className="kicker tabular">{`0${index + 1}`}</p>
              <h3 className="font-display mt-3 text-[17px] leading-[1.3]">{item.title}</h3>
              <p className="mt-2 text-[14px] leading-[1.7] text-ink-3">{item.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="shell border-t border-line py-12">
        <h2 className="font-display text-xl leading-[1.2]">{about.audience.title}</h2>
        <ul className="measure mt-5 space-y-3">
          {about.audience.items.map((item) => (
            <li key={item} className="flex gap-3 text-[15px] text-ink-2">
              <Check className="mt-1 size-4 shrink-0 text-accent" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="shell pb-8">
        <div className="panel-raised flex flex-col items-start gap-4 p-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-xl leading-[1.2]">{about.cta.title}</h2>
            <p className="mt-1 text-[14px] text-ink-3">{about.cta.body}</p>
          </div>
          <Link href={coursesPath(locale)} className={buttonClass("primary", "md")}>
            {about.cta.action}
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </section>
    </>
  );
}
