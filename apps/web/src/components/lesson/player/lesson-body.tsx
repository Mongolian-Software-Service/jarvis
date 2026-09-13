import type { LessonContent, Strings } from "@jarvis/core";
import type { LessonView } from "@/lib/queries/learn";
import { LessonVideo } from "@/components/lesson/lesson-video";
import { Markdown } from "@/components/lesson/markdown";
import { Exercise } from "@/components/lesson/exercise";
import { Quiz } from "@/components/lesson/quiz";

/**
 * One lesson row, drawn as whatever it actually holds.
 *
 * `kind` says what it leads with, not what it has (§1): a row with a video and
 * a body and an exercise renders all three, in this order, and needs no new
 * kind to do it.
 */
export function LessonBody({
  view,
  item,
  path,
  t,
  copy,
}: {
  view: LessonView;
  item: LessonContent;
  path: string;
  t: Strings;
  copy: { copy: string; copied: string };
}) {
  return (
    <>

        {item.videoUrl ? (
          <LessonVideo
            src={item.videoUrl}
            courseId={view.course.id}
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
            courseId={view.course.id}
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
    </>
  );
}
