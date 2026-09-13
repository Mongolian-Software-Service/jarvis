import Link from "next/link";
import { BookOpen, Check, Code2, HelpCircle, Lock, PlayCircle } from "lucide-react";
import {
  formatDuration,
  kindLabel,
  lessonPath,
  type LessonKind,
  type Locale,
  type Strings,
} from "@jarvis/core";
import type { CourseModule } from "@/lib/queries/courses";
import { cn } from "@/lib/cn";

const ICONS: Record<LessonKind, typeof PlayCircle> = {
  video: PlayCircle,
  text: BookOpen,
  code: Code2,
  quiz: HelpCircle,
};

/**
 * The lessons of one course, as a path rather than a list.
 *
 * The same idea as the map on «Сайн уу», one level down: a line you walk, with
 * a bead per stop that says finished, here, or not yet. A course is taken in
 * order — lesson four leans on lesson three — and a flat list of rows does not
 * say that, while a numbered line does.
 *
 * Vertical rather than the winding column the course map uses: sixteen lessons
 * on a weaving path would be four screens tall, and a reader scanning for
 * "where was I" would have to follow it round every bend.
 *
 * `Syllabus` stays what it is — the compact list for the sales page and the
 * player's sidebar, where the reader wants density, not a journey.
 */
export function LessonPath({
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
  completed: ReadonlySet<string>;
  /** Where «Үргэлжлүүлэх» would land — marked so the eye finds it first. */
  currentSlug?: string;
}) {
  /*
   * Lesson numbers run across modules, so row 1 of module 2 is "4", not "1" —
   * and they are worked out before the JSX, because a counter incremented
   * inside a render is a value React may recompute from wherever it left off.
   */
  const numbers = new Map<string, number>();
  let running = 0;
  for (const section of modules) {
    for (const lesson of section.lessons) {
      running += 1;
      numbers.set(lesson.id, running);
    }
  }
  const total = running;

  return (
    <div className="space-y-8">
      {modules.map((section, moduleIndex) => (
        <section key={section.id}>
          <h2 className="mb-4 flex items-baseline gap-2.5">
            <span className="kicker tabular">{String(moduleIndex + 1).padStart(2, "0")}</span>
            <span className="font-display text-[15px] font-semibold">{section.title}</span>
          </h2>

          <ol>
            {section.lessons.map((lesson) => {
              const counter = numbers.get(lesson.id) ?? 0;
              const open = hasAccess || lesson.isPreview;
              const done = completed.has(lesson.id);
              const current = lesson.slug === currentSlug;
              const Icon = ICONS[lesson.kind];
              const last = counter === total;

              const row = (
                <>
                  {/* The bead and the thread down to the next one. The thread is
                      green behind a finished lesson: the road already walked. */}
                  <span className="relative w-10 shrink-0">
                    <span
                      className={cn(
                        "grid size-10 place-items-center rounded-full border transition-colors",
                        done
                          ? "border-ok/40 bg-ok-soft text-ok"
                          : current
                            ? "border-accent bg-accent-soft text-accent"
                            : open
                              ? "border-line bg-panel-2 text-ink-2"
                              : "border-line bg-panel text-ink-3/60",
                      )}
                    >
                      {done ? (
                        <Check className="size-5" aria-hidden="true" />
                      ) : open ? (
                        <span className="font-display tabular text-[14px]">{counter}</span>
                      ) : (
                        <Lock className="size-4" aria-hidden="true" />
                      )}
                    </span>

                    {last ? null : (
                      <span
                        aria-hidden="true"
                        className={cn(
                          "absolute top-10 bottom-[-1rem] left-1/2 w-px -translate-x-1/2",
                          done ? "bg-ok/40" : "bg-line",
                        )}
                      />
                    )}
                  </span>

                  <span
                    className={cn(
                      "min-w-0 flex-1 rounded-lg border px-4 py-3 transition-colors",
                      current
                        ? "border-accent/50 bg-accent-soft/30"
                        : open
                          ? "border-line bg-panel group-hover:border-line-strong group-hover:bg-panel-2"
                          : "border-line bg-panel/60",
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <Icon
                        className={cn("size-4 shrink-0", done ? "text-ok" : "text-ink-3")}
                        aria-hidden="true"
                      />
                      <span
                        className={cn(
                          "min-w-0 flex-1 truncate text-[14px] font-medium",
                          current ? "text-accent" : open ? "text-ink" : "text-ink-3",
                        )}
                      >
                        {lesson.title}
                      </span>
                      {current ? (
                        <span className="kicker text-accent shrink-0">{t.guide.trail.here}</span>
                      ) : null}
                    </span>
                    <span className="text-ink-3 mt-0.5 block text-[12px]">
                      {kindLabel(lesson.kind, locale)}
                      {lesson.minutes > 0 ? ` · ${formatDuration(lesson.minutes, locale)}` : ""}
                      {done ? ` · ${t.learn.dashboard.finished}` : ""}
                    </span>
                  </span>
                </>
              );

              return (
                <li key={lesson.id} className="pb-4 last:pb-0">
                  {/* A locked row is not a link. Drawing it as one and refusing
                      on arrival wastes a tap and teaches the reader to distrust
                      the list. */}
                  {open ? (
                    <Link
                      href={lessonPath(locale, courseSlug, lesson.slug)}
                      className="group flex items-stretch gap-4"
                    >
                      {row}
                    </Link>
                  ) : (
                    <div className="flex cursor-default items-stretch gap-4">{row}</div>
                  )}
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}
