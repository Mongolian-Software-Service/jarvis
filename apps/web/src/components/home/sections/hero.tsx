import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  bundleOffer,
  coursesPath,
  fmt,
  formatMoney,
  type Locale,
  type Strings,
} from "@jarvis/core";
import { buttonClass } from "@/components/ui/button";
import { ProductShot } from "@/components/home/product-shot";

/** The first screen: what this is, what it costs, and one way in. */
export function Hero({
  locale,
  t,
  free,
}: {
  locale: Locale;
  t: Strings;
  free: { slug: string } | undefined;
}) {
  const offer = bundleOffer();

  return (
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
            className="border-line bg-panel/60 text-ink-3 hover:border-line-strong hover:text-ink mb-6 inline-flex items-center gap-2 rounded-full border py-1 pr-3 pl-1 text-[13px] transition-colors"
          >
            <span className="bg-solid text-solid-ink rounded-full px-2 py-0.5 text-[11px] font-medium">
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
        <p className="text-ink-3 mx-auto mt-5 max-w-xl text-[15px]">{t.marketing.hero.deck}</p>

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

        {/*
         * The price, on the first screen.
         *
         * This file's own comment promised "what it costs" while the screen
         * said only «үнэгүй» — in the badge, in the second button, and again in
         * every card below reading «Багцад багтсан». A reader could reach the
         * bottom of the front page without meeting a number, and «багцад
         * багтсан» means nothing until they have.
         *
         * Every figure is `bundleOffer()`'s — the same object checkout charges
         * from. The struck number is the price the bundle goes to after the
         * launch, never an anchor (§1), and the strike, the saving and the
         * date leave together the morning the launch ends.
         */}
        <p className="mt-7 flex flex-wrap items-baseline justify-center gap-x-2.5 gap-y-1 text-[14px]">
          <span className="text-ink-3">{t.learn.bundle.allCourses}</span>
          <span className="font-display tabular text-[22px] leading-none">
            {formatMoney(offer.price, locale)}
          </span>
          {offer.was ? (
            <>
              <span className="tabular text-ink-3 line-through">
                {formatMoney(offer.was, locale)}
              </span>
              <span className="text-ok">
                {fmt(t.learn.bundle.save, { amount: formatMoney(offer.saving, locale) })}
              </span>
            </>
          ) : null}
        </p>
        {offer.until ? (
          <p className="text-ink-3 mt-1.5 text-[13px]">
            {fmt(t.learn.bundle.launch, { date: offer.until })}
          </p>
        ) : null}
      </div>

      {/* The product, drawn rather than photographed — see ProductShot. */}
      <ProductShot t={t} />
    </section>
  );
}
