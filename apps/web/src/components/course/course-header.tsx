import Image from "next/image";
import { BookOpen, Clock, Layers, Signal } from "lucide-react";
import {
  BUNDLE_FULL_PRICE_MNT,
  BUNDLE_PRICE_MNT,
  BUNDLE_SAVING_MNT,
  fmt,
  formatDuration,
  formatMoney,
  levelLabel,
  topicLabel,
  type Locale,
  type Strings,
} from "@jarvis/core";
import type { CourseDetail } from "@jarvis/core";
import { EnrollButton } from "@/components/course/enroll-button";
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
      <header className="border-b border-line bg-panel">
        <div className="shell grid gap-8 py-12 lg:grid-cols-[1fr_44%] lg:items-center">
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <TopicChip topic={course.topic} label={topicLabel(course.topic)} />
              <span className="text-xs text-ink-3">{levelLabel(course.level, locale)}</span>
            </div>

            <h1 className="font-display text-[32px] leading-[1.1] sm:text-[40px] lg:text-[48px]">
              {course.title}
            </h1>
            <p className="measure mt-4 text-[15px] text-ink-3">{course.summary}</p>

            <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-sm">
              <Meta icon={Layers} label={t.learn.course.syllabus} value={`${course.modules.length}`} />
              <Meta
                icon={BookOpen}
                label={t.learn.course.lessons}
                value={`${course.lessonCount}`}
              />
              <Meta
                icon={Clock}
                label={t.learn.course.duration}
                value={formatDuration(course.minutes, locale)}
              />
              <Meta
                icon={Signal}
                label={t.learn.course.level}
                value={levelLabel(course.level, locale)}
              />
            </dl>
          </div>

          <div className="space-y-4">
            <div className="relative aspect-[16/10] overflow-hidden rounded-lg border border-line bg-panel-2">
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
                <div className="absolute inset-0 grid place-items-center font-mono text-5xl text-ink-3">
                  {"</>"}
                </div>
              )}
            </div>

            {/*
              * What it costs, which for a paid course is not a fact about this
              * course. It is not sold on its own (§1), so the panel quotes the
              * one price and the button below buys all of it — saying so in
              * small print underneath, where a buyer who came looking for this
              * course alone will read it before they click.
              */}
            <div className="panel-raised space-y-4 p-5">
              {course.isFree ? (
                <div className="flex items-baseline justify-between">
                  <span className="font-display text-[26px] text-ok">{t.learn.course.free}</span>
                  {access ? (
                    <span className="text-xs text-ok">{t.learn.course.enrolled}</span>
                  ) : null}
                </div>
              ) : (
                <div>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-[13px] text-ink-3">{t.learn.bundle.allCourses}</span>
                    <span className="font-display text-[26px] tabular">
                      {formatMoney(BUNDLE_PRICE_MNT, locale)}
                    </span>
                  </div>
                  <p className="mt-1 text-right text-[13px] text-ink-3">
                    <span className="line-through">
                      {formatMoney(BUNDLE_FULL_PRICE_MNT, locale)}
                    </span>{" "}
                    <span className="text-ok">
                      {fmt(t.learn.bundle.save, {
                        amount: formatMoney(BUNDLE_SAVING_MNT, locale),
                      })}
                    </span>
                  </p>
                  {access ? (
                    <p className="mt-1 text-right text-xs text-ok">{t.learn.course.enrolled}</p>
                  ) : null}
                </div>
              )}

              <EnrollButton
                courseId={course.id}
                courseSlug={course.slug}
                locale={locale}
                free={course.isFree}
                enrolled={access}
                signedIn={Boolean(signedIn)}
                labels={{
                  buy: t.learn.bundle.buy,
                  buying: t.learn.bundle.buying,
                  startFree: t.learn.course.startFree,
                  continue: t.learn.course.continue,
                  signIn: course.isFree ? t.learn.course.signInToStart : t.learn.bundle.signIn,
                  error: t.states.error,
                }}
              />

              {course.isFree || access ? null : (
                <p className="text-[12px] leading-relaxed text-ink-3">
                  {t.learn.bundle.onlyTogether}
                </p>
              )}
            </div>
          </div>
        </div>
      </header>
  );
}

function Meta({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="size-4 text-ink-3" aria-hidden="true" />
      <div>
        <dt className="sr-only">{label}</dt>
        <dd className="font-medium tabular">{value}</dd>
      </div>
    </div>
  );
}
