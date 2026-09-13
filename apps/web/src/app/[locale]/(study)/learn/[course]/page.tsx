import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { coursePath, courseStats, fmt, lessonPath } from "@jarvis/core";
import { getIntl } from "@/lib/locale";
import { completedLessonIds, resumeLessonSlug } from "@/lib/queries/learn";
import { getCourseBySlug, hasCourseAccess } from "@/lib/queries/courses";
import { LessonPath } from "@/components/course/lesson-path";
import { Progress } from "@/components/ui/progress";
import { buttonClass } from "@/components/ui/button";

export const metadata: Metadata = { robots: { index: false } };

/**
 * The course, for somebody who holds it.
 *
 * This used to be a bare redirect into the next lesson — press «Үргэлжлүүлэх»
 * on the map and land mid-course with no idea what came before or how much is
 * left. A course is taken in order, so the screen that opens it shows that
 * order: every lesson, numbered, with what is finished and where you are.
 *
 * Resuming is still one tap; it is now a button rather than the only thing the
 * route could do.
 */
export default async function CoursePlayerPage({ params }: PageProps<"/[locale]/learn/[course]">) {
  const { course } = await params;
  const { locale, t } = await getIntl();

  const detail = await getCourseBySlug(course, locale);
  if (!detail) notFound();

  const [access, completed, resume] = await Promise.all([
    hasCourseAccess(detail.id),
    completedLessonIds(detail.id),
    resumeLessonSlug(course, locale),
  ]);

  /*
   * No access, or nothing to play: the public course page is the honest place
   * for both. It says what the course is and how to get it.
   */
  if (!access || !resume) redirect(coursePath(locale, course));

  const stats = courseStats(detail.lessonCount, completed.size);

  return (
    <div className="shell max-w-3xl py-8 sm:py-10">
      <header className="mb-8">
        <h1 className="font-display text-[28px] leading-[1.15] sm:text-[34px]">{detail.title}</h1>
        <p className="text-ink-3 mt-2 text-[14px]">{detail.summary}</p>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <Progress
              value={stats.percent}
              tone={stats.finished ? "ok" : "accent"}
              label={detail.title}
            />
            <p className="text-ink-3 tabular mt-2 text-[13px]">
              {stats.finished
                ? t.learn.dashboard.finished
                : fmt(t.learn.course.progress, { percent: stats.percent })}
              {" · "}
              {fmt(t.learn.course.lessonsCount, { count: detail.lessonCount })}
            </p>
          </div>

          <Link
            href={lessonPath(locale, course, resume)}
            className={buttonClass("primary", "lg", "shrink-0")}
          >
            {stats.started ? t.learn.course.continue : t.learn.course.startFree}
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </header>

      <LessonPath
        modules={detail.modules}
        courseSlug={course}
        locale={locale}
        t={t}
        hasAccess={access}
        completed={completed}
        currentSlug={resume}
      />
    </div>
  );
}
