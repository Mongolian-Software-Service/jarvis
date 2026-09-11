import Image from "next/image";
import { Bell, Check, Sparkles } from "lucide-react";
import type { Strings } from "@jarvis/core";
import { cn } from "@/lib/cn";
import gameShot from "@/assets/game-controller.jpg";

/**
 * The pictures beside the four rows on the front page.
 *
 * Three of the four are drawn rather than photographed — a small honest sketch
 * of what that track ends in. Drawn so they cannot go stale behind a redesign,
 * and so the page costs no image bytes.
 *
 * The games row is the exception and carries a real picture. It is the one
 * track whose appeal is the *look* of the thing, and a hairline sketch of a
 * game undersells it. It sits well below the fold, it is never `priority`, and
 * `sizes` keeps a phone off the desktop-sized variant — so it stays out of the
 * LCP measurement the ship checklist cares about (CLAUDE.md §7).
 *
 * The mock content is deliberately language-neutral wherever it can be — bars,
 * URLs, numerals, `iOS`, `2D` — so the same sketch reads correctly in both
 * editions. The few words that cannot be avoided come from
 * `marketing.tracks.demo`, which exists for exactly this and is translated.
 */

function Frame({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-lg border border-line bg-panel", className)}>
      {children}
    </div>
  );
}

/** A bar standing in for a line of text nobody is meant to read. */
function Bar({ className }: { className?: string }) {
  return <span className={cn("block rounded-full bg-panel-3", className)} />;
}

