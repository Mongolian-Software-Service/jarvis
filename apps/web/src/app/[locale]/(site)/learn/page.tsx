import type { Metadata } from "next";
import Link from "next/link";
import { coursePlayerPath, coursesPath, formatAgo } from "@jarvis/core";
import { getIntl } from "@/lib/locale";
import { listMyCourses } from "@/lib/queries/learn";
import { CourseCard } from "@/components/course/course-card";
import { Empty } from "@/components/ui/empty";
import { buttonClass } from "@/components/ui/button";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getIntl();
  return { title: t.learn.dashboard.title, robots: { index: false } };
}

/** Everything this student holds, most recently enrolled first. */
export default async function LearnPage() {
  const { locale, t } = await getIntl();
  const courses = await listMyCourses(locale);

  return (
    <div className="shell py-12">
      <header className="mb-8">
        <h1 className="font-display text-[32px] leading-[1.1] sm:text-[40px]">{t.learn.dashboard.title}</h1>
        <p className="mt-2 text-[15px] text-ink-3">{t.learn.dashboard.deck}</p>
      </header>

      {courses.length === 0 ? (
        <Empty
          title={t.learn.dashboard.empty}
          action={
            <Link href={coursesPath(locale)} className={buttonClass("primary", "md")}>
              {t.learn.dashboard.emptyAction}
            </Link>
          }
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <div key={course.id} className="space-y-2">
              <CourseCard
                course={course}
                locale={locale}
                t={t}
                progress={{ percent: course.progress.percent, finished: course.progress.finished }}
              />
              <div className="flex items-center justify-between px-1">
                {course.lastActivity ? (
                  <span className="text-xs text-ink-3">
                    {t.learn.dashboard.lastActivity} {formatAgo(course.lastActivity, locale)}
                  </span>
                ) : (
                  <span />
                )}
                <Link
                  href={coursePlayerPath(locale, course.slug)}
                  className="text-xs font-medium text-accent hover:text-accent-hover"
                >
                  {course.progress.started ? t.actions.continue : t.actions.start} →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
