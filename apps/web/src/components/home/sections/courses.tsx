import Link from "next/link";
import {
  coursesPath,
  formatDuration,
  groupDigits,
  type CourseCard as CourseCardShape,
  type Locale,
  type Strings,
} from "@jarvis/core";
import { Empty } from "@/components/ui/empty";
import { CourseCard } from "@/components/course/course-card";

/** The six tracks, and the one sentence about what they cost together. */
export function CourseGrid({
  courses,
  locale,
  t,
  lessons,
  minutes,
}: {
  courses: CourseCardShape[];
  locale: Locale;
  t: Strings;
  lessons: number;
  minutes: number;
}) {
  return (
      <section className="shell py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl leading-[1.1] sm:text-[32px]">
              {t.marketing.courses.title}
            </h2>
            <p className="mt-1.5 text-[15px] text-ink-3">{t.marketing.courses.note}</p>
          </div>
          <Link
            href={coursesPath(locale)}
            className="shrink-0 text-[13px] text-ink-3 transition-colors hover:text-ink"
          >
            {t.actions.seeAll} →
          </Link>
        </div>

        {courses.length === 0 ? (
          <Empty title={t.learn.catalogue.empty} body={t.states.errorHelp} />
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {courses.slice(0, 6).map((course, index) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  locale={locale}
                  t={t}
                  /* Only the first cover is the LCP candidate; priority on all
                     of them would make every one urgent, which is none. */
                  priority={index === 0}
                />
              ))}
            </div>

            <dl className="mt-12 flex flex-wrap justify-center gap-x-14 gap-y-6 border-t border-line pt-10">
              {[
                { value: groupDigits(courses.length), label: t.marketing.stats.courses },
                { value: groupDigits(lessons), label: t.marketing.stats.lessons },
                { value: formatDuration(minutes, locale), label: t.marketing.stats.hours },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <dt className="sr-only">{stat.label}</dt>
                  <dd className="font-display text-[28px] tabular">{stat.value}</dd>
                  <p className="mt-0.5 text-[13px] text-ink-3">{stat.label}</p>
                </div>
              ))}
            </dl>
          </>
        )}
      </section>
  );
}
