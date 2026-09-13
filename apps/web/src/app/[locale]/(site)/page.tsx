import { redirect } from "next/navigation";
import { landingPath, signUpPath } from "@jarvis/core";
import { getIntl } from "@/lib/locale";
import { listCourses } from "@/lib/queries/courses";
import { getViewer } from "@/lib/queries/viewer";
import { Hero } from "@/components/home/sections/hero";
import { CourseGrid } from "@/components/home/sections/courses";
import Link from "next/link";
import { signInPath } from "@jarvis/core";
import { buttonClass } from "@/components/ui/button";
import { TechMarquee } from "@/components/home/tech-marquee";
import { FeatureRow } from "@/components/home/feature-row";
import { WebsiteVisual, MobileVisual, GameVisual, AiVisual } from "@/components/home/feature-visuals";

export default async function HomePage() {
  const { locale, t } = await getIntl();
  const [courses, viewer] = await Promise.all([listCourses(locale), getViewer()]);

  /*
   * A signed-in person does not need the sales page.
   *
   * This screen exists to explain the product to somebody deciding about it.
   * Once they have decided, landing back on it is a step backwards from
   * whatever they were actually doing — so they go to their own dashboard, or
   * to the console if they run the place.
   */
  if (viewer) redirect(landingPath(locale, viewer.role));

  const lessons = courses.reduce((sum, course) => sum + course.lessonCount, 0);
  const minutes = courses.reduce((sum, course) => sum + course.minutes, 0);
  const free = courses.find((course) => course.isFree);

  /* One per row, in the order the four tracks are written in `marketing`. */
  const visuals = [
    <WebsiteVisual key="website" t={t} />,
    <MobileVisual key="mobile" />,
    <GameVisual key="game" />,
    <AiVisual key="ai" t={t} />,
  ];

  return (
    <>
      <Hero locale={locale} t={t} free={free} />

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


      <CourseGrid courses={courses} locale={locale} t={t} lessons={lessons} minutes={minutes} />


      {/* ── Sign-up call, to somebody who is not signed in ───────────────── */}
      {viewer ? null : (
        <section className="shell pb-8">
          <div className="panel-raised flex flex-col items-start gap-4 p-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-xl">{t.marketing.cta.title}</h2>
              <p className="mt-1 text-[14px] text-ink-3">{t.marketing.cta.body}</p>
            </div>
            <div className="flex gap-2">
              <Link href={signUpPath(locale)} className={buttonClass("primary", "md")}>
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
