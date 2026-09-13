import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { coursePath, lessonPath, type LessonContent, type Locale, type Strings } from "@jarvis/core";
import type { LessonView } from "@/lib/queries/learn";
import { CompleteButton } from "@/components/lesson/complete-button";
import { buttonClass } from "@/components/ui/button";

/** Where to go next, and the only way back. */
export function LessonFooter({
  view,
  item,
  path,
  locale,
  course,
  t,
}: {
  view: LessonView;
  item: LessonContent;
  path: string;
  locale: Locale;
  course: string;
  t: Strings;
}) {
  return (
        <footer className="hairline flex flex-wrap items-center justify-between gap-4 pt-6">
          <CompleteButton
            courseId={view.course.id}
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
  );
}
