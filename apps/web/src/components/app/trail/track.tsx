import Link from "next/link";
import type { Locale, Strings } from "@jarvis/core";
import { TRACK_NODE, href, type TrailStep } from "./geometry";
import { FinishLabel, FinishNode, TrailLabel, TrailNode } from "./node";

// ── The laptop's horizontal track ────────────────────────────────────────────

/**
 * One row, evenly spaced, with the road drawn straight through the middle of
 * the circles — above the titles, so nothing has to be routed around anything.
 *
 * The completed part of the road is solid and green; the rest is a hairline
 * dash. It is drawn from the first circle's centre to the last one's, which is
 * `50 / count` per cent in from each end whatever the count turns out to be.
 */
export function TrailTrack({ steps, locale, t }: { steps: TrailStep[]; locale: Locale; t: Strings }) {
  const total = steps.length + 1;
  const inset = 50 / total;
  const walked = steps.filter((step) => step.finished).length;
  const span = 100 - inset * 2;

  return (
    <div className="relative hidden pt-4 lg:block">
      <div
        aria-hidden="true"
        className="border-line-strong absolute border-t border-dashed"
        style={{ top: TRACK_NODE / 2 + 16, left: `${inset}%`, right: `${inset}%` }}
      />
      {walked > 0 ? (
        <div
          aria-hidden="true"
          className="absolute border-t-2"
          style={{
            top: TRACK_NODE / 2 + 15,
            left: `${inset}%`,
            width: `${(span * walked) / (total - 1)}%`,
            borderColor: "var(--ok)",
          }}
        />
      ) : null}

      <ol className="relative flex items-start">
        {steps.map((step, index) => (
          <li key={step.id} className="min-w-0 flex-1">
            <Link
              href={href(step, locale)}
              className="group flex flex-col items-center gap-3 px-2 text-center focus-visible:outline-none"
            >
              <TrailNode step={step} index={index} size={TRACK_NODE} />
              <TrailLabel step={step} index={index} t={t} />
            </Link>
          </li>
        ))}
        <li className="min-w-0 flex-1">
          <div className="flex flex-col items-center gap-3 px-2 text-center">
            <FinishNode size={TRACK_NODE} />
            <FinishLabel t={t} />
          </div>
        </li>
      </ol>
    </div>
  );
}
