import { Check } from "lucide-react";
import {
  BUNDLE_FULL_PRICE_MNT,
  BUNDLE_PRICE_MNT,
  BUNDLE_SAVING_MNT,
  fmt,
  formatDuration,
  formatMoney,
  groupDigits,
  type CourseCard,
  type Locale,
  type Strings,
} from "@jarvis/core";
import { BundleButton } from "./bundle-button";

/**
 * The offer, at the top of the catalogue — and the only price on the page.
 *
 * Six courses at six prices is a set of decisions somebody has to make before
 * they have any way of making them. One price for all of it is one decision —
 * so that is what the page leads with, and the cards below say "in the bundle"
 * rather than each naming a number of its own.
 *
 * Every figure here is counted or derived: the courses, lessons and hours come
 * from the rows being listed, and the saving is `BUNDLE_SAVING_MNT`. Nothing
 * in this panel is a number somebody has to remember to update.
 */
export function BundlePanel({
  courses,
  locale,
  t,
  owned,
  signedIn,
}: {
  courses: CourseCard[];
  locale: Locale;
  t: Strings;
  owned: boolean;
  signedIn: boolean;
}) {
  const lessons = courses.reduce((sum, course) => sum + course.lessonCount, 0);
  const minutes = courses.reduce((sum, course) => sum + course.minutes, 0);

  return (
    <section className="panel-raised relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(40rem 16rem at 85% -20%, var(--accent-soft), transparent 70%)",
        }}
      />

      <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="max-w-xl">
          <h2 className="font-display text-[26px] leading-[1.1] sm:text-[32px]">
            {t.learn.bundle.title}
          </h2>
          <p className="mt-3 text-[15px] text-ink-3">
            {fmt(t.learn.bundle.deck, {
              courses: groupDigits(courses.length),
              lessons: groupDigits(lessons),
              hours: formatDuration(minutes, locale),
            })}
          </p>

          <ul className="mt-5 grid gap-2 sm:grid-cols-2">
            {courses.map((course) => (
              <li key={course.id} className="flex items-start gap-2 text-[13px] text-ink-2">
                <Check className="mt-0.5 size-3.5 shrink-0 text-ok" />
                <span className="min-w-0">{course.title}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col items-start gap-3 lg:items-end lg:text-right">
          <div>
            <p className="font-display text-[34px] leading-none tabular">
              {formatMoney(BUNDLE_PRICE_MNT, locale)}
            </p>
            {BUNDLE_SAVING_MNT > 0 ? (
              <p className="mt-2 text-[13px] text-ink-3">
                <span className="line-through">{formatMoney(BUNDLE_FULL_PRICE_MNT, locale)}</span>{" "}
                <span className="text-ok">
                  {fmt(t.learn.bundle.save, { amount: formatMoney(BUNDLE_SAVING_MNT, locale) })}
                </span>
              </p>
            ) : null}
          </div>

          <BundleButton
            locale={locale}
            owned={owned}
            signedIn={signedIn}
            labels={{
              buy: t.learn.bundle.buy,
              buying: t.learn.bundle.buying,
              owned: t.learn.bundle.owned,
              signIn: t.learn.bundle.signIn,
              error: t.states.error,
            }}
          />
        </div>
      </div>
    </section>
  );
}