/** A finished site, in the browser, with its own address. */
export function WebsiteVisual({ t }: { t: Strings }) {
  return (
    <Frame>
      <div className="flex items-center gap-2 border-b border-line px-3 py-2">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="size-2 rounded-full bg-panel-3" />
          <span className="size-2 rounded-full bg-panel-3" />
          <span className="size-2 rounded-full bg-panel-3" />
        </span>
        <span className="ml-1 flex-1 truncate rounded-full bg-panel-2 px-2.5 py-1 font-mono text-[10px] text-ink-3">
          ganbat.mn
        </span>
      </div>

      <div className="relative overflow-hidden p-4">
        {/* The same single soft source the real hero uses, one size down. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 -top-8 h-20"
          style={{
            background: "radial-gradient(16rem 5rem at 50% 100%, var(--accent-soft), transparent 70%)",
          }}
        />

        <div className="relative flex items-center gap-2">
          <span className="size-4 shrink-0 rounded bg-solid" aria-hidden="true" />
          <Bar className="h-1.5 w-8" />
          <Bar className="h-1.5 w-10" />
          <span className="ml-auto shrink-0 rounded-full bg-solid px-2 py-0.5 text-[9px] font-medium text-solid-ink">
            {t.nav.contact}
          </span>
        </div>

        <div className="relative mt-5 space-y-2">
          <Bar className="h-2.5 w-3/4 bg-ink-3/45" />
          <Bar className="h-2.5 w-1/2 bg-ink-3/25" />
        </div>

        <div className="relative mt-4 grid grid-cols-3 gap-2">
          {[0, 1, 2].map((slot) => (
            <div key={slot} className="h-12 rounded-md border border-line bg-panel-2" />
          ))}
        </div>
      </div>
    </Frame>
  );
}

/**
 * One app, both handsets.
 *
 * The two are meant to be told apart at a glance, so each carries the thing
 * that actually identifies it: the iPhone its Dynamic Island, its big corner
 * radius and the home indicator; the Samsung a centred punch-hole, squarer
 * corners and the three-button navigation many of them still run.
 *
 * Hardware cut-outs are drawn *lighter* than the screen rather than black.
 * On a real phone the island is black on a bright screen; on this near-black
 * ground black-on-black is nothing at all, so the camera glass catches a little
 * light instead — which is what a photograph of one looks like anyway.
 */
export function MobileVisual() {
  return (
    <div className="flex justify-center gap-4 sm:gap-5">
      <Phone platform="ios" />
      <Phone platform="android" />
    </div>
  );
}

function Phone({ platform }: { platform: "ios" | "android" }) {
  const ios = platform === "ios";

  return (
    <div className="w-full max-w-[148px] min-w-0 sm:max-w-[168px]">
      <div
        className={cn(
          "relative border border-line-strong bg-panel-2 p-[5px] shadow-card",
          ios ? "rounded-[30px]" : "rounded-[20px]",
        )}
      >
        {/* The volume rocker and the power key, on the edge each one uses. */}
        <span
          aria-hidden="true"
          className={cn(
            "absolute w-[2px] rounded-full bg-line-strong",
            ios ? "-left-px top-[20%] h-7" : "-right-px top-[24%] h-6",
          )}
        />

        <div
          className={cn(
            /*
             * No `aspect-ratio` here, deliberately. The screen's contents are a
             * fixed number of pixels tall at every size, so an aspect box that
             * is narrower than 156px comes out shorter than what is inside it
             * and silently crops the tab bar — which is what happened at 360.
             * The height comes from the content and the *width* is chosen so
             * the result lands near a real handset: 2.3 at 360, 2.1 above it.
             */
            "relative flex flex-col overflow-hidden bg-bg",
            ios ? "rounded-[25px]" : "rounded-[16px]",
          )}
        >
          <StatusBar ios={ios} />
          <AppScreen />
          <NavBar ios={ios} />
        </div>
      </div>

      <p className="mt-2.5 text-center font-mono text-[10px] text-ink-3">
        {ios ? "iPhone" : "Samsung"}
      </p>
    </div>
  );
}

/** The row every phone screen starts with — and where the cut-out sits. */
function StatusBar({ ios }: { ios: boolean }) {
  return (
    <div className="relative flex items-center justify-between px-2.5 pt-2 pb-1.5">
      <span className="tabular text-[7px] font-medium text-ink-3">9:41</span>

      <span
        aria-hidden="true"
        className={cn(
          "absolute left-1/2 -translate-x-1/2 rounded-full bg-panel-2",
          ios ? "top-[5px] h-[9px] w-[34px]" : "top-[6px] size-[6px]",
        )}
      />

      <span className="flex items-end gap-[3px]" aria-hidden="true">
        <span className="flex items-end gap-[1.5px]">
          <span className="h-[3px] w-[1.5px] rounded-[1px] bg-ink-3" />
          <span className="h-[4.5px] w-[1.5px] rounded-[1px] bg-ink-3" />
          <span className="h-[6px] w-[1.5px] rounded-[1px] bg-ink-3" />
        </span>
        <span className="h-[6px] w-[10px] rounded-[2px] border border-line-strong p-[1px]">
          <span className="block h-full w-2/3 rounded-[1px] bg-ink-3" />
        </span>
      </span>
    </div>
  );
}

/**
 * What the app itself shows: the lesson you are in the middle of, and the
 * courses under it. This is `apps/mobile`'s own catalogue screen, sketched —
 * the phone in the picture is a product that exists (CLAUDE.md §9).
 */
function AppScreen() {
  return (
    <div className="flex flex-1 flex-col px-2.5 pb-2">
      <div className="flex items-center gap-1.5">
        <Bar className="h-2 w-12 bg-ink-3/45" />
        <Bell className="ml-auto size-3 text-ink-3" aria-hidden="true" />
      </div>

      {/* The one you are part way through, given the room that says so. */}
      <div className="mt-2.5 overflow-hidden rounded-lg border border-line bg-panel">
        <div className="grid h-12 place-items-center bg-accent-soft">
          <span className="grid size-5 place-items-center rounded-full bg-bg/60">
            <svg viewBox="0 0 10 10" className="size-2 fill-ink" aria-hidden="true">
              <path d="M3 2l5 3-5 3z" />
            </svg>
          </span>
        </div>
        <div className="space-y-[5px] p-2">
          <Bar className="h-1.5 w-4/5" />
          <ProgressLine percent={70} />
        </div>
      </div>

      <Bar className="mt-3 h-1.5 w-8 bg-ink-3/35" />

      <ul className="mt-2 space-y-2.5">
        {[40, 15, 0, 0].map((percent, row) => (
          <li key={row} className="flex items-center gap-2">
            <span aria-hidden="true" className="size-6 shrink-0 rounded-md bg-panel-2" />
            <span className="min-w-0 flex-1 space-y-[5px]">
              <Bar className="h-1.5 w-full" />
              <ProgressLine percent={percent} />
            </span>
          </li>
        ))}
      </ul>

      {/*
       * The app's own tabs, held to the bottom of the handset.
       * `mt-auto` rather than a spacer element: the leftover height belongs to
       * the gap above the bar, which is where a real tab bar puts it.
       */}
      <div className="mt-auto flex items-end justify-around border-t border-line pt-1.5">
        {[0, 1, 2].map((tab) => (
          <span key={tab} className="flex flex-col items-center gap-[3px]" aria-hidden="true">
            <span
              className={cn(
                "size-[9px] rounded-[2px]",
                tab === 0 ? "bg-accent" : "bg-panel-3",
              )}
            />
            <span
              className={cn(
                "h-[2px] w-3 rounded-full",
                tab === 0 ? "bg-accent" : "bg-panel-3",
              )}
            />
          </span>
        ))}
      </div>
    </div>
  );
}

function ProgressLine({ percent }: { percent: number }) {
  return (
    <span className="block h-[3px] w-full overflow-hidden rounded-full bg-panel-2">
      <span className="block h-full rounded-full bg-accent" style={{ width: `${percent}%` }} />
    </span>
  );
}

/**
 * iOS leaves a home indicator; this Samsung runs the three keys.
 *
 * One fixed height for both, so the two handsets end at the same line and the
 * captions under them share a baseline. Left to their contents the key row is
 * six pixels taller than the indicator and the pair looks misaligned.
 */
function NavBar({ ios }: { ios: boolean }) {
  return (
    <div className="flex h-[22px] items-center justify-center gap-5" aria-hidden="true">
      {ios ? (
        <span className="h-[3px] w-[52px] max-w-[38%] rounded-full bg-panel-3" />
      ) : (
        <>
          <svg viewBox="0 0 10 10" className="size-[7px] fill-ink-3">
            <path d="M7.5 1 2 5l5.5 4z" />
          </svg>
          <span className="size-[7px] rounded-full border border-ink-3" />
          <span className="size-[6px] rounded-[1.5px] border border-ink-3" />
        </>
      )}
    </div>
  );
}

/**
 * What a finished game looks like, rather than a diagram of one.
 *
 * Statically imported rather than pointed at from `public/`: the import hands
 * Next the intrinsic size, so the box reserves its own height and the row does
 * not jump when the picture lands, and it generates the blur that stands in
 * while it loads. `alt` is empty on purpose — the heading and paragraph beside
 * it already say what it is, and the other three visuals are hidden from
 * assistive tech for the same reason.
 */
export function GameVisual() {
  return (
    <Frame>
      <Image
        src={gameShot}
        alt=""
        placeholder="blur"
        /* The visual column is half of a 78rem shell above `lg`, one column
           below it. Without this a phone downloads the 1677px variant. */
        sizes="(max-width: 1023px) 100vw, 560px"
        className="block h-auto w-full"
      />
    </Frame>
  );
}

/** One sentence in, three jobs done — and it costs nothing. */
export function AiVisual({ t }: { t: Strings }) {
  const demo = t.marketing.tracks.demo;

  return (
    <Frame className="p-4">
      <div className="flex items-start gap-2 rounded-md border border-line bg-panel-2 px-3 py-2">
        <Sparkles className="mt-0.5 size-3.5 shrink-0 text-accent" aria-hidden="true" />
        <p className="text-[12px] leading-relaxed text-ink-2">{demo.aiPrompt}</p>
      </div>

      <ol className="mt-3 space-y-2">
        {demo.aiSteps.map((step, index) => (
          <li key={step} className="flex items-center gap-2.5 text-[13px] text-ink-2">
            <span className="grid size-5 shrink-0 place-items-center rounded-full border border-line text-[10px] tabular text-ink-3">
              {index + 1}
            </span>
            <span className="min-w-0 flex-1 truncate">{step}</span>
            <Check className="size-3.5 shrink-0 text-ok" aria-hidden="true" />
          </li>
        ))}
      </ol>

      <p className="mt-3 border-t border-line pt-3">
        <span className="rounded-full bg-ok-soft px-2 py-0.5 text-[11px] font-medium text-ok">
          {demo.free}
        </span>
      </p>
    </Frame>
  );
}
