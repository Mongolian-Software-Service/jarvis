"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { CodeBlock } from "./code-block";
import { buttonClass } from "@/components/ui/button";

/**
 * The code half of a lesson: what you start from, and what it should end as.
 *
 * The solution is behind a toggle and stays closed until it is asked for.
 * Putting the answer next to the exercise is the fastest way to turn a course
 * into a reading exercise — and the warning under the button is there because
 * somebody will open it anyway, and should at least have been told.
 */
export function Exercise({
  starter,
  solution,
  language,
  labels,
}: {
  starter: string;
  solution: string | null;
  language: string | null;
  labels: {
    starter: string;
    solution: string;
    show: string;
    hide: string;
    warning: string;
    copy: string;
    copied: string;
  };
}) {
  const [open, setOpen] = useState(false);
  const copyLabels = { copy: labels.copy, copied: labels.copied };

  return (
    <div className="space-y-4">
      <CodeBlock code={starter} language={language} title={labels.starter} copyLabels={copyLabels} />

      {solution ? (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              className={buttonClass("secondary", "sm")}
            >
              {open ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              {open ? labels.hide : labels.show}
            </button>
            {!open ? <p className="text-xs text-ink-3">{labels.warning}</p> : null}
          </div>

          {open ? (
            <CodeBlock
              code={solution}
              language={language}
              title={labels.solution}
              copyLabels={copyLabels}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
