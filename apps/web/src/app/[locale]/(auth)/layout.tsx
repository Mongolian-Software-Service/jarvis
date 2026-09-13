import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import { SITE_NAME, homePath } from "@jarvis/core";
import { getIntl } from "@/lib/locale";
import { Logo } from "@/components/layout/logo";

/**
 * The auth shell: a branded half, and the form.
 *
 * Nothing to click but the form — a header full of links on a sign-in page is
 * an invitation to wander off halfway through the one thing the screen exists
 * for. The left half is not decoration: it says what signing up leads to, in
 * three steps, so the fields on the right read as the first of them rather than
 * as a toll.
 *
 * On a phone the panel is gone entirely. Half a screen of atmosphere above a
 * form is half a screen of scrolling before anybody can type — and `sizes`
 * below tells the optimiser so, or a phone downloads a picture it never shows.
 */
export default async function AuthLayout({ children }: LayoutProps<"/[locale]">) {
  const { locale, t } = await getIntl();
  const steps = [t.auth.aside.stepAccount, t.auth.aside.stepProfile, t.auth.aside.stepStart];

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-2">
      {/*
       * The content sits at the *bottom* of this panel rather than its middle,
       * and that is what makes a photograph usable behind type. Centred, the
       * words land on the brightest part of the picture and every fix from
       * there is a heavier veil — until the image is a grey texture and there
       * was no reason to have it. Anchored low, the globe keeps the top two
       * thirds at full strength and the type sits on near-solid ground. The
       * crop is biased above centre for the same reason: the globe's mass
       * rides up, clear of the ground the words need.
       */}
      <aside className="relative hidden overflow-hidden p-10 lg:flex lg:flex-col lg:justify-end xl:p-14">
        <Image
          src="/auth-globe.jpg"
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 1px"
          className="object-cover object-[50%_38%]"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background: [
              // Ground for the type. Nothing above 30% is touched.
              "linear-gradient(180deg, rgba(8,9,10,0) 30%, rgba(8,9,10,.86) 66%, rgba(8,9,10,.97) 100%)",
              // The seam. Without this the photograph stops at a hard edge
              // against the form's near-black column.
              "linear-gradient(90deg, rgba(8,9,10,0) 80%, rgba(8,9,10,.9) 100%)",
              // One violet wash. The accent is the only colour this product
              // spends (§4), and it is what keeps a teal photograph ours.
              "radial-gradient(36rem 30rem at 52% 30%, rgba(123,131,235,.24), transparent 70%)",
              // A little off the whole thing, so the globe sits behind the
              // page rather than on top of it.
              "linear-gradient(rgba(8,9,10,.22), rgba(8,9,10,.22))",
            ].join(","),
          }}
        />

        <div className="relative w-full max-w-md">
          <div className="mb-8">
            <Link href={homePath(locale)} aria-label={SITE_NAME}>
              <Logo />
            </Link>
          </div>

          <h2 className="font-display text-[30px] leading-[1.1]">{t.auth.aside.title}</h2>
          <p className="text-ink-2 mt-3 text-[14px] leading-relaxed">{t.auth.aside.deck}</p>

          <ol className="mt-9 space-y-2.5">
            {steps.map((step, index) => (
              <li
                key={step}
                className={
                  index === 0
                    ? "border-line-strong flex items-center gap-3 rounded-xl border px-4 py-3 backdrop-blur-md"
                    : "border-line flex items-center gap-3 rounded-xl border px-4 py-3 backdrop-blur-md"
                }
                /*
                 * Glass, not a card: `bg-panel-2` is opaque and would punch
                 * three solid rectangles through the photograph. Translucent
                 * plus a blur reads as sitting on it.
                 */
                style={{ background: index === 0 ? "rgba(20,21,22,.72)" : "rgba(14,15,17,.55)" }}
              >
                <span
                  className={
                    index === 0
                      ? "bg-solid text-solid-ink grid size-6 shrink-0 place-items-center rounded-full text-[12px] font-semibold"
                      : "bg-panel-3 text-ink-3 grid size-6 shrink-0 place-items-center rounded-full text-[12px]"
                  }
                >
                  {index === 0 ? <Check className="size-3.5" aria-hidden="true" /> : index + 1}
                </span>
                <span
                  className={index === 0 ? "text-ink text-[13.5px]" : "text-ink-3 text-[13.5px]"}
                >
                  {step}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </aside>

      <main className="flex min-h-dvh flex-col justify-center px-5 py-12 sm:px-10">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 flex justify-center lg:hidden">
            <Link href={homePath(locale)} aria-label={SITE_NAME}>
              <Logo />
            </Link>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
