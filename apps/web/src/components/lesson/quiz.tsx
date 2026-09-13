"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { QUIZ_PASS_SCORE, fmt, quizScore } from "@jarvis/core";
import type { QuizItem } from "@/lib/queries/learn";
import { setLessonProgress } from "@/lib/actions/progress";
import { Progress } from "@/components/ui/progress";
import { QuizQuestion } from "./quiz/question";
import { QuizResult } from "./quiz/result";

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
  courseId,
  lessonId,
  path,
  labels,
}: {
  questions: QuizItem[];
  courseId: string;
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
        courseId,
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
    const passed = score >= QUIZ_PASS_SCORE;    return (
      <QuizResult
        score={score}
        passed={passed}
        correct={correct}
        total={questions.length}
        labels={labels}
        restart={restart}
      />
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

      <QuizQuestion
        question={question}
        picked={picked}
        setPicked={setPicked}
        checked={checked}
        right={right}
        last={last}
        labels={labels}
        check={check}
        advance={advance}
      />
    </div>
  );
}
