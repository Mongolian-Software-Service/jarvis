import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, CheckCircle2, Clock, Globe } from "lucide-react";
import { coursesPath, fmt, formatDuration, groupDigits } from "@jarvis/core";
import { getIntl } from "@/lib/locale";
import { getStudentOverview, listMyProjects } from "@/lib/queries/learn";
import { listCourses } from "@/lib/queries/courses";
import { getViewer } from "@/lib/queries/viewer";
import { CourseCard } from "@/components/course/course-card";
import { ResumeCard } from "@/components/dashboard/resume-card";
import { StatStrip } from "@/components/dashboard/stat-strip";
import { CourseRows } from "@/components/dashboard/course-rows";
import { ProjectsPanel } from "@/components/dashboard/projects-panel";
import { ProjectAdd } from "@/components/dashboard/project-add";

export const metadata: Metadata = { robots: { index: false } };

/**
 * Where a student lands, and the one screen that knows what they were doing.
 *
 * The resume card is the whole point: a list of courses is something they can
 * get from the catalogue, but "you were on lesson four of Flexbox, carry on" is
 * only possible here.
 *
 * Below it, two columns on a laptop: the work on the left — courses still
 * open, then the projects as a grid of cards — and «Төсөл нэмэх» in a narrow
 * column on the right that stays put as the list scrolls. The projects used to
 * be full-width rows with the add form at their foot: a name at one edge of the
 * screen, its buttons at the other, and the form below the fold by the fifth
 * project (§3, "a page spends the width it is given"). On a phone everything
 * stacks in reading order, the form last.
 */
export default async function DashboardPage() {
  const { locale, t } = await getIntl();
  const [viewer, overview, projects] = await Promise.all([
    getViewer(),
    getStudentOverview(locale),
    listMyProjects(),
  ]);

  const firstName = viewer?.fullName?.trim().split(/\s+/)[0];
  const started = overview.courses.filter((course) => !course.progress.finished);
  const holdsCourses = overview.courses.length > 0;

  // A student holding nothing sees what they could start, not an empty panel.
  const catalogue = holdsCourses ? [] : await listCourses(locale);

  const copy = t.learn.overview;
  const stats = [
    { icon: BookOpen, label: copy.statCourses, value: groupDigits(overview.courses.length) },
    { icon: CheckCircle2, label: copy.statLessons, value: groupDigits(overview.lessonsDone) },
    {
      icon: Clock,
      label: copy.statMinutes,
      value: formatDuration(overview.minutesWatched, locale),
    },
    { icon: Globe, label: copy.statProjects, value: groupDigits(projects.length) },
  ];

  return (
    <div className="shell space-y-8 py-8 sm:py-12">
      <header>
        <h1 className="font-display text-[28px] leading-[1.1] sm:text-[32px]">
          {firstName ? fmt(copy.greeting, { name: firstName }) : copy.greetingPlain}
        </h1>
        <p className="text-ink-3 mt-2 text-[15px]">{overview.resume ? copy.deck : copy.deckIdle}</p>
      </header>

      {overview.resume ? <ResumeCard resume={overview.resume} locale={locale} t={t} /> : null}

      {holdsCourses ? <StatStrip stats={stats} /> : null}

      {/* Projects are open to everybody signed in, course or no course
          (20261002000300), so neither column is behind `holdsCourses`.
          `minmax(0, …)` at every width: an implicit `auto` column grows to
          its widest unbreakable line, and a 60-character host would push a
          360px phone sideways past every `truncate` inside. */}
      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-10">
          {started.length > 0 ? <CourseRows courses={started} locale={locale} t={t} /> : null}
          <ProjectsPanel projects={projects} locale={locale} t={t} />
        </div>
        <aside className="lg:sticky lg:top-20">
          <ProjectAdd count={projects.length} t={t} />
        </aside>
      </div>

      {/* A student who holds nothing */}
      {catalogue.length > 0 ? (
        <section>
          <div className="mb-4 flex items-end justify-between gap-4">
            <h2 className="font-display text-[20px]">{t.learn.dashboard.browseTitle}</h2>
            <Link
              href={coursesPath(locale)}
              className="text-ink-3 hover:text-ink shrink-0 text-[13px] transition-colors"
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
