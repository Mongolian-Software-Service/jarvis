import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * The dashboard's whole chart vocabulary, built out of divs.
 *
 * No charting dependency, on purpose: every mark here is a rectangle, and an
 * HTML rectangle reflows with its panel while its labels stay at their real
 * size — which an SVG chart does not. It also keeps the "no unused
 * dependencies" line in the ship checklist true.
 *
 * One set of rules, so the marks read as a system: bars grow from a single
 * baseline, touching marks are separated by a 2px gap **in the surface colour**
 * rather than by a stroke, and every chart carries a screen-reader table —
 * colour is never the only carrier of a value.
 */

export function StatTile({
  label,
  value,
  note,
  tone = "ink",
}: {
  label: string;
  value: string;
  note?: string;
  tone?: "ink" | "ok" | "warn" | "accent";
}) {
  return (
    <div className="panel p-5">
      <p className="kicker">{label}</p>
      <p
        className={cn(
          "font-display mt-2 text-[26px] tabular",
          tone === "ok" && "text-ok",
          tone === "warn" && "text-warn",
          tone === "accent" && "text-accent",
        )}
      >
        {value}
      </p>
      {note ? <p className="mt-1 text-xs text-ink-3">{note}</p> : null}
    </div>
  );
}

export function Panel({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="panel p-5">
      <header className="mb-4 flex items-center justify-between gap-4">
        <h2 className="font-display text-[13px] font-semibold">{title}</h2>
        {action}
      </header>
      {children}
    </section>
  );
}
