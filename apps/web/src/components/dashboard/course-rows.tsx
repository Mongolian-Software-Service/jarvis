import Image from "next/image";
import Link from "next/link";
import { learnPath, type Locale, type Strings } from "@jarvis/core";
import type { EnrolledCourse } from "@/lib/queries/learn";
import { Progress } from "@/components/ui/progress";

/**
 * «Явж байгаа» — every course still open, with how far along it is.
 *
 * Each row carries the course's cover now: five rows of a title over an empty
 * bar read as one grey list, and the picture is what a student already knows
 * the course by from the catalogue.
 */
export function CourseRows({
  courses,
  locale,
  t,
}: {
  courses: EnrolledCourse[];
  locale: Locale;
  t: Strings;
}) {
  return (
    <section>
      <h2 className="font-display mb-4 text-[20px]">{t.learn.overview.inProgress}</h2>
      <div className="panel divide-line divide-y overflow-hidden">
        {/*
         * Every row goes to «Миний сургалт», not into its own course.
         * Resuming already has a screen of its own directly above — the
         * course, the lesson and a button straight into it. A second way
         * to resume, hidden behind a progress bar, would be the same
         * journey twice; this list is here to be read, and the place it
         * leads to is the fuller version of itself.
         */}
        {courses.map((course) => (
          <Link
            key={course.id}
            href={learnPath(locale)}
            className="hover:bg-panel-2 flex items-center gap-4 px-4 py-3.5 transition-colors"
          >
            <span className="border-line bg-panel-2 relative hidden aspect-[16/10] w-16 shrink-0 overflow-hidden rounded-md border sm:block">
              {course.coverUrl ? (
                <Image src={course.coverUrl} alt="" fill sizes="4rem" className="object-cover" />
              ) : null}
            </span>

            <span className="min-w-0 flex-1">
              <span className="flex items-baseline justify-between gap-3">
                <span className="truncate text-[14px]">{course.title}</span>
                <span className="text-ink-3 tabular shrink-0 text-[12px]">
                  {course.progress.completed}/{course.progress.total}
                </span>
              </span>
              <span className="mt-2 block">
                <Progress value={course.progress.percent} label={course.title} />
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
