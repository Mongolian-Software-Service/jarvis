import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Lock } from "lucide-react";
import {
  coursePath,
  formatDuration,
  kindLabel,
  lessonPath,
  type Locale,
} from "@jarvis/core";
import { getIntl, getLocale } from "@/lib/locale";
import { getLessonView } from "@/lib/queries/learn";
import { Markdown } from "@/components/lesson/markdown";
import { LessonVideo } from "@/components/lesson/lesson-video";
import { Exercise } from "@/components/lesson/exercise";
import { Quiz } from "@/components/lesson/quiz";
import { CompleteButton } from "@/components/lesson/complete-button";
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
      <Link
        href={coursePath(locale, view.course.slug)}
        className="inline-flex items-center gap-1.5 text-sm text-ink-3 hover:text-ink"
      >
        <ArrowLeft className="size-4" />
        {view.course.title}
      </Link>
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
          <Lock className="size-8 text-ink-3" />
          <h1 className="font-display text-[22px]">{t.learn.player.lockedTitle}</h1>
          <p className="max-w-sm text-[13px] text-ink-3">{t.learn.player.lockedBody}</p>
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
          <h1 className="font-display text-[28px] leading-tight sm:text-[34px]">
            {item.title}
          </h1>
        </header>

        {item.videoUrl ? (
          <LessonVideo
            src={item.videoUrl}
            lessonId={item.id}
            startAt={view.progress.secondsWatched}
            path={path}
          />
        ) : null}

        {item.body ? (
          <>
            <Markdown
              source={item.body}
              copyLabels={copy}
              lang={item.bodyIsFallback ? "mn" : undefined}
              className="measure"
            />
            {item.bodyIsFallback ? (
              <p className="measure rounded-md border border-line bg-panel-2 px-4 py-3 text-xs text-ink-3">
                {t.learn.fallbackNotice}
              </p>
            ) : null}
          </>
        ) : null}

        {item.starterCode ? (
          <Exercise
            starter={item.starterCode}
            solution={item.solutionCode}
            language={item.codeLanguage}
            labels={{
              starter: t.learn.code.starter,
              solution: t.learn.code.solution,
              show: t.learn.code.showSolution,
              hide: t.learn.code.hideSolution,
              warning: t.learn.code.solutionWarning,
              copy: t.actions.copy,
              copied: t.actions.copied,
            }}
          />
        ) : null}

        {view.quiz.length > 0 ? (
          <Quiz
            questions={view.quiz}
            lessonId={item.id}
            path={path}
            labels={{
              question: t.learn.quiz.question,
              check: t.learn.quiz.check,
              correct: t.learn.quiz.correct,
              wrong: t.learn.quiz.wrong,
              next: t.learn.quiz.next,
              finish: t.learn.quiz.finish,
              retry: t.learn.quiz.retry,
              result: t.learn.quiz.result,
              passed: t.learn.quiz.passed,
              failed: t.learn.quiz.failed,
            }}
          />
        ) : null}

        <footer className="hairline flex flex-wrap items-center justify-between gap-4 pt-6">
          <CompleteButton
            lessonId={item.id}
            path={path}
            done={view.progress.completed}
            labels={{
              mark: t.learn.player.markComplete,
              marked: t.learn.player.marked,
              unmark: t.learn.player.unmark,
            }}
          />

          <div className="flex gap-2">
            {view.previous ? (
              <Link
                href={lessonPath(locale, course, view.previous.slug)}
                className={buttonClass("secondary", "md")}
              >
                <ArrowLeft className="size-4" />
                {t.learn.player.prevLesson}
              </Link>
            ) : null}
            {view.next ? (
              <Link
                href={lessonPath(locale, course, view.next.slug)}
                className={buttonClass("primary", "md")}
              >
                {t.learn.player.nextLesson}
                <ArrowRight className="size-4" />
              </Link>
            ) : (
              <Link
                href={coursePath(locale, view.course.slug)}
                className={buttonClass("secondary", "md")}
              >
                {t.learn.player.backToCourse}
              </Link>
            )}
          </div>
        </footer>

        {/* On a phone the syllabus lives here, after the lesson. */}
        <div className="lg:hidden">
          <h2 className="font-display mb-4 text-[15px] font-semibold">{t.learn.player.lessons}</h2>
          {sidebar}
        </div>
      </article>
    </div>
  );
}
