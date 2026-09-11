import Image from "next/image";
import Link from "next/link";
import {
  coursePath,
  formatDuration,
  formatMoney,
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
          <span aria-hidden="true">·</span>
          <span className="tabular">
            {course.lessonCount} {t.learn.course.lessons}
          </span>
          {course.minutes > 0 ? (
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
            <div className="flex items-center justify-between">
              <span
                className={cn(
                  "font-display text-[15px] font-semibold",
                  course.priceMnt <= 0 ? "text-ok" : "text-ink",
                )}
              >
                {formatMoney(course.priceMnt, locale)}
              </span>
              {course.priceMnt <= 0 ? <Badge tone="ok">{t.learn.course.preview}</Badge> : null}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
