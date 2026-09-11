import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { coursesPath, formatDuration, groupDigits, signInPath } from "@jarvis/core";
import { getIntl } from "@/lib/locale";
import { listCourses } from "@/lib/queries/courses";
import { getViewer } from "@/lib/queries/viewer";
import { CourseCard } from "@/components/course/course-card";
import { ProductShot } from "@/components/home/product-shot";
import { FeatureRow } from "@/components/home/feature-row";
import {
  AiVisual,
  GameVisual,
  MobileVisual,
  WebsiteVisual,
} from "@/components/home/feature-visuals";
import { TechMarquee } from "@/components/home/tech-marquee";
import { buttonClass } from "@/components/ui/button";
import { Empty } from "@/components/ui/empty";

export default async function HomePage() {
  const { locale, t } = await getIntl();
  const [courses, viewer] = await Promise.all([listCourses(locale), getViewer()]);

  const lessons = courses.reduce((sum, course) => sum + course.lessonCount, 0);
  const minutes = courses.reduce((sum, course) => sum + course.minutes, 0);
  const free = courses.find((course) => course.priceMnt <= 0);

  /* One per row, in the order the four tracks are written in `marketing`. */
  const visuals = [
    <WebsiteVisual key="website" t={t} />,
    <MobileVisual key="mobile" />,
    <GameVisual key="game" />,
    <AiVisual key="ai" t={t} />,
  ];

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/*
         * One faint wash from above, and a hairline grid under it.
         *
         * Against a #08090a ground a pair of coloured radial gradients reads as
         * a smudge; a single soft source behind the headline is the treatment
         * that works. The grid is masked so it never reaches an edge.
         */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(60rem 26rem at 50% -8rem, var(--accent-soft), transparent 70%)",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "linear-gradient(to right, var(--line) 1px, transparent 1px), linear-gradient(to bottom, var(--line) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage: "radial-gradient(40rem 20rem at 50% 0%, #000, transparent 75%)",
          }}
        />

        <div className="shell relative pt-20 text-center sm:pt-28">
          {free ? (
            <Link
              href={`${coursesPath(locale)}/${free.slug}`}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-panel/60 py-1 pr-3 pl-1 text-[13px] text-ink-3 transition-colors hover:border-line-strong hover:text-ink"
            >
              <span className="rounded-full bg-solid px-2 py-0.5 text-[11px] font-medium text-solid-ink">
                {t.marketing.hero.badgeLabel}
              </span>
              {t.marketing.hero.badgeText}
              <ArrowRight className="size-3.5" />
            </Link>
          ) : (
            <p className="kicker mb-5">{t.marketing.hero.kicker}</p>
          )}

          <h1 className="font-display mx-auto max-w-3xl text-[2.25rem] leading-[1.1] sm:text-5xl lg:text-[3.5rem]">
            {t.marketing.hero.title}
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-[15px] text-ink-3">{t.marketing.hero.deck}</p>

          <div className="mt-8 flex flex-wrap justify-center gap-2.5">
            <Link href={coursesPath(locale)} className={buttonClass("primary", "lg")}>
              {t.marketing.hero.primary}
              <ArrowRight className="size-3.5" />
            </Link>
            {free ? (
              <Link
                href={`${coursesPath(locale)}/${free.slug}`}
                className={buttonClass("secondary", "lg")}
              >
                {t.marketing.hero.secondary}
              </Link>
            ) : null}
          </div>
        </div>

        {/* The product, drawn rather than photographed — see ProductShot. */}
        <ProductShot t={t} />
      </section>

      {/* ── What you will learn ──────────────────────────────────────────── */}
      {/* Not inside `.shell`: a marquee that begins and ends at the column's
          edges reads as a broken loop. The heading keeps the gutters. */}
      <section className="py-12">
        <p className="shell kicker mb-6 text-center">{t.marketing.tech.title}</p>
        <TechMarquee />
      </section>

      {/* ── The four things you can go and build ─────────────────────────── */}
      <section className="shell divide-y divide-line">
        {t.marketing.tracks.items.map((item, index) => (
          <FeatureRow
            key={item.title}
            label={`0${index + 1}`}
            title={item.title}
            body={item.body}
            visual={visuals[index]}
            flip={index % 2 === 1}
          />
        ))}
      </section>

      {/* ── Courses ──────────────────────────────────────────────────────── */}
      <section className="shell py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl leading-[1.1] sm:text-[32px]">
              {t.marketing.courses.title}
            </h2>
            <p className="mt-1.5 text-[15px] text-ink-3">{t.marketing.courses.note}</p>
          </div>
          <Link
            href={coursesPath(locale)}
            className="shrink-0 text-[13px] text-ink-3 transition-colors hover:text-ink"
          >
            {t.actions.seeAll} →
          </Link>
        </div>

        {courses.length === 0 ? (
          <Empty title={t.learn.catalogue.empty} body={t.states.errorHelp} />
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {courses.slice(0, 6).map((course, index) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  locale={locale}
                  t={t}
                  /* Only the first cover is the LCP candidate; priority on all
                     of them would make every one urgent, which is none. */
                  priority={index === 0}
                />
              ))}
            </div>

            <dl className="mt-12 flex flex-wrap justify-center gap-x-14 gap-y-6 border-t border-line pt-10">
              {[
                { value: groupDigits(courses.length), label: t.marketing.stats.courses },
                { value: groupDigits(lessons), label: t.marketing.stats.lessons },
                { value: formatDuration(minutes, locale), label: t.marketing.stats.hours },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <dt className="sr-only">{stat.label}</dt>
                  <dd className="font-display text-[28px] tabular">{stat.value}</dd>
                  <p className="mt-0.5 text-[13px] text-ink-3">{stat.label}</p>
                </div>
              ))}
            </dl>
          </>
        )}
      </section>

      {/* ── Sign-up call, to somebody who is not signed in ───────────────── */}
      {viewer ? null : (
        <section className="shell pb-8">
          <div className="panel-raised flex flex-col items-start gap-4 p-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-xl">{t.marketing.cta.title}</h2>
              <p className="mt-1 text-[14px] text-ink-3">{t.marketing.cta.body}</p>
            </div>
            <div className="flex gap-2">
              <Link href={`/${locale}/sign-up`} className={buttonClass("primary", "md")}>
                {t.marketing.cta.action}
              </Link>
              <Link href={signInPath(locale)} className={buttonClass("ghost", "md")}>
                {t.nav.signIn}
              </Link>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
