"use client";

import { RotateCcw } from "lucide-react";
import { fmt } from "@jarvis/core";
import { buttonClass } from "@/components/ui/button";
import { cn } from "@/lib/cn";

/** What the student sees once the last question is answered: the score, whether
 *  it passed, and the only way back in. */
export function QuizResult({
  score,
  passed,
  correct,
  total,
  labels,
  restart,
}: {
  score: number;
  passed: boolean;
  correct: number;
  total: number;
  labels: { result: string; passed: string; failed: string; retry: string };
  restart: () => void;
}) {
  return (
      <div className="panel space-y-4 p-6 text-center">
        <p
          className={cn(
            "font-display text-[32px] tabular",
            passed ? "text-ok" : "text-warn",
          )}
        >
          {score}%
        </p>
        <p className="text-sm text-ink-2">
          {fmt(labels.result, { score, correct, total })}
        </p>
        <p className="font-medium">{passed ? labels.passed : labels.failed}</p>
        <button type="button" onClick={restart} className={buttonClass("secondary", "md")}>
          <RotateCcw className="size-4" />
          {labels.retry}
        </button>
      </div>
  );
}
