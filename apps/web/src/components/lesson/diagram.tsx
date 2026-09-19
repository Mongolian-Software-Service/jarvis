import { ArrowRight } from "lucide-react";
import type { MdStep } from "@jarvis/core";

/**
 * A ```diagram block: boxes in order, with arrows between them.
 *
 * Two shapes from one list, the way `course-trail.tsx` does it (§3): a
 * **column** on a phone, where a row of four boxes would be four unreadable
 * slivers, and a **row** from `sm` up, where a column would waste the width a
 * page is supposed to spend.
 *
 * Both the list and each item flip direction together: the arrow is the last
 * thing inside an item, so a column puts it *under* the box and a row puts it
 * *beside*, which is the difference between an arrow that reads as "then" and
 * one that reads as a stray mark. The rotation follows.
 *
 * In the row, the arrow leaves the flow and sits in the gap. In flow it ate
 * 28px of its own item and the last box — the one with no arrow — came out a
 * quarter wider than the rest, which is exactly the kind of thing that makes a
 * diagram look like a mistake rather than a picture.
 *
 * Every box is numbered. A diagram in a lesson is something the paragraph
 * underneath refers back to ("гуравдугаарт…"), and unnumbered boxes leave the
 * reader counting.
 *
 * `aria-hidden` on the arrows only: the boxes are real text in document order,
 * so a screen reader reads the steps as a list and hears no decoration.
 */
export function Diagram({ steps }: { steps: readonly MdStep[] }) {
  return (
    <ol className="border-line bg-panel-2/40 flex flex-col gap-1.5 rounded-lg border p-3 sm:flex-row sm:items-stretch sm:gap-4 sm:p-4">
      {steps.map((step, index) => (
        <li
          key={index}
          className="flex min-w-0 flex-col items-center sm:relative sm:flex-1 sm:flex-row sm:items-stretch"
        >
          <div className="bg-panel border-line min-w-0 w-full flex-1 rounded-md border px-3 py-2.5">
            <p className="text-ink flex items-baseline gap-1.5 text-[13.5px] leading-snug font-medium">
              <span className="text-ink-3 tabular text-[11px]">{index + 1}</span>
              <span className="min-w-0">{step.label}</span>
            </p>
            {step.note ? (
              <p className="text-ink-3 mt-1 ml-[1.1rem] text-[12.5px] leading-[1.5]">{step.note}</p>
            ) : null}
          </div>

          {index < steps.length - 1 ? (
            <ArrowRight
              aria-hidden="true"
              className="text-ink-3/60 my-1 size-4 shrink-0 rotate-90 sm:absolute sm:top-1/2 sm:right-0 sm:my-0 sm:translate-x-full sm:-translate-y-1/2 sm:rotate-0"
            />
          ) : null}
        </li>
      ))}
    </ol>
  );
}
