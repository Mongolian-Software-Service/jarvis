import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { BookOpen, Clock, Layers, Signal } from "lucide-react";
import {
  excerpt,
  formatDuration,
  formatMoney,
  levelLabel,
  topicLabel,
  type Locale,
} from "@jarvis/core";
import { getIntl, getLocale } from "@/lib/locale";
import { getCourseBySlug, hasCourseAccess } from "@/lib/queries/courses";
import { getViewer } from "@/lib/queries/viewer";
import { pageMetadata } from "@/lib/seo";
import { Markdown } from "@/components/lesson/markdown";
import { Syllabus } from "@/components/course/syllabus";
import { EnrollButton } from "@/components/course/enroll-button";
import { TopicChip } from "@/components/ui/badge";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/courses/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const locale: Locale = await getLocale();
  const course = await getCourseBySlug(slug, locale);
  if (!course) return {};

  return pageMetadata({
    locale,
    title: course.title,
    description: course.summary || excerpt(course.description ?? ""),
    path: `/courses/${course.slug}`,
    image: course.coverUrl,
  });
}

export default async function CoursePage({ params }: PageProps<"/[locale]/courses/[slug]">) {
  const { slug } = await params;
  const { locale, t } = await getIntl();

  const course = await getCourseBySlug(slug, locale);
  if (!course) notFound();

  const [access, viewer] = await Promise.all([hasCourseAccess(course.id), getViewer()]);
  const copy = { copy: t.actions.copy, copied: t.actions.copied };

  return (
    <article>
      {/*
       * The header spends its width on the two things somebody came for: what
       * this is, and what it looks like. A centred measure alone on a wide panel
       * leaves a third of a desktop screen empty down each side.
       */}
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

            <div className="panel-raised space-y-4 p-5">
              <div className="flex items-baseline justify-between">
                <span className="font-display text-[26px]">
                  {formatMoney(course.priceMnt, locale)}
                </span>
                {access ? (
                  <span className="text-xs text-ok">{t.learn.course.enrolled}</span>
                ) : null}
              </div>

              <EnrollButton
                courseId={course.id}
                courseSlug={course.slug}
                locale={locale}
                priceMnt={course.priceMnt}
                enrolled={access}
                signedIn={Boolean(viewer)}
                labels={{
                  buy: t.learn.course.buy,
                  buying: t.learn.course.buying,
                  startFree: t.learn.course.startFree,
                  continue: t.learn.course.continue,
                  signIn: t.learn.course.signInToBuy,
                  error: t.states.error,
                }}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="shell grid gap-12 py-12 lg:grid-cols-[1fr_22rem] lg:items-start">
        <section>
          <h2 className="font-display mb-4 text-[20px]">{t.learn.course.about}</h2>
          {course.description ? (
            <Markdown
              source={course.description}
              copyLabels={copy}
              /* Mongolian shown inside the English edition has to say which
                 language it is, or a screen reader pronounces Cyrillic with
                 English rules. */
              lang={course.descriptionIsFallback ? "mn" : undefined}
            />
          ) : (
            <p className="text-ink-3">{course.summary}</p>
          )}
          {course.descriptionIsFallback ? (
            <p className="mt-4 rounded-md border border-line bg-panel-2 px-4 py-3 text-xs text-ink-3">
              {t.learn.fallbackNotice}
            </p>
          ) : null}
        </section>

        <section className="lg:sticky lg:top-24">
          <h2 className="font-display mb-4 text-[20px]">{t.learn.course.syllabus}</h2>
          <Syllabus
            modules={course.modules}
            courseSlug={course.slug}
            locale={locale}
            t={t}
            hasAccess={access}
          />
        </section>
      </div>
    </article>
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
