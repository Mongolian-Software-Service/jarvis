import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import {
  SHOW_CONTENT_SIZE,
  coursePath,
  formatDuration,
  levelLabel,
  topicLabel,
  type Locale,
  type Strings,
} from "@jarvis/core";
import type { CourseCard as CourseCardData } from "@/lib/queries/courses";
import { Badge, TopicChip } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/cn";

/**
 * One card, one component.
 *
 * Four card components is the failure mode; this one takes a `progress` and
 * grows the bar when a student owns the course. The whole card is the link —
 * the anchor on the headline is stretched over it — so a card is one tab stop
 * and the focus ring lands on the title rather than on a picture.
 */
export function CourseCard({
  course,
  locale,
  t,
  progress,
  priority = false,
}: {
  course: CourseCardData;
  locale: Locale;
  t: Strings;
  progress?: { percent: number; finished: boolean };
  priority?: boolean;
}) {
  return (
    <article
      className={cn(
        "card group relative flex flex-col overflow-hidden rounded-lg border border-line bg-panel",
        "transition-colors duration-200 hover:border-line-strong hover:bg-panel-2",
      )}
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-panel-2">
        {course.coverUrl ? (
          <Image
            src={course.coverUrl}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
            priority={priority}
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center font-mono text-3xl text-ink-3">
            {"</>"}
          </div>
        )}
        <div className="absolute top-3 left-3 flex gap-1.5">
          <TopicChip topic={course.topic} label={topicLabel(course.topic)} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <div className="flex items-center gap-1.5 text-[12px] text-ink-3">
          <span>{levelLabel(course.level, locale)}</span>
          {/* Lessons and minutes wait for `SHOW_CONTENT_SIZE` (§1): «20 мин» under
              «2D-ээс 3D хүртэл» answers a question the buyer had not asked yet. */}
          {SHOW_CONTENT_SIZE ? (
            <>
              <span aria-hidden="true">·</span>
              <span className="tabular">
                {course.lessonCount} {t.learn.course.lessons}
              </span>
            </>
          ) : null}
          {SHOW_CONTENT_SIZE && course.minutes > 0 ? (
            <>
              <span aria-hidden="true">·</span>
              <span className="tabular">{formatDuration(course.minutes, locale)}</span>
            </>
          ) : null}
        </div>

        <h3 className="font-display text-[15px] leading-snug font-semibold">
          <Link href={coursePath(locale, course.slug)} className="card-link after:absolute">
            {course.title}
          </Link>
        </h3>

        <p className="line-clamp-2 text-[13px] leading-relaxed text-ink-3">{course.summary}</p>

        <div className="mt-auto pt-2">
          {progress ? (
            <div className="space-y-2">
              <Progress
                value={progress.percent}
                tone={progress.finished ? "ok" : "accent"}
                label={course.title}
              />
              <p className="text-[12px] text-ink-3 tabular">
                {progress.finished
                  ? t.learn.dashboard.finished
                  : `${progress.percent}% · ${t.learn.course.completed}`}
              </p>
            </div>
          ) : (
            /*
             * No price on a card.
             *
             * There is one price and it is on the panel above this grid — a
             * number here would read as a second thing to buy, next to five
             * others, which is the decision the bundle exists to remove. A
             * course either costs nothing or is inside it, so that is what a
             * card says.
             */
            <div className="flex items-center justify-between gap-2">
              {course.isFree ? (
                <>
                  <span className="font-display text-[15px] font-semibold text-ok">
                    {t.learn.course.free}
                  </span>
                  <Badge tone="ok">{t.learn.course.preview}</Badge>
                </>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-[13px] text-ink-3">
                  <Check className="size-3.5 shrink-0 text-ok" aria-hidden="true" />
                  {t.learn.bundle.included}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
