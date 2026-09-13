import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  coursePlayerPath,
  coursesPath,
  fmt,
  formatAgo,
  formatDuration,
  lessonPath,
} from "@jarvis/core";
import { getIntl } from "@/lib/locale";
import { completedLessonIds, listMyCourses, resumeLessonSlug } from "@/lib/queries/learn";
import { getCourseBySlug, listCourses } from "@/lib/queries/courses";
import { CourseCard } from "@/components/course/course-card";
import { LessonPath } from "@/components/course/lesson-path";
import { Progress } from "@/components/ui/progress";
import { Empty } from "@/components/ui/empty";
import { buttonClass } from "@/components/ui/button";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getIntl();
  return { title: t.learn.dashboard.title, robots: { index: false } };
}

/**
 * Everything this student holds — as the road through it, not as a shelf.
 *
 * A card per course said how far along they were and nothing about what the
 * course *is*: to see lesson two they had to open the course, and to compare
 * two courses they had to open both. The lessons are the thing they came for,
 * so the lessons are on the page, numbered, in the order they are taken.
 *
 * One extra round trip per course buys it — the syllabus, the ticks and the
 * resume point. A student holds six courses at most, and this screen is the
 * one they open every day.
 */
export default async function LearnPage() {
  const { locale, t } = await getIntl();
  const [courses, catalogue] = await Promise.all([listMyCourses(locale), listCourses(locale)]);

  const roads = await Promise.all(
    courses.map(async (course) => {
      const [detail, completed, resume] = await Promise.all([
        getCourseBySlug(course.slug, locale),
        completedLessonIds(course.id),
        resumeLessonSlug(course.slug, locale),
      ]);
      return { course, detail, completed, resume };
    }),
  );

  /*
   * A student with nothing enrolled is the common first screen, not an edge
   * case — every account starts there. An empty panel with a link off to the
   * catalogue makes their first visit a dead end, so the catalogue comes to
   * them instead.
   */
  const available = catalogue.filter((course) => !courses.some((mine) => mine.id === course.id));

  return (
    <div className="shell max-w-4xl py-8 sm:py-12">
      <header className="mb-8">
        <h1 className="font-display text-[32px] leading-[1.1] sm:text-[40px]">
          {t.learn.dashboard.title}
        </h1>
        <p className="text-ink-3 mt-2 text-[15px]">{t.learn.dashboard.deck}</p>
      </header>

      {courses.length === 0 ? (
        <div className="space-y-10">
          <Empty title={t.learn.dashboard.empty} />

          {available.length > 0 ? (
            <section>
              <div className="mb-5 flex items-end justify-between gap-4">
                <h2 className="font-display text-[20px]">{t.learn.dashboard.browseTitle}</h2>
                <Link
                  href={coursesPath(locale)}
                  className="text-ink-3 hover:text-ink shrink-0 text-[13px] transition-colors"
                >
                  {t.actions.seeAll} →
                </Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {available.map((course, index) => (
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
      ) : (
        <div className="space-y-10">
          {roads.map(({ course, detail, completed, resume }) => (
            <section key={course.id} className="panel-raised overflow-hidden">
              {/* The head of the road: what it is, how far along, and one way in. */}
              <div className="border-line flex flex-col gap-5 border-b p-5 sm:flex-row sm:items-center sm:p-6">
                <Link
                  href={coursePlayerPath(locale, course.slug)}
                  className="border-line bg-panel-2 relative block aspect-[16/10] w-full shrink-0 overflow-hidden rounded-lg border sm:w-44"
                >
                  {course.coverUrl ? (
                    <Image
                      src={course.coverUrl}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 100vw, 11rem"
                      className="object-cover"
                    />
                  ) : null}
                </Link>

                <div className="min-w-0 flex-1">
                  <h2 className="font-display text-[19px] leading-[1.2] sm:text-[22px]">
                    <Link
                      href={coursePlayerPath(locale, course.slug)}
                      className="hover:text-accent transition-colors"
                    >
                      {course.title}
                    </Link>
                  </h2>
                  <p className="text-ink-3 mt-1 text-[13px]">
                    {fmt(t.learn.course.lessonsCount, { count: course.lessonCount })}
                    {course.minutes > 0 ? ` · ${formatDuration(course.minutes, locale)}` : ""}
                    {course.lastActivity
                      ? ` · ${t.learn.dashboard.lastActivity} ${formatAgo(course.lastActivity, locale)}`
                      : ""}
                  </p>

                  <div className="mt-3 max-w-sm">
                    <Progress
                      value={course.progress.percent}
                      tone={course.progress.finished ? "ok" : "accent"}
                      label={course.title}
                    />
                    <p className="text-ink-3 tabular mt-1.5 text-[12px]">
                      {course.progress.finished
                        ? t.learn.dashboard.finished
                        : fmt(t.learn.course.progress, { percent: course.progress.percent })}
                    </p>
                  </div>
                </div>

                {resume ? (
                  <Link
                    href={lessonPath(locale, course.slug, resume)}
                    className={buttonClass("primary", "md", "shrink-0")}
                  >
                    {course.progress.started ? t.actions.continue : t.actions.start}
                    <ArrowRight className="size-3.5" />
                  </Link>
                ) : null}
              </div>

              {detail ? (
                <div className="p-5 sm:p-6">
                  <LessonPath
                    modules={detail.modules}
                    courseSlug={course.slug}
                    locale={locale}
                    t={t}
                    hasAccess
                    completed={completed}
                    currentSlug={resume ?? undefined}
                  />
                </div>
              ) : null}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
