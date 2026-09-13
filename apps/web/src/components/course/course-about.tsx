import Link from "next/link";
import { BookOpenText, Download, FileText } from "lucide-react";
import { fmt, handbookPath, type CourseDetail, type Handbook, type Locale, type Strings } from "@jarvis/core";
import { Markdown } from "@/components/lesson/markdown";
import { buttonClass } from "@/components/ui/button";

/** «Сургалтын тухай» — the description, and the handbook that sits under it. */
export function CourseAbout({
  course,
  locale,
  t,
  copy,
  handbook,
}: {
  course: CourseDetail;
  locale: Locale;
  t: Strings;
  copy: { copy: string; copied: string };
  handbook: Handbook | null;
}) {
  return (
        <section>
          <h2 className="font-display mb-4 text-[20px]">{t.learn.course.about}</h2>
          {course.description ? (
            <Markdown
              source={course.description}
              copyLabels={copy}
              /* Mongolian shown inside the English edition has to say which
                 language it is, or a screen reader pronounces Cyrillic with
                 English rules. */
              lang={course.descriptionIsFallback ? "mn" : undefined}
            />
          ) : (
            <p className="text-ink-3">{course.summary}</p>
          )}
          {course.descriptionIsFallback ? (
            <p className="mt-4 rounded-md border border-line bg-panel-2 px-4 py-3 text-xs text-ink-3">
              {t.learn.fallbackNotice}
            </p>
          ) : null}

          {/*
            * The handbook, under the description because that is where somebody
            * has just finished reading what the course is and is deciding
            * whether it is for them. It is deliberately **not** behind the
            * paywall: a stranger who downloads it and learns what a server is
            * has been taught something, which is the argument for the school.
            */}
          {handbook ? (
            <div className="panel-raised mt-8 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
              <span
                aria-hidden="true"
                className="grid size-12 shrink-0 place-items-center rounded-lg border border-line bg-panel-2"
              >
                <FileText className="size-6 text-accent" />
              </span>

              <div className="min-w-0 flex-1">
                <p className="font-display text-[17px]">{t.learn.course.handbook.title}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-ink-3">
                  {t.learn.course.handbook.deck}
                </p>
                <p className="kicker mt-2">
                  {fmt(t.learn.course.handbook.meta, {
                    pages: handbook.pages,
                    size: handbook.sizeKb,
                  })}
                </p>
              </div>

              {/*
                * Reading it comes first. Downloading is the second thing
                * somebody wants — and `download` is what names the saved file;
                * without it the PDF opens in a tab titled by its URL.
                */}
              <div className="flex shrink-0 flex-wrap gap-2">
                <Link
                  href={handbookPath(locale, course.slug)}
                  className={buttonClass("primary", "md")}
                >
                  <BookOpenText className="size-4" />
                  {t.learn.course.handbook.open}
                </Link>
                <a
                  href={handbook.file}
                  download
                  className={buttonClass("secondary", "md")}
                  aria-label={t.learn.course.handbook.download}
                >
                  <Download className="size-4" />
                </a>
              </div>
            </div>
          ) : null}
        </section>
  );
}
