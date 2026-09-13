"use client";

import { Check, X } from "lucide-react";
import { buttonClass } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import type { QuizItem } from "@/lib/queries/learn";

/** One question: the prompt, its options, the explanation once checked, and
 *  the single button that moves things on. */
export function QuizQuestion({
  question,
  picked,
  setPicked,
  checked,
  right,
  last,
  labels,
  check,
  advance,
}: {
  question: QuizItem;
  picked: number | null;
  setPicked: (value: number) => void;
  checked: boolean;
  right: boolean;
  last: boolean;
  labels: {
    correct: string;
    wrong: string;
    check: string;
    next: string;
    finish: string;
  };
  check: () => void;
  advance: () => void;
}) {
  return (
    <>
      <p className="font-display text-[15px] font-semibold">{question.prompt}</p>

      <fieldset className="space-y-2">
        <legend className="sr-only">{question.prompt}</legend>
        {question.options.map((option, position) => {
          const isPicked = picked === position;
          const isAnswer = position === question.correctIndex;
          return (
            <label
              key={position}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-md border px-4 py-3 text-sm transition-colors",
                checked && isAnswer && "border-ok bg-ok-soft",
                checked && isPicked && !isAnswer && "border-bad bg-bad-soft",
                !checked && isPicked && "border-accent bg-accent-soft",
                !checked && !isPicked && "border-line hover:border-line-strong",
                checked && "cursor-default",
              )}
            >
              <input
                type="radio"
                name={`q-${question.id}`}
                checked={isPicked}
                disabled={checked}
                onChange={() => setPicked(position)}
                className="sr-only"
              />
              <span
                className={cn(
                  "grid size-5 shrink-0 place-items-center rounded-full border text-xs",
                  isPicked ? "border-accent text-accent" : "border-line-strong text-ink-3",
                )}
                aria-hidden="true"
              >
                {checked && isAnswer ? (
                  <Check className="size-3 text-ok" />
                ) : checked && isPicked ? (
                  <X className="size-3 text-bad" />
                ) : (
                  String.fromCharCode(65 + position)
                )}
              </span>
              <span className="flex-1">{option}</span>
            </label>
          );
        })}
      </fieldset>

      {checked ? (
        <div
          className={cn(
            "rounded-md border px-4 py-3 text-sm",
            right ? "border-ok/30 bg-ok-soft text-ok" : "border-warn/30 bg-warn-soft text-warn",
          )}
        >
          <p className="font-medium">{right ? labels.correct : labels.wrong}</p>
          {question.explanation ? (
            <p className="mt-1 text-ink-2">{question.explanation}</p>
          ) : null}
        </div>
      ) : null}

      <div className="flex justify-end">
        {checked ? (
          <button type="button" onClick={advance} className={buttonClass("primary", "md")}>
            {last ? labels.finish : labels.next}
          </button>
        ) : (
          <button
            type="button"
            onClick={check}
            disabled={picked === null}
            className={buttonClass("primary", "md")}
          >
            {labels.check}
          </button>
        )}
      </div>
    </>
  );
}
