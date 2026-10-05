import {
  bundleOffer,
  fmt,
  formatMoney,
  type CourseDetail,
  type Locale,
  type Strings,
} from "@jarvis/core";
import { EnrollButton } from "@/components/course/enroll-button";

/**
 * What it costs, which for a paid course is not a fact about this course. It
 * is not sold on its own (§1), so the panel quotes the one price and the
 * button below buys all of it — saying so in small print underneath, where a
 * buyer who came looking for this course alone will read it before they click.
 *
 * The price, the struck number and the launch's last day are `bundleOffer()`,
 * the object checkout charges from — so this card and the invoice agree.
 * Its own file since that launch line took the course header to the cap.
 */
export function CourseOffer({
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
  const offer = bundleOffer();

  return (
    <div className="panel-raised space-y-4 p-5">
      {course.isFree ? (
        <div className="flex items-baseline justify-between">
          <span className="font-display text-ok text-[26px]">{t.learn.course.free}</span>
          {access ? <span className="text-ok text-xs">{t.learn.course.enrolled}</span> : null}
        </div>
      ) : (
        <div>
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-ink-3 text-[13px]">{t.learn.bundle.allCourses}</span>
            <span className="font-display tabular text-[26px]">
              {formatMoney(offer.price, locale)}
            </span>
          </div>
          {offer.was ? (
            <p className="text-ink-3 mt-1 text-right text-[13px]">
              <span className="line-through">{formatMoney(offer.was, locale)}</span>{" "}
              <span className="text-ok">
                {fmt(t.learn.bundle.save, { amount: formatMoney(offer.saving, locale) })}
              </span>
            </p>
          ) : null}
          {offer.until ? (
            <p className="text-ink-3 mt-1 text-right text-[13px]">
              {fmt(t.learn.bundle.launch, { date: offer.until })}
            </p>
          ) : null}
          {access ? (
            <p className="text-ok mt-1 text-right text-xs">{t.learn.course.enrolled}</p>
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
        <p className="text-ink-3 text-[12px] leading-relaxed">{t.learn.bundle.onlyTogether}</p>
      )}
    </div>
  );
}
