/**
 * The road through the school, drawn as a map.
 *
 * A numbered list would say the same thing and nobody would read it. This is
 * the shape a game uses for exactly this job — here is where you are, here is
 * what is next, here is how far it goes — and it answers the new student's real
 * question ("what do I do now?") in one glance.
 *
 * **Two layouts, one node.** A phone gets the winding column it had; a laptop
 * gets a single horizontal track, because a 1,250px-wide page carrying a 400px
 * ribbon of dots down the middle is mostly empty screen. Only the geometry
 * differs — `TrailNode` draws every state for both, so the two cannot drift
 * apart. Both are rendered and CSS picks; `display: none` takes the other out
 * of the accessibility tree, so a reader is never offered the same link twice.
 *
 * **The geometry is arithmetic, not measurement.** Nodes sit at a percentage
 * across and a fixed number of pixels down, so the map lays out identically on
 * the server and in the browser, needs no JavaScript, and cannot jump on
 * hydration.
 */

import type { Locale, Strings } from "@jarvis/core";
import { TrailColumn } from "./trail/column";
import { TrailTrack } from "./trail/track";

export type { TrailStep } from "./trail/geometry";
import type { TrailStep } from "./trail/geometry";

// ── The section ──────────────────────────────────────────────────────────────

export function CourseTrail({
  steps,
  locale,
  t,
}: {
  steps: TrailStep[];
  locale: Locale;
  t: Strings;
}) {
  if (steps.length === 0) return null;

  return (
    <section className="panel-raised relative overflow-hidden p-5 sm:p-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(48rem 18rem at 50% -20%, var(--accent-soft), transparent 70%)",
        }}
      />

      <header className="relative mb-2">
        <h2 className="font-display text-[20px] leading-[1.2] sm:text-[24px]">
          {t.guide.trail.title}
        </h2>
        <p className="text-ink-3 mt-1.5 text-[13px] sm:text-[15px]">{t.guide.trail.deck}</p>
      </header>

      <TrailColumn steps={steps} locale={locale} t={t} />
      <TrailTrack steps={steps} locale={locale} t={t} />
    </section>
  );
}
