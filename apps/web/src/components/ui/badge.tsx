import type { CSSProperties, ReactNode } from "react";
import { topicTint, type TopicTint } from "@jarvis/core";
import { cn } from "@/lib/cn";

const BASE = "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium";

export type BadgeTone = "neutral" | "accent" | "ok" | "warn" | "bad";

const TONES: Record<BadgeTone, string> = {
  neutral: "bg-panel-2 text-ink-3 border border-line",
  accent: "bg-accent-soft text-accent border border-accent/25",
  ok: "bg-ok-soft text-ok border border-ok/25",
  warn: "bg-warn-soft text-warn border border-warn/25",
  bad: "bg-bad-soft text-bad border border-bad/25",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
}) {
  return <span className={cn(BASE, TONES[tone], className)}>{children}</span>;
}

/**
 * The topic chip.
 *
 * Its two colours arrive as inline custom properties rather than as classes,
 * because the tint is chosen at runtime — a hash of the topic, so a tag nobody
 * has entered yet still gets a stable colour. The variables it reads are
 * declared in `:root`, not in `@theme`: Tailwind drops a theme variable that no
 * emitted rule mentions, and an inline style is invisible to the class scanner.
 */
export function TopicChip({ topic, label }: { topic: string; label: string }) {
  const tint: TopicTint = topicTint(topic);
  const style = {
    background: `var(--tint-${tint})`,
    color: `var(--tint-${tint}-ink)`,
  } as CSSProperties;
  return (
    <span className={cn(BASE, "border border-transparent")} style={style}>
      {label}
    </span>
  );
}
