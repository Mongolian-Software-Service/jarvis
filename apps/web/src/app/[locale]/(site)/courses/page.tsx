import type { Metadata } from "next";
import Link from "next/link";
import { COURSE_LEVELS, coursesPath, fmt, levelLabel, type CourseLevel } from "@jarvis/core";
import { getIntl } from "@/lib/locale";
import { listCourses } from "@/lib/queries/courses";
import { CourseCard } from "@/components/course/course-card";
import { Empty } from "@/components/ui/empty";
import { cn } from "@/lib/cn";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getIntl();
  return { title: t.learn.catalogue.title, description: t.learn.catalogue.deck };
}

export default async function CoursesPage({ searchParams }: PageProps<"/[locale]/courses">) {
  const { locale, t } = await getIntl();
  const { level } = await searchParams;
  const active = typeof level === "string" ? (level as CourseLevel) : null;

  const all = await listCourses(locale);
  const courses = active ? all.filter((course) => course.level === active) : all;

  return (
    <div className="shell py-12">
      <header className="mb-8">
        <h1 className="font-display text-[32px] leading-[1.1] sm:text-[40px]">{t.learn.catalogue.title}</h1>
        <p className="mt-2 text-[15px] text-ink-3">{t.learn.catalogue.deck}</p>
      </header>

      {/* Links, not filters. A control drawn as a filter that navigates is the
          worse half of both; these change the URL, so a level can be shared. */}
      <nav className="mb-8 flex flex-wrap gap-2">
        <FilterLink href={coursesPath(locale)} label={t.learn.catalogue.all} active={!active} />
        {COURSE_LEVELS.map((option) => (
          <FilterLink
            key={option}
            href={`${coursesPath(locale)}?level=${option}`}
            label={levelLabel(option, locale)}
            active={active === option}
          />
        ))}
      </nav>

      {courses.length === 0 ? (
        <Empty title={t.learn.catalogue.empty} />
      ) : (
        <>
          <p className="kicker mb-4">{fmt(t.learn.catalogue.count, { count: courses.length })}</p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course, index) => (
              <CourseCard
                key={course.id}
                course={course}
                locale={locale}
                t={t}
                priority={index === 0}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function FilterLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "rounded-full border px-3 py-1 text-[13px] transition-colors",
        active
          ? "border-transparent bg-solid text-solid-ink"
          : "border-line text-ink-3 hover:border-line-strong hover:text-ink",
      )}
    >
      {label}
    </Link>
  );
}
