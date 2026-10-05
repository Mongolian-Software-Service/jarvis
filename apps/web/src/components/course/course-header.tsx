import Image from "next/image";
import { BookOpen, Clock, Layers, Signal } from "lucide-react";
import {
  SHOW_CONTENT_SIZE,
  formatDuration,
  levelLabel,
  topicLabel,
  type Locale,
  type Strings,
} from "@jarvis/core";
import type { CourseDetail } from "@jarvis/core";
import { CourseOffer } from "@/components/course/course-offer";
import { TopicChip } from "@/components/ui/badge";

/**
 * The header spends its width on the two things somebody came for: what this
 * is, and what it looks like. A centred measure alone on a wide panel leaves a
 * third of a desktop screen empty down each side.
 */
export function CourseHeader({
  course,
  locale,
  t,
  access,
  signedIn,
}: {
  course: CourseDetail;
  locale: Locale;
  t: Strings;
  access: boolean;
  signedIn: boolean;
}) {
  return (
    <header className="border-line bg-panel border-b">
      <div className="shell grid gap-8 py-12 lg:grid-cols-[1fr_44%] lg:items-center">
        <div>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <TopicChip topic={course.topic} label={topicLabel(course.topic)} />
            <span className="text-ink-3 text-xs">{levelLabel(course.level, locale)}</span>
          </div>

          <h1 className="font-display text-[32px] leading-[1.1] sm:text-[40px] lg:text-[48px]">
            {course.title}
          </h1>
          <p className="measure text-ink-3 mt-4 text-[15px]">{course.summary}</p>

          {/* The course's size is not advertised yet (§1) — the syllabus below
              still lists every lesson and its minutes. */}
          {SHOW_CONTENT_SIZE ? (
            <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-sm">
              <Meta
                icon={Layers}
                label={t.learn.course.syllabus}
                value={`${course.modules.length}`}
              />
              <Meta
                icon={BookOpen}
                label={t.learn.course.lessons}
                value={`${course.lessonCount}`}
              />
              {/* 0 is "not known yet" — a video waiting on its film — as on the card. */}
              {course.minutes > 0 ? (
                <Meta
                  icon={Clock}
                  label={t.learn.course.duration}
                  value={formatDuration(course.minutes, locale)}
                />
              ) : null}
              <Meta
                icon={Signal}
                label={t.learn.course.level}
                value={levelLabel(course.level, locale)}
              />
            </dl>
          ) : (
            <p className="text-ink-3 mt-6 text-sm">{t.learn.bundle.growing}</p>
          )}
        </div>

        <div className="space-y-4">
          <div className="border-line bg-panel-2 relative aspect-[16/10] overflow-hidden rounded-lg border">
            {course.coverUrl ? (
              <Image
                src={course.coverUrl}
                alt=""
                fill
                sizes="(max-width: 1024px) 100vw, 44vw"
                priority
                className="object-cover"
              />
            ) : (
              <div className="text-ink-3 absolute inset-0 grid place-items-center font-mono text-5xl">
                {"</>"}
              </div>
            )}
          </div>

          <CourseOffer course={course} locale={locale} t={t} access={access} signedIn={signedIn} />
        </div>
      </div>
    </header>
  );
}

function Meta({ icon: Icon, label, value }: { icon: typeof Clock; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="text-ink-3 size-4" aria-hidden="true" />
      <div>
        <dt className="sr-only">{label}</dt>
        <dd className="tabular font-medium">{value}</dd>
      </div>
    </div>
  );
}
