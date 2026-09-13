import Image from "next/image";
import { Check, Flag, Lock } from "lucide-react";
import { fmt, type Strings } from "@jarvis/core";
import { cn } from "@/lib/cn";
import type { TrailStep } from "./geometry";

/**
 * One node, every state — locked, open, in progress, finished — and the label
 * beside it. Both layouts draw this, which is what keeps them from drifting.
 */

// ── The node, in every state ─────────────────────────────────────────────────

/**
 * The circle: the course's own cover, ringed by its progress.
 *
 * A numbered disc says which step; a picture says which *course* — and the same
 * picture is on the card in the catalogue, so the two read as the same thing. A
 * locked course is greyed rather than hidden: seeing what you have not bought
 * yet is the point of a map.
 */
export function TrailNode({ step, index, size }: { step: TrailStep; index: number; size: number }) {
  const ring = step.finished
    ? "var(--ok)"
    : step.current
      ? step.percent > 0
        ? `conic-gradient(var(--accent) ${step.percent}%, var(--line-strong) 0)`
        : "var(--accent)"
      : step.open
        ? `conic-gradient(var(--ok) ${step.percent}%, var(--line-strong) 0)`
        : "var(--line)";

  return (
    <span
      className="relative shrink-0 rounded-full p-[3px] transition-transform duration-200 group-hover:scale-[1.04]"
      style={{
        width: size,
        height: size,
        background: ring,
        boxShadow: step.current ? "0 0 0 7px var(--accent-soft)" : undefined,
      }}
    >
      <span className="bg-panel-2 group-focus-visible:ring-accent relative block size-full overflow-hidden rounded-full group-focus-visible:ring-2">
        {step.coverUrl ? (
          <Image
            src={step.coverUrl}
            alt=""
            fill
            sizes="96px"
            className={cn(
              "object-cover transition-opacity",
              step.open ? "opacity-90" : "opacity-30 grayscale",
            )}
          />
        ) : null}

        {/* A wash under the badge, so a number stays readable over any photo. */}
        <span
          aria-hidden="true"
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, rgba(8,9,10,.15), rgba(8,9,10,.65))" }}
        />

        <span className="absolute inset-0 grid place-items-center">
          {step.finished ? (
            <Check className="text-ok size-8 drop-shadow" aria-hidden="true" />
          ) : step.open ? (
            <span className="font-display text-ink tabular text-[22px] drop-shadow">
              {index + 1}
            </span>
          ) : (
            <Lock className="text-ink-2 size-6" aria-hidden="true" />
          )}
        </span>
      </span>
    </span>
  );
}

export function TrailLabel({ step, index, t }: { step: TrailStep; index: number; t: Strings }) {
  const state = step.finished
    ? t.guide.trail.done
    : step.current
      ? t.guide.trail.here
      : step.open
        ? fmt(t.learn.course.lessonsCount, { count: step.lessonCount })
        : t.guide.trail.locked;

  return (
    <span className="flex min-w-0 flex-col gap-0.5">
      <span className="kicker">{fmt(t.guide.trail.step, { n: index + 1 })}</span>
      <span className="text-ink group-hover:text-accent text-[12.5px] leading-[1.35] font-medium sm:text-[13px]">
        {step.title}
      </span>
      <span
        className="text-[11px] leading-[1.4]"
        style={{
          color: step.finished ? "var(--ok)" : step.current ? "var(--accent)" : "var(--ink-3)",
        }}
      >
        {state}
      </span>
    </span>
  );
}

/** The end of the road. Not a link — there is nothing past it to open. */
export function FinishNode({ size }: { size: number }) {
  return (
    <span
      className="border-line-strong grid shrink-0 place-items-center rounded-full border border-dashed"
      style={{ width: size, height: size, background: "var(--panel)" }}
    >
      <Flag className="text-ink-3 size-7" aria-hidden="true" />
    </span>
  );
}

export function FinishLabel({ t }: { t: Strings }) {
  return (
    <span className="flex flex-col gap-0.5">
      <span className="text-ink text-[12.5px] leading-[1.35] font-medium sm:text-[13px]">
        {t.guide.trail.finish}
      </span>
      <span className="text-ink-3 text-[11px] leading-[1.4]">{t.guide.trail.finishBody}</span>
    </span>
  );
}
