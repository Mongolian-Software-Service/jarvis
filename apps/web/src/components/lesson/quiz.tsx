"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, RotateCcw, X } from "lucide-react";
import { QUIZ_PASS_SCORE, fmt, quizScore } from "@jarvis/core";
import type { QuizItem } from "@/lib/queries/learn";
import { setLessonProgress } from "@/lib/actions/progress";
import { buttonClass } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/cn";

type Labels = {
  question: string;
  check: string;
  correct: string;
  wrong: string;
  next: string;
  finish: string;
  retry: string;
  result: string;
  passed: string;
  failed: string;
};

/**
 * A teaching quiz: one question at a time, marked the moment it is answered.
 *
 * Marked in the browser, which is a deliberate trade. `correct_index` travels
 * with the question, so a determined student can read the answer out of the
 * network tab — and the cost of stopping that is a round trip per question, a
 * lesson that does not work on a bad connection, and a quiz that cannot run on
 * the phone offline. This is not an exam; when one is needed the answer moves
 * behind a `check_answer()` RPC and this comment is how you will know that was
 * a decision rather than an oversight.
 */
export function Quiz({
  questions,
  lessonId,
  path,
  labels,
}: {
  questions: QuizItem[];
  lessonId: string;
  path: string;
  labels: Labels;
}) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);
  const [, startTransition] = useTransition();
  const router = useRouter();

  const question = questions[index];
  if (!question) return null;

  const last = index === questions.length - 1;
  const right = checked && picked === question.correctIndex;

  function check() {
    if (picked === null) return;
    setChecked(true);
    if (picked === question!.correctIndex) setCorrect((value) => value + 1);
  }

  function advance() {
    if (!last) {
      setIndex(index + 1);
      setPicked(null);
      setChecked(false);
      return;
    }

    const score = quizScore(correct, questions.length);
    setDone(true);
    startTransition(async () => {
      await setLessonProgress({
        lessonId,
        // A quiz below the pass mark leaves the lesson unfinished — the tick in
        // the sidebar has to mean the same thing everywhere it appears.
        completed: score >= QUIZ_PASS_SCORE,
        quizScore: score,
        path,
      });
      router.refresh();
    });
  }

  function restart() {
    setIndex(0);
    setPicked(null);
    setChecked(false);
    setCorrect(0);
    setDone(false);
  }

  if (done) {
    const score = quizScore(correct, questions.length);
    const passed = score >= QUIZ_PASS_SCORE;
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
          {fmt(labels.result, { score, correct, total: questions.length })}
        </p>
        <p className="font-medium">{passed ? labels.passed : labels.failed}</p>
        <button type="button" onClick={restart} className={buttonClass("secondary", "md")}>
          <RotateCcw className="size-4" />
          {labels.retry}
        </button>
      </div>
    );
  }

  return (
    <div className="panel space-y-5 p-6">
      <div className="space-y-2">
        <p className="kicker tabular">
          {fmt(labels.question, { current: index + 1, total: questions.length })}
        </p>
        <Progress value={((index + (checked ? 1 : 0)) / questions.length) * 100} />
      </div>

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
    </div>
  );
}
