import { TECH, type Tech } from "./tech-logos";

/**
 * The stack, moving.
 *
 * This is the slot where the reference site puts customer logos. We have no
 * customers to name yet and inventing some would be a lie on the first screen,
 * so it carries what the courses actually teach — which is the thing a visitor
 * is weighing anyway.
 *
 * Twelve names do not fit across a phone and look thin across a desktop, so the
 * row travels instead of wrapping. It is CSS — a `translateX` keyframe on a
 * doubled row (`.marquee` in globals.css) — because CLAUDE.md §2 says motion is
 * CSS and there is no animation library in this project.
 *
 * The second row is `aria-hidden`: it exists only so the loop has no seam, and
 * a screen reader that read it would announce the whole stack twice.
 */
export function TechMarquee() {
  return (
    <div className="marquee">
      <div className="marquee-track">
        <Row />
        <Row duplicate />
      </div>
    </div>
  );
}

function Row({ duplicate = false }: { duplicate?: boolean }) {
  return (
    <ul className="marquee-row" {...(duplicate ? { "aria-hidden": true } : {})}>
      {TECH.map((tech) => (
        <li key={tech.label} className="flex shrink-0 items-center gap-2.5 text-ink-2">
          <Mark tech={tech} />
          <span className="font-display text-[15px] font-semibold tracking-[-0.01em] whitespace-nowrap">
            {tech.label}
          </span>
        </li>
      ))}
    </ul>
  );
}

/**
 * The glyph, in the brand's own colour — the marks carry the colour and the
 * wordmarks stay in ink, which is what keeps a row of eleven brands from
 * reading as a fruit salad.
 *
 * `color` rather than `fill`: the path is `fill="currentColor"`, so one
 * property on the `<svg>` paints it, and an entry that has no `color` falls
 * back to the row's ink instead of disappearing. Two brands ship black marks
 * and point at `--ink` instead — see `tech-logos.ts`.
 */
function Mark({ tech }: { tech: Tech }) {
  if (!tech.path) return null;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className="size-[18px] shrink-0"
      style={{ color: tech.color }}
    >
      <path d={tech.path} />
    </svg>
  );
}
