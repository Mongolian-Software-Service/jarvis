import type { LucideIcon } from "lucide-react";

export type Stat = { icon: LucideIcon; label: string; value: string };

/**
 * The numbers, as one strip rather than a card each.
 *
 * Three cards 200px tall spent most of the first screen on three digits and a
 * lot of empty panel. A strip says the same in a quarter of the height and
 * leaves the fold to the things a student acts on.
 *
 * The cells are divided by the grid's own gap showing the hairline through
 * (`gap-px` over `bg-line`), so the dividers are right at four across and at
 * two-by-two alike — `divide-x` only knows about one row.
 */
export function StatStrip({ stats }: { stats: Stat[] }) {
  return (
    <section className="border-line bg-line grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-lg)] border sm:grid-cols-4">
      {stats.map(({ icon: Icon, label, value }) => (
        <div key={label} className="bg-panel flex items-center gap-3 px-3.5 py-4 sm:px-4">
          <span className="bg-panel-2 text-ink-3 grid size-9 shrink-0 place-items-center rounded-md">
            <Icon className="size-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="font-display tabular text-[20px] leading-none whitespace-nowrap">
              {value}
            </p>
            <p className="text-ink-3 mt-1.5 line-clamp-2 text-[12.5px] leading-snug">{label}</p>
          </div>
        </div>
      ))}
    </section>
  );
}
