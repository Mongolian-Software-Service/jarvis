import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { landingPath, signUpPath } from "@jarvis/core";
import { getIntl } from "@/lib/locale";
import { listCourses } from "@/lib/queries/courses";
import { getViewer } from "@/lib/queries/viewer";
import { pageMetadata } from "@/lib/seo";
import { Hero } from "@/components/home/sections/hero";
import { BundlePanel } from "@/components/course/bundle-panel";
import Link from "next/link";
import { signInPath } from "@jarvis/core";
import { buttonClass } from "@/components/ui/button";
import { TechMarquee } from "@/components/home/tech-marquee";
import { FeatureRow } from "@/components/home/feature-row";
import {
  WebsiteVisual,
  MobileVisual,
  GameVisual,
  MeetVisual,
} from "@/components/home/feature-visuals";

/**
 * The front page had no metadata at all, and so no Open Graph tags.
 *
 * Every other page calls `pageMetadata`; this one — the URL anybody actually
 * shares — was the exception, so a link to the school posted in Messenger or
 * Facebook unfurled as a bare grey box. `metadataBase` is set in the root
 * layout, so a site-relative image resolves to an absolute URL on its own.
 */
export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getIntl();
  return pageMetadata({
    locale,
    title: t.marketing.hero.title,
    description: t.marketing.hero.deck,
    path: "/",
    image: "/auth-globe.jpg",
  });
}

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

  const free = courses.find((course) => course.isFree);

  /* One per row, in the order the four rows are written in `marketing`. */
  const visuals = [
    <WebsiteVisual key="website" t={t} />,
    <MobileVisual key="mobile" />,
    <GameVisual key="game" />,
    <MeetVisual key="meet" t={t} />,
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

      {/* ── Three things you can go and build, and who helps you build them ─ */}
      <section className="shell divide-line divide-y">
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

      {/* ── The offer, once the case has been made ────────────────────────────
          The same component the catalogue leads with, so the two pages cannot
          come to advertise different numbers — and it names every course in
          the bundle, which is why this page carries no grid of course cards.
          It did: five covers saying «Багцад багтсан» five times, the third
          telling of the same list after the rows above and this panel. The
          cards live in the catalogue, one tap away from the hero's button.

          `owned` and `signedIn` are both false and not a guess — line 48 sends
          anybody with a session to their own landing, so nobody signed in ever
          renders this. The button then offers sign-in, which is the right next
          step for a reader who has decided. */}
      <section className="shell pt-4 pb-8">
        <BundlePanel courses={courses} locale={locale} t={t} owned={false} signedIn={false} />
      </section>

      {/* ── Sign-up call ─────────────────────────────────────────────────────
          Not wrapped in a `viewer` test any more: it carried `{viewer ? null :}`
          for a while, below a redirect that makes `viewer` unreachable here —
          a condition that reads as though a signed-in visitor might see this
          page, which is exactly what line 48 exists to prevent. */}
      <section className="shell pb-8">
        <div className="panel-raised flex flex-col items-start gap-4 p-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-xl">{t.marketing.cta.title}</h2>
            <p className="text-ink-3 mt-1 text-[14px]">{t.marketing.cta.body}</p>
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
    </>
  );
}
