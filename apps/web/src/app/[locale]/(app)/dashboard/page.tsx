import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, Clock } from "lucide-react";
import {
  coursePlayerPath,
  coursesPath,
  fmt,
  formatDuration,
  groupDigits,
  lessonPath,
} from "@jarvis/core";
import { getIntl } from "@/lib/locale";
import { getStudentOverview } from "@/lib/queries/learn";
import { listCourses } from "@/lib/queries/courses";
import { getViewer } from "@/lib/queries/viewer";
import { CourseCard } from "@/components/course/course-card";
import { Progress } from "@/components/ui/progress";
import { buttonClass } from "@/components/ui/button";

export const metadata: Metadata = { robots: { index: false } };

/**
 * Where a student lands, and the one screen that knows what they were doing.
 *
 * The resume card is the whole point: a list of courses is something they can
 * get from the catalogue, but "you were on lesson four of Flexbox, carry on" is
 * only possible here.
 */
export default async function DashboardPage() {
  const { locale, t } = await getIntl();
  const [viewer, overview] = await Promise.all([getViewer(), getStudentOverview(locale)]);

  const firstName = viewer?.fullName?.trim().split(/\s+/)[0];
  const started = overview.courses.filter((course) => !course.progress.finished);

  // A student holding nothing sees what they could start, not an empty panel.
  const catalogue = overview.courses.length === 0 ? await listCourses(locale) : [];

  return (
    <div className="shell max-w-5xl space-y-8 py-8 sm:py-12">
      <header>
        <h1 className="font-display text-[28px] leading-[1.1] sm:text-[32px]">
          {firstName
            ? fmt(t.learn.overview.greeting, { name: firstName })
            : t.learn.overview.greetingPlain}
        </h1>
        <p className="mt-2 text-[15px] text-ink-3">{t.learn.overview.deck}</p>
      </header>

      {/* Carry on */}
      {overview.resume ? (
        <section className="panel-raised relative overflow-hidden p-6">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{
              background:
                "radial-gradient(32rem 12rem at 100% 0%, var(--accent-soft), transparent 70%)",
            }}
          />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <p className="kicker">{overview.resume.courseTitle}</p>
              <h2 className="font-display mt-2 text-[22px] leading-tight">
                {overview.resume.lessonTitle}
              </h2>
            </div>
            <Link
              href={lessonPath(locale, overview.resume.courseSlug, overview.resume.lessonSlug)}
              className={buttonClass("primary", "lg", "shrink-0")}
            >
              {t.learn.overview.resume}
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </section>
      ) : null}

      {/* Three numbers */}
      <section className="grid gap-4 sm:grid-cols-3">
        <Stat
          icon={BookOpen}
          label={t.learn.overview.statCourses}
          value={groupDigits(overview.courses.length)}
        />
        <Stat
          icon={CheckCircle2}
          label={t.learn.overview.statLessons}
          value={groupDigits(overview.lessonsDone)}
        />
        <Stat
          icon={Clock}
          label={t.learn.overview.statMinutes}
          value={formatDuration(overview.minutesWatched, locale)}
        />
      </section>

      {/* What is open */}
      {started.length > 0 ? (
        <section>
          <h2 className="font-display mb-4 text-[20px]">{t.learn.overview.inProgress}</h2>
          <div className="panel divide-y divide-line overflow-hidden">
            {started.map((course) => (
              <Link
                key={course.id}
                href={coursePlayerPath(locale, course.slug)}
                className="flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-panel-2"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px]">{course.title}</span>
                  <span className="mt-2 block">
                    <Progress value={course.progress.percent} />
                  </span>
                </span>
                <span className="shrink-0 text-[12px] text-ink-3 tabular">
                  {course.progress.completed}/{course.progress.total}
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* A student who holds nothing */}
      {catalogue.length > 0 ? (
        <section>
          <div className="mb-4 flex items-end justify-between gap-4">
            <h2 className="font-display text-[20px]">{t.learn.dashboard.browseTitle}</h2>
            <Link
              href={coursesPath(locale)}
              className="shrink-0 text-[13px] text-ink-3 transition-colors hover:text-ink"
            >
              {t.actions.seeAll} →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {catalogue.slice(0, 3).map((course, index) => (
              <CourseCard
                key={course.id}
                course={course}
                locale={locale}
                t={t}
                priority={index === 0}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof BookOpen;
  label: string;
  value: string;
}) {
  return (
    <div className="panel p-5">
      <span className="mb-3 grid size-8 place-items-center rounded-md bg-panel-2 text-ink-3">
        <Icon className="size-4" />
      </span>
      <p className="font-display text-[26px] tabular">{value}</p>
      <p className="mt-0.5 text-[13px] text-ink-3">{label}</p>
    </div>
  );
}
