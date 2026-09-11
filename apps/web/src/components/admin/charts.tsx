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

/** Daily columns. The x axis is time, so an empty day is a zero, not a gap. */
export function DailyColumns({
  data,
  label,
  empty,
}: {
  data: { date: string; count: number }[];
  label: string;
  empty: string;
}) {
  const max = Math.max(1, ...data.map((row) => row.count));
  if (data.every((row) => row.count === 0)) {
    return <p className="py-8 text-center text-sm text-ink-3">{empty}</p>;
  }

  return (
    <figure>
      <div className="flex h-32 items-end gap-[2px]" aria-hidden="true">
        {data.map((row) => (
          <div
            key={row.date}
            title={`${row.date}: ${row.count}`}
            className="flex-1 rounded-t-[3px] bg-[var(--viz-1)] transition-[height]"
            style={{ height: `${Math.max(2, (row.count / max) * 100)}%` }}
          />
        ))}
      </div>
      <figcaption className="mt-2 flex justify-between text-[11px] text-ink-3 tabular">
        <span>{data[0]?.date.slice(5)}</span>
        <span>{data[data.length - 1]?.date.slice(5)}</span>
      </figcaption>

      <table className="sr-only">
        <caption>{label}</caption>
        <tbody>
          {data.map((row) => (
            <tr key={row.date}>
              <th scope="row">{row.date}</th>
              <td>{row.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

/** A ranked list with a bar behind each row — a bar chart that can hold labels. */
export function BarList({
  rows,
  empty,
}: {
  rows: { id: string; label: string; value: number }[];
  empty: string;
}) {
  const max = Math.max(1, ...rows.map((row) => row.value));
  if (rows.length === 0) return <p className="py-8 text-center text-sm text-ink-3">{empty}</p>;

  return (
    <ul className="space-y-2.5">
      {rows.map((row, index) => (
        <li key={row.id} className="space-y-1">
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate text-ink-2">{row.label}</span>
            <span className="shrink-0 font-medium tabular">{row.value}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-sm bg-panel-3">
            <div
              className="h-full rounded-sm"
              style={{
                width: `${(row.value / max) * 100}%`,
                background: `var(--viz-${(index % 5) + 1})`,
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

/**
 * One stacked bar with a labelled legend.
 *
 * The legend is not decoration: the `--viz-*` steps sit below 3:1 against each
 * other, and a reader who cannot separate two of them has nothing left, so the
 * colour is never the carrier — every segment names itself and its count beside
 * the bar.
 */
export function StackedBar({
  segments,
  empty,
}: {
  segments: { id: string; label: string; value: number; color: string }[];
  empty: string;
}) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  if (total === 0) return <p className="py-8 text-center text-sm text-ink-3">{empty}</p>;

  return (
    <div className="space-y-3">
      <div className="flex h-3 gap-[2px] overflow-hidden rounded-sm" aria-hidden="true">
        {segments
          .filter((segment) => segment.value > 0)
          .map((segment) => (
            <div
              key={segment.id}
              style={{ width: `${(segment.value / total) * 100}%`, background: segment.color }}
            />
          ))}
      </div>
      <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
        {segments.map((segment) => (
          <li key={segment.id} className="flex items-center gap-1.5 text-xs text-ink-2">
            <span
              aria-hidden="true"
              className="size-2.5 rounded-[3px]"
              style={{ background: segment.color }}
            />
            {segment.label}
            <span className="text-ink-3 tabular">{segment.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
