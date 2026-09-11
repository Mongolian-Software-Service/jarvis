import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * A feature, told as a row: a small label, one sentence of headline, a
 * paragraph, and something to look at beside it.
 *
 * Alternating sides, because four identical rows read as a list and a list
 * reads as a specification. The visual is a `ReactNode` rather than an image
 * path, so a row can hold a sketch built from the product's own components or
 * a real picture without this component knowing the difference.
 */
export function FeatureRow({
  label,
  title,
  body,
  visual,
  flip = false,
}: {
  label: string;
  title: string;
  body: string;
  visual: ReactNode;
  flip?: boolean;
}) {
  return (
    <div className="grid items-center gap-8 py-14 lg:grid-cols-2 lg:gap-16">
      <div className={cn("max-w-lg", flip && "lg:order-2")}>
        <p className="kicker text-accent">{label}</p>
        <h3 className="font-display mt-3 text-[26px] leading-[1.15] sm:text-[32px]">{title}</h3>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-3">{body}</p>
      </div>
      <div className={cn("min-w-0", flip && "lg:order-1")}>{visual}</div>
    </div>
  );
}
