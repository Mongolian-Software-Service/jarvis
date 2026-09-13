import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check } from "lucide-react";
import { COMPANY_NAME, COMPANY_URL, coursesPath } from "@jarvis/core";
import { getIntl } from "@/lib/locale";
import { pageMetadata } from "@/lib/seo";
import { buttonClass } from "@/components/ui/button";
import { CompanyMark } from "@/components/layout/logo";

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
/** `facebook.com/x` reads as an address; the full URL reads as markup. */
function domain(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
}

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
        <h2 className="font-display text-xl leading-[1.2]">{about.company.title}</h2>
        <div className="panel-raised mt-5 flex flex-col gap-5 p-6 sm:flex-row sm:items-start sm:justify-between sm:p-8">
          <div className="measure">
            <p className="font-display text-[20px] leading-[1.2]">{about.company.name}</p>
            <p className="mt-3 text-[15px] leading-[1.75] text-ink-2">{about.company.body}</p>
          </div>

          {/* The same credit the footer carries, given room here: the mark,
              the name and the URL all come from the one place that owns them,
              so this badge cannot drift from the one at the bottom. */}
          <a
            href={COMPANY_URL}
            target="_blank"
            rel="noreferrer"
            className="text-ink-3 hover:border-line-strong hover:text-ink inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-line px-3.5 py-2 transition-colors"
          >
            <span className="text-[13px]">{t.footer.poweredBy}</span>
            <CompanyMark className="size-4" />
            <span className="font-display text-ink text-[13px] font-semibold tracking-[-0.01em]">
              {COMPANY_NAME}
            </span>
            <ArrowUpRight className="size-3.5 shrink-0" aria-hidden="true" />
          </a>
        </div>
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

      <section className="shell border-t border-line py-12">
        <h2 className="font-display text-xl leading-[1.2]">{about.projects.title}</h2>
        <p className="measure mt-2 text-[15px] text-ink-3">{about.projects.deck}</p>

        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {about.projects.items.map((project) => (
            <li
              key={project.url}
              className="panel relative flex flex-col overflow-hidden transition-colors hover:border-line-strong"
            >
              {/*
               * The site itself, above its own name.
               *
               * A screenshot of a page you can go and open is the only honest
               * picture of it — and the reason these are files in `public/`
               * rather than each site's `og:image` is that a card here should
               * not break the day somebody redeploys somewhere else.
               *
               * Never `priority`: the section sits well down the page, and the
               * LCP candidate is the first course cover (CLAUDE.md §7).
               */}
              <div className="relative aspect-[16/9] w-full border-b border-line bg-panel-2">
                <Image
                  src={project.image}
                  alt={`${project.name} — ${domain(project.url)}`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
                  className="object-cover object-top"
                />
              </div>

              <div className="flex flex-1 flex-col p-6">
              <div className="flex items-start justify-between gap-3">
                {/*
                 * The whole card is the link's target (`.card-link`), so a card
                 * is one tab stop and the focus ring lands on the name rather
                 * than on the arrow (CLAUDE.md §4.4).
                 */}
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card-link font-display text-[17px] leading-[1.3] text-ink transition-colors hover:text-accent"
                >
                  {project.name}
                </a>
                <ArrowUpRight className="size-4 shrink-0 text-ink-3" aria-hidden="true" />
              </div>

              <p className="mt-2 flex-1 text-[14px] leading-[1.7] text-ink-3">{project.body}</p>

              <p className="mt-4 font-mono text-[12px] break-all text-ink-3">
                {domain(project.url)}
              </p>
              </div>
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
