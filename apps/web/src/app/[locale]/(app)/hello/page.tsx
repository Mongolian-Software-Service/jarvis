import type { Metadata } from "next";
import { coursePath, coursePlayerPath, coursesPath } from "@jarvis/core";
import { getIntl } from "@/lib/locale";
import { listCourses } from "@/lib/queries/courses";
import { listMyCourses } from "@/lib/queries/learn";
import { getViewer } from "@/lib/queries/viewer";
import { CourseTrail, type TrailStep } from "@/components/app/course-trail";
import { HelloWelcome } from "@/components/app/hello/welcome";
import { HelloStats } from "@/components/app/hello/stats";
import { HelloGuide } from "@/components/app/hello/guide";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getIntl();
  return { title: t.guide.title, robots: { index: false } };
}

export default async function HelloPage() {
  const { locale, t } = await getIntl();

  const [courses, mine, viewer] = await Promise.all([
    listCourses(locale),
    listMyCourses(locale),
    getViewer(),
  ]);

  const held = new Map(mine.map((course) => [course.id, course.progress]));
  const opened = (course: (typeof courses)[number]) => held.has(course.id) || course.isFree;
  const done = (course: (typeof courses)[number]) => held.get(course.id)?.finished ?? false;

  /*
   * The trail, in the order the team ranked the courses — which is the order
   * they are meant to be taken in, and the whole point of drawing it.
   *
   * "Current" is found before the map rather than tracked through it: exactly
   * one step may carry it (two "you are here" markers is no marker at all), and
   * a flag flipped inside `.map()` is a mutation during render, which the React
   * Compiler refuses. `-1` when every course is finished, and then no node is
   * marked, which is the honest answer.
   *
   * A free course counts as open before they enrol, because it is — a padlock
   * over the free introduction would be the first thing a new student sees.
   */
  const currentIndex = courses.findIndex((course) => opened(course) && !done(course));

  const steps: TrailStep[] = courses.map((course, index) => {
    const progress = held.get(course.id);

    return {
      id: course.id,
      slug: course.slug,
      title: course.title,
      lessonCount: course.lessonCount,
      coverUrl: course.coverUrl,
      open: opened(course),
      enrolled: Boolean(progress),
      percent: progress?.percent ?? 0,
      finished: done(course),
      current: index === currentIndex,
    };
  });

  const next = currentIndex >= 0 ? steps[currentIndex] : undefined;
  const lessons = courses.reduce((sum, course) => sum + course.lessonCount, 0);
  const minutes = courses.reduce((sum, course) => sum + course.minutes, 0);
  const completed = mine.reduce((sum, course) => sum + course.progress.completed, 0);

  /* Their own name if the provider gave one — the first word of it, because
     "Сайн уу, Батбаярын Тэмүүлэн" is a form field, not a greeting. */
  const firstName = viewer?.fullName?.trim().split(/\s+/)[0];
  const nextHref = next
    ? next.enrolled
      ? coursePlayerPath(locale, next.slug)
      : coursePath(locale, next.slug)
    : coursesPath(locale);

  return (
    <div className="shell space-y-10 py-8 sm:space-y-12 sm:py-12">
      <HelloWelcome
        locale={locale}
        t={t}
        firstName={firstName}
        next={next}
        nextHref={nextHref}
      />

      <HelloStats
        courseCount={courses.length}
        lessons={lessons}
        minutes={minutes}
        completed={completed}
        locale={locale}
        t={t}
      />

      {/* ── The map ───────────────────────────────────────────────────────── */}
      <CourseTrail steps={steps} locale={locale} t={t} />

      <HelloGuide locale={locale} t={t} />
    </div>
  );
}
