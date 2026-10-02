import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { fmt, lessonPath, type Locale, type Strings } from "@jarvis/core";
import type { StudentOverview } from "@/lib/queries/learn";
import { Progress } from "@/components/ui/progress";
import { buttonClass } from "@/components/ui/button";

/**
 * «Үргэлжлүүлэх» — the one thing on the dashboard nothing else can do.
 *
 * It used to say which lesson and nothing about where that lesson stood, so a
 * student on the last lesson of a course and one on the first saw the same
 * card. Now it carries the course's cover, the lesson's place in it and the
 * course's progress — the three things that make «carry on» mean *this far
 * along, this much left*.
 *
 * The cover is dropped below `sm`: on a 360px phone a 16:10 picture is 220px
 * of height between the student and the button they came to press. That is
 * also why it is not `preload` — a phone would fetch a picture it never shows,
 * and a lazy image under `display: none` is never fetched at all.
 */
export function ResumeCard({
  resume,
  locale,
  t,
}: {
  resume: NonNullable<StudentOverview["resume"]>;
  locale: Locale;
  t: Strings;
}) {
  const href = lessonPath(locale, resume.courseSlug, resume.lessonSlug);
  const copy = t.learn.overview;

  return (
    <section className="panel-raised relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(32rem 12rem at 100% 0%, var(--accent-soft), transparent 70%)",
        }}
      />

      <div className="relative flex items-stretch">
        {resume.coverUrl ? (
          <Link
            href={href}
            tabIndex={-1}
            aria-hidden="true"
            className="border-line bg-panel-2 relative hidden w-56 shrink-0 overflow-hidden border-r sm:block"
          >
            <Image src={resume.coverUrl} alt="" fill sizes="14rem" className="object-cover" />
          </Link>
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 flex-1">
            <p className="kicker">
              {resume.courseTitle} ·{" "}
              {fmt(copy.lessonOf, { current: resume.lessonNumber, total: resume.lessonCount })}
            </p>
            <h2 className="font-display mt-2 text-[20px] leading-[1.2] sm:text-[22px]">
              {resume.lessonTitle}
            </h2>

            <div className="mt-4 max-w-sm">
              <Progress
                value={resume.progress.percent}
                tone={resume.progress.finished ? "ok" : "accent"}
                label={resume.courseTitle}
              />
              <p className="text-ink-3 tabular mt-1.5 text-[12px]">
                {resume.progress.finished
                  ? t.learn.dashboard.finished
                  : fmt(t.learn.course.progress, { percent: resume.progress.percent })}
              </p>
            </div>
          </div>

          <Link
            href={href}
            className={buttonClass("primary", "lg", "shrink-0 self-start lg:self-end")}
          >
            {copy.resume}
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
