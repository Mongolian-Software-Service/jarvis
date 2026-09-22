import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Lock } from "lucide-react";
import {
  coursePath,
  formatDuration,
  kindLabel,
  learnPath,
  lessonPath,
  type Locale,
} from "@jarvis/core";
import { getIntl, getLocale } from "@/lib/locale";
import { getLessonView } from "@/lib/queries/learn";
import { LessonBody } from "@/components/lesson/player/lesson-body";
import { LessonFooter } from "@/components/lesson/player/lesson-footer";
import { Syllabus } from "@/components/course/syllabus";
import { buttonClass } from "@/components/ui/button";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/learn/[course]/[lesson]">): Promise<Metadata> {
  const { course, lesson } = await params;
  const locale: Locale = await getLocale();
  const view = await getLessonView(course, lesson, locale);
  if (!view?.lesson) return { robots: { index: false } };
  return {
    title: `${view.lesson.title} · ${view.course.title}`,
    // Course material is for students, not for search engines.
    robots: { index: false },
  };
}

export default async function LessonPage({
  params,
}: PageProps<"/[locale]/learn/[course]/[lesson]">) {
  const { course, lesson } = await params;
  const { locale, t } = await getIntl();

  const view = await getLessonView(course, lesson, locale);
  if (!view) notFound();

  const path = lessonPath(locale, course, lesson);
  const copy = { copy: t.actions.copy, copied: t.actions.copied };
  const completed = new Set(view.completed);

  const sidebar = (
    <aside className="space-y-4">
      {/*
       * Out of the course, not back to its sales page: for somebody holding
       * the course that page now redirects here, so a link to it would be a
       * link to the lesson they are already reading. The course's own name
       * stays as text, because it is the only place this screen says which
       * course these lessons belong to.
       */}
      <div className="space-y-1">
        <Link
          href={learnPath(locale)}
          className="text-ink-3 hover:text-ink inline-flex items-center gap-1.5 text-sm"
        >
          <ArrowLeft className="size-4" />
          {t.nav.tab.learn}
        </Link>
        <p className="font-display text-[15px]">{view.course.title}</p>
      </div>
      <Syllabus
        modules={view.modules}
        courseSlug={view.course.slug}
        locale={locale}
        t={t}
        hasAccess={view.hasAccess}
        completed={completed}
        currentSlug={lesson}
      />
    </aside>
  );

  /*
   * The locked screen.
   *
   * This is the case the whole `lesson_outline` view exists for: the lesson is
   * real and in the syllabus, but the policy on `lessons` would not hand the row
   * over. The reader gets told why and where to go, rather than a 404 that says
   * the lesson does not exist when they can see it listed beside them.
   */
  if (view.locked || !view.lesson) {
    return (
      <div className="shell grid gap-10 py-10 lg:grid-cols-[18rem_1fr]">
        <div className="hidden lg:block">{sidebar}</div>
        <div className="panel flex flex-col items-center gap-4 px-6 py-20 text-center">
          <Lock className="text-ink-3 size-8" />
          <h1 className="font-display text-[22px]">{t.learn.player.lockedTitle}</h1>
          <p className="text-ink-3 max-w-sm text-[13px]">{t.learn.player.lockedBody}</p>
          <Link
            href={coursePath(locale, view.course.slug)}
            className={buttonClass("primary", "md")}
          >
            {t.learn.player.backToCourse}
          </Link>
        </div>
      </div>
    );
  }

  const item = view.lesson;

  return (
    <div className="shell grid gap-10 py-10 lg:grid-cols-[18rem_1fr]">
      {/* The syllabus is the navigation on a wide screen and a footer on a
          phone — same component, a different place in the reading order. */}
      <div className="hidden lg:block">
        <div className="lg:sticky lg:top-24 lg:max-h-[calc(100dvh-8rem)] lg:overflow-y-auto lg:pr-2">
          {sidebar}
        </div>
      </div>

      <article className="min-w-0 space-y-8">
        <header className="space-y-3">
          <p className="kicker">
            {kindLabel(item.kind, locale)}
            {item.minutes > 0 ? ` · ${formatDuration(item.minutes, locale)}` : ""}
          </p>
          <h1 className="font-display text-[28px] leading-tight sm:text-[34px]">{item.title}</h1>
        </header>
        <LessonBody view={view} item={item} path={path} t={t} copy={copy} />

        <LessonFooter view={view} item={item} path={path} locale={locale} course={course} t={t} />

        {/* On a phone the syllabus lives here, after the lesson. */}
        <div className="lg:hidden">
          <h2 className="font-display mb-4 text-[15px] font-semibold">{t.learn.player.lessons}</h2>
          {sidebar}
        </div>
      </article>
    </div>
  );
}
