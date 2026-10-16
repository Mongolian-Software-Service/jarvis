/**
 * One ring cut into a few parts — «Эрх авсан хэлбэр»'s chart.
 *
 * Still a div, like the rest of this vocabulary: the ring is a
 * `conic-gradient` and the hole is a disc of the panel's own colour laid over
 * it, so there is no SVG to scale and the number in the middle is real text at
 * its real size. Touching parts are separated the way the bars are, by a gap
 * in the surface colour (`--panel`, what `.panel` is filled with) rather than
 * by a stroke.
 *
 * Every part is named in the legend with its count and share, including the
 * empty ones a reader asked to see — a zero is an answer, and leaving it out
 * would make the legend change shape from one week to the next.
 */

type Segment = { id: string; label: string; value: number; color: string };

/** Degrees of `--panel` between two parts — about 2px on this ring. */
const GAP = 1.6;

function ring(segments: Segment[], total: number): string {
  const drawn = segments.filter((segment) => segment.value > 0);
  // A ring of one part has nothing to separate, and a gap would read as a tick.
  const [only] = drawn;
  if (drawn.length === 1 && only) return only.color;

  let at = 0;
  const stops: string[] = [];
  for (const segment of drawn) {
    const end = at + (segment.value / total) * 360;
    stops.push(
      `${segment.color} ${at}deg ${end - GAP}deg`,
      `var(--panel) ${end - GAP}deg ${end}deg`,
    );
    at = end;
  }
  return `conic-gradient(${stops.join(", ")})`;
}

export function Donut({
  segments,
  unit,
  label,
  empty,
}: {
  segments: Segment[];
  /** Under the total in the hole — what is being counted. */
  unit: string;
  /** The screen-reader table's caption. */
  label: string;
  empty: string;
}) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  if (total === 0) return <p className="text-ink-3 py-8 text-center text-sm">{empty}</p>;

  return (
    <figure className="flex flex-wrap items-center gap-x-8 gap-y-5">
      <div
        aria-hidden="true"
        className="relative size-36 shrink-0 rounded-full"
        style={{ background: ring(segments, total) }}
      >
        <div className="bg-panel absolute inset-[18px] flex flex-col items-center justify-center rounded-full">
          <span className="font-display tabular text-[26px] leading-none">{total}</span>
          <span className="text-ink-3 mt-1 text-xs">{unit}</span>
        </div>
      </div>

      <ul className="min-w-44 flex-1 space-y-2.5" aria-hidden="true">
        {segments.map((segment) => (
          <li key={segment.id} className="flex items-center gap-2.5 text-sm">
            <span
              className="size-2.5 shrink-0 rounded-[3px]"
              style={{ background: segment.color }}
            />
            <span className="text-ink-2 min-w-0 flex-1 truncate">{segment.label}</span>
            <span className="tabular shrink-0 font-medium">{segment.value}</span>
            <span className="text-ink-3 tabular w-10 shrink-0 text-right text-xs">
              {Math.round((segment.value / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>

      {/* The numbers for a screen reader; `sr-only` on a div, never the table (bars.tsx). */}
      <div className="sr-only">
        <table>
          <caption>{label}</caption>
          <tbody>
            {segments.map((segment) => (
              <tr key={segment.id}>
                <th scope="row">{segment.label}</th>
                <td>{segment.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}
