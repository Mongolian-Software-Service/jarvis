import Image from "next/image";
import Link from "next/link";
import { ArrowRight, LifeBuoy } from "lucide-react";
import { accountPath, fmt, type Locale, type Strings } from "@jarvis/core";
import { buttonClass } from "@/components/ui/button";
import { BundleButton } from "@/components/course/bundle-button";
import type { TrailStep } from "@/components/app/course-trail";

/**
 * The greeting, and the one button that puts this student back to work.
 *
 * Three buttons, because there are three situations: a course in progress
 * («Үргэлжлүүлэх»), one open and not begun («Эхлэх»), and nothing open at all.
 * The last is somebody who signed up and has not paid, and the honest next step
 * for them is the bundle — so it is the bundle's own button, which starts the
 * checkout, rather than a link that promises a start and lands on a padlock.
 *
 * It read «Үнэгүй эхлэх» to everybody for as long as the intro was free, and
 * went on reading it after nothing was (§1).
 */
export function HelloWelcome({
  locale,
  t,
  firstName,
  next,
  nextHref,
  locked,
}: {
  locale: Locale;
  t: Strings;
  firstName: string | undefined;
  next: TrailStep | undefined;
  nextHref: string;
  /** Nothing on the trail is open to them: no course bought, none free. */
  locked: boolean;
}) {
  return (
    <section className="grid items-center gap-8 lg:grid-cols-[1fr_minmax(0,30rem)] lg:gap-12">
      <div>
        <h1 className="font-display text-[30px] leading-[1.1] sm:text-[40px] lg:text-[46px]">
          {firstName ? fmt(t.learn.overview.greeting, { name: firstName }) : t.guide.title}
        </h1>
        <p className="text-ink-3 mt-3 text-[15px] sm:text-[17px]">{t.guide.deck}</p>

        <p className="measure text-ink-2 mt-6 text-[15px] leading-[1.75]">{t.guide.thanks.body}</p>

        <div className="mt-7 flex flex-wrap items-start gap-3">
          {locked ? (
            <BundleButton
              locale={locale}
              owned={false}
              signedIn
              labels={{
                buy: t.learn.bundle.buy,
                buying: t.learn.bundle.buying,
                owned: t.learn.bundle.owned,
                signIn: t.learn.bundle.signIn,
                error: t.states.error,
              }}
            />
          ) : (
            <Link href={nextHref} className={buttonClass("primary", "lg")}>
              {next?.percent
                ? t.learn.course.continue
                : next
                  ? t.guide.trail.start
                  : t.learn.catalogue.title}
              <ArrowRight className="size-4" />
            </Link>
          )}
          <Link href={accountPath(locale, "/help")} className={buttonClass("secondary", "lg")}>
            <LifeBuoy className="size-4" />
            {t.nav.tab.contact}
          </Link>
        </div>
      </div>

      {/*
       * The next course, as a picture.
       *
       * The same cover that is on its card in the catalogue and on its node
       * in the map below, so the three read as one thing. It is the one image
       * on this page that has to be big: it is what the primary button opens.
       */}
      {next ? (
        <Link
          href={nextHref}
          className="group border-line bg-panel-2 relative block aspect-[4/3] overflow-hidden rounded-xl border sm:aspect-[16/10]"
        >
          {next.coverUrl ? (
            <Image
              src={next.coverUrl}
              alt=""
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 30rem"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : null}
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background: "linear-gradient(180deg, rgba(8,9,10,.1) 30%, rgba(8,9,10,.92))",
            }}
          />
          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
            <p className="kicker text-accent">{t.guide.trail.here}</p>
            <p className="font-display mt-1 text-[19px] leading-[1.2] sm:text-[22px]">
              {next.title}
            </p>
            <p className="text-ink-2 mt-1.5 text-[13px]">
              {fmt(t.learn.course.lessonsCount, { count: next.lessonCount })}
              {next.percent > 0
                ? ` · ${fmt(t.learn.course.progress, { percent: next.percent })}`
                : ""}
            </p>
          </div>
        </Link>
      ) : null}
    </section>
  );
}
