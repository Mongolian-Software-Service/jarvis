import Link from "next/link";
import type { Locale, Strings } from "@jarvis/core";
import {
  BOTTOM,
  COLUMN_NODE,
  DOTS,
  HALF,
  HANDLE_X,
  HANDLE_Y,
  ROW,
  TOP,
  across,
  bezier,
  href,
  nodeF,
  nodeY,
  type TrailStep,
} from "./geometry";
import { FinishLabel, FinishNode, TrailLabel, TrailNode } from "./node";

// ── The phone's winding column ───────────────────────────────────────────────

export function TrailColumn({ steps, locale, t }: { steps: TrailStep[]; locale: Locale; t: Strings }) {
  // The flag at the bottom is a step for the purpose of the drawing, and not
  // one for the purpose of the links — so it gets a row of its own here.
  const total = steps.length + 1;
  const height = TOP + (total - 1) * ROW + BOTTOM;

  return (
    <div
      className="relative [--swing:20%] sm:[--swing:27%] lg:hidden"
      style={{ height }}
      aria-hidden="false"
    >
      <Dots steps={steps} total={total} />

      {steps.map((step, index) => (
        <Link
          key={step.id}
          href={href(step, locale)}
          className="group absolute flex w-24 flex-col items-center gap-2.5 text-center focus-visible:outline-none sm:w-[10rem]"
          style={{
            left: across(nodeF(index)),
            top: nodeY(index),
            transform: `translate(-50%, -${HALF}px)`,
          }}
        >
          <TrailNode step={step} index={index} size={COLUMN_NODE} />
          <TrailLabel step={step} index={index} t={t} />
        </Link>
      ))}

      <div
        className="absolute flex w-[8.5rem] flex-col items-center gap-2.5 text-center sm:w-[11rem]"
        style={{
          left: across(nodeF(steps.length)),
          top: nodeY(steps.length),
          transform: `translate(-50%, -${HALF}px)`,
        }}
      >
        <FinishNode size={COLUMN_NODE} />
        <FinishLabel t={t} />
      </div>
    </div>
  );
}

/** The dotted road between one node and the next. */
export function Dots({ steps, total }: { steps: TrailStep[]; total: number }) {
  const dots: { key: string; x: string; y: number; colour: string }[] = [];

  for (let gap = 0; gap < total - 1; gap++) {
    const f0 = nodeF(gap);
    const f1 = nodeF(gap + 1);
    const y0 = nodeY(gap);
    const y1 = nodeY(gap + 1);
    const reach = (f1 - f0) * HANDLE_X;

    /* Walked already, so it is drawn as walked: the road behind a finished
       course is green, the road ahead of it is not. */
    const colour = steps[gap]?.finished ? "var(--ok)" : "var(--line-strong)";

    for (let n = 1; n <= DOTS; n++) {
      const t = n / (DOTS + 1);
      dots.push({
        key: `${gap}-${n}`,
        x: across(bezier(f0, f1, f0 + reach, f1 - reach, t)),
        y: bezier(y0, y1, y0 + ROW * HANDLE_Y, y1 - ROW * HANDLE_Y, t),
        colour,
      });
    }
  }

  return (
    <div aria-hidden="true">
      {dots.map((dot) => (
        <span
          key={dot.key}
          className="absolute size-[5px] rounded-full"
          style={{
            left: dot.x,
            top: dot.y,
            transform: "translate(-50%, -50%)",
            background: dot.colour,
          }}
        />
      ))}
    </div>
  );
}
