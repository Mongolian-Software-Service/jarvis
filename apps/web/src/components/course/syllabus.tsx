import Link from "next/link";
import { BookOpen, Code2, HelpCircle, Lock, PlayCircle } from "lucide-react";
import {
  formatDuration,
  kindLabel,
  lessonPath,
  type LessonKind,
  type Locale,
  type Strings,
} from "@jarvis/core";
import type { CourseModule } from "@/lib/queries/courses";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";

const ICONS: Record<LessonKind, typeof PlayCircle> = {
  video: PlayCircle,
  text: BookOpen,
  code: Code2,
  quiz: HelpCircle,
};

/**
 * The syllabus, for somebody who may not have paid.
 *
 * Every title and every running time is public — they come from the
 * `lesson_outline` view, which exists so a stranger can see what a course
 * covers without the policy on `lessons` having to hand over the bodies.
 *
 * A locked row is not a link. Drawing it as one and refusing on arrival wastes
 * a tap and teaches the reader to distrust the list.
 */
export function Syllabus({
  modules,
  courseSlug,
  locale,
  t,
  hasAccess,
  completed,
  currentSlug,
}: {
  modules: CourseModule[];
  courseSlug: string;
  locale: Locale;
  t: Strings;
  hasAccess: boolean;
  completed?: ReadonlySet<string>;
  currentSlug?: string;
}) {
  /*
   * Lesson numbers run across modules, so row 1 of module 2 is "4" and not "1".
   *
   * Worked out before the JSX rather than with a counter incremented inside it:
   * a variable mutated during render is a value React may have to recompute, and
   * it would then start from wherever it left off.
   */
  const numbers = new Map<string, number>();
  let running = 0;
  for (const section of modules) {
    for (const lesson of section.lessons) {
      running += 1;
      numbers.set(lesson.id, running);
    }
  }

  return (
    <div className="space-y-6">
      {modules.map((section, moduleIndex) => (
        <section key={section.id}>
          <h3 className="mb-3 flex items-baseline gap-2">
            <span className="kicker tabular">{String(moduleIndex + 1).padStart(2, "0")}</span>
            <span className="font-display text-[14px] font-semibold">{section.title}</span>
          </h3>

          <ul className="panel divide-y divide-line overflow-hidden">
            {section.lessons.map((lesson) => {
              const counter = numbers.get(lesson.id) ?? 0;
              const open = hasAccess || lesson.isPreview;
              const Icon = ICONS[lesson.kind];
              const done = completed?.has(lesson.id) ?? false;
              const current = lesson.slug === currentSlug;

              const inner = (
                <>
                  <Icon
                    className={cn(
                      "size-4 shrink-0",
                      done ? "text-ok" : open ? "text-ink-3" : "text-ink-3/60",
                    )}
                  />
                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        "block truncate text-[13px]",
                        current ? "font-semibold text-accent" : open ? "text-ink" : "text-ink-3",
                      )}
                    >
                      {lesson.title}
                    </span>
                    <span className="text-[11px] text-ink-3">
                      {kindLabel(lesson.kind, locale)}
                      {lesson.minutes > 0 ? ` · ${formatDuration(lesson.minutes, locale)}` : ""}
                    </span>
                  </span>
                  {lesson.isPreview && !hasAccess ? (
                    <Badge tone="ok">{t.learn.course.preview}</Badge>
                  ) : null}
                  {!open ? (
                    <Lock className="size-3.5 shrink-0 text-ink-3/60" aria-label={t.learn.course.locked} />
                  ) : null}
                </>
              );

              const rowClass = cn(
                "flex items-center gap-3 px-4 py-3 transition-colors",
                current && "bg-accent-soft/40",
              );

              return (
                <li key={lesson.id}>
                  {open ? (
                    <Link
                      href={lessonPath(locale, courseSlug, lesson.slug)}
                      className={cn(rowClass, "hover:bg-panel-2")}
                    >
                      <span className="w-6 shrink-0 text-xs text-ink-3 tabular">{counter}</span>
                      {inner}
                    </Link>
                  ) : (
                    <div className={cn(rowClass, "cursor-default")}>
                      <span className="w-6 shrink-0 text-xs text-ink-3 tabular">{counter}</span>
                      {inner}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
