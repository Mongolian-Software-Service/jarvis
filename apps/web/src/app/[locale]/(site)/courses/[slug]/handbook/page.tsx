import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, ExternalLink } from "lucide-react";
import { coursePath, fmt, handbookFor, type Locale } from "@jarvis/core";
import { getIntl, getLocale } from "@/lib/locale";
import { getCourseBySlug } from "@/lib/queries/courses";
import { pageMetadata } from "@/lib/seo";
import { buttonClass } from "@/components/ui/button";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/courses/[slug]/handbook">): Promise<Metadata> {
  const { slug } = await params;
  const locale: Locale = await getLocale();
  const [course, { t }] = await Promise.all([getCourseBySlug(slug, locale), getIntl()]);
  if (!course || !handbookFor(slug)) return {};

  return pageMetadata({
    locale,
    title: `${t.learn.course.handbook.title} — ${course.title}`,
    description: t.learn.course.handbook.deck,
    path: `/courses/${slug}/handbook`,
  });
}

/**
 * The handbook, read on the site.
 *
 * The browser's own PDF viewer, in a frame. It is the one place in this
 * codebase where the right answer is to hand the job to the platform: every
 * browser ships a reader with search, zoom, printing and text selection, and a
 * JavaScript one would be a megabyte of dependency to arrive at a worse copy of
 * it — for a document this school publishes twice a year.
 *
 * Two escape hatches, because that viewer is the one thing here we do not
 * control: a tab and a download, both above the frame where somebody who
 * cannot see the frame will still find them. iOS in particular has spent years
 * rendering exactly the first page of a framed PDF and nothing else.
 */
export default async function HandbookPage({
  params,
}: PageProps<"/[locale]/courses/[slug]/handbook">) {
  const { slug } = await params;
  const { locale, t } = await getIntl();

  const handbook = handbookFor(slug);
  if (!handbook) notFound();

  const course = await getCourseBySlug(slug, locale);
  if (!course) notFound();

  const copy = t.learn.course.handbook;

  return (
    <div className="shell py-6 sm:py-8">
      <Link
        href={coursePath(locale, course.slug)}
        className="text-ink-3 hover:text-ink inline-flex items-center gap-1.5 text-[13px] transition-colors"
      >
        <ArrowLeft className="size-3.5" />
        {course.title}
      </Link>

      <header className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-[26px] leading-[1.15] sm:text-[32px]">{copy.title}</h1>
          <p className="text-ink-3 mt-1.5 text-[13px]">
            {fmt(copy.meta, { pages: handbook.pages, size: handbook.sizeKb })}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <a
            href={handbook.file}
            target="_blank"
            rel="noopener"
            className={buttonClass("secondary", "md")}
          >
            <ExternalLink className="size-4" />
            {copy.newTab}
          </a>
          <a href={handbook.file} download className={buttonClass("primary", "md")}>
            <Download className="size-4" />
            {copy.download}
          </a>
        </div>
      </header>

      {/*
       * `#view=FitH` asks the viewer to fit the page width — without it most
       * open at 100%, which on a laptop means an A4 page cropped down the
       * middle. The fallback inside `<object>` shows only when the browser
       * refuses the plug-in, which is exactly when it is needed.
       */}
      <object
        data={`${handbook.file}#view=FitH&toolbar=1`}
        type="application/pdf"
        aria-label={copy.title}
        className="border-line bg-panel mt-5 h-[72vh] min-h-[26rem] w-full rounded-lg border"
      >
        <div className="p-6">
          <p className="text-ink-2 text-[14px]">{copy.fallback}</p>
          <a
            href={handbook.file}
            target="_blank"
            rel="noopener"
            className={buttonClass("primary", "md", "mt-4")}
          >
            <ExternalLink className="size-4" />
            {copy.newTab}
          </a>
        </div>
      </object>

      <p className="text-ink-3 mt-4 text-[13px] leading-relaxed">{copy.note}</p>
    </div>
  );
}
