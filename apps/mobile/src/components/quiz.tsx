import { useState } from "react";
import { View } from "react-native";
import { QUIZ_PASS_SCORE, fmt, quizScore, radius, space, type QuizItem } from "@jarvis/core";
import { useIntl } from "@/lib/settings";
import { Button, Card, Progress, Txt } from "./ui";
import { QuizOptions } from "./quiz/options";
import { QuizResult } from "./quiz/result";

/**
 * A teaching quiz, marked on the device.
 *
 * The same trade the web makes: `correct_index` travels with the question, so a
 * determined student could read it — and the cost of preventing that is a round
 * trip per question and a quiz that stops working on a bad connection, which on
 * a phone is most of the time. This is not an exam.
 */
export function Quiz({
  questions,
  onFinish,
}: {
  questions: QuizItem[];
  onFinish: (score: number, passed: boolean) => void;
}) {
  const { t, palette } = useIntl();
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);

  const question = questions[index];
  if (!question) return null;

  const last = index === questions.length - 1;
  const right = checked && picked === question.correctIndex;

  function advance() {
    if (!last) {
      setIndex(index + 1);
      setPicked(null);
      setChecked(false);
      return;
    }
    const score = quizScore(correct, questions.length);
    setDone(true);
    onFinish(score, score >= QUIZ_PASS_SCORE);
  }

  if (done) {
    const score = quizScore(correct, questions.length);
    return (
      <QuizResult
        score={score}
        passed={score >= QUIZ_PASS_SCORE}
        correct={correct}
        total={questions.length}
        t={t}
        restart={() => {
          setIndex(0);
          setPicked(null);
          setChecked(false);
          setCorrect(0);
          setDone(false);
        }}
      />
    );
  }

  return (
    <Card style={{ gap: space.md }}>
      <View style={{ gap: 6 }}>
        <Txt variant="micro" tone="dim">
          {fmt(t.learn.quiz.question, { current: index + 1, total: questions.length })}
        </Txt>
        <Progress value={((index + (checked ? 1 : 0)) / questions.length) * 100} />
      </View>

      <Txt variant="heading">{question.prompt}</Txt>

      <QuizOptions
        question={question}
        picked={picked}
        setPicked={setPicked}
        checked={checked}
        right={right}
        t={t}
      />

      {checked ? (
        <View
          style={{
            padding: space.md,
            borderRadius: radius.md,
            backgroundColor: right ? palette.okSoft : palette.warnSoft,
            gap: 4,
          }}
        >
          <Txt variant="small" tone={right ? "ok" : "warn"}>
            {right ? t.learn.quiz.correct : t.learn.quiz.wrong}
          </Txt>
          {question.explanation ? (
            <Txt variant="small" tone="muted">
              {question.explanation}
            </Txt>
          ) : null}
        </View>
      ) : null}

      <View style={{ alignItems: "flex-end" }}>
        {checked ? (
          <Button label={last ? t.learn.quiz.finish : t.learn.quiz.next} onPress={advance} />
        ) : (
          <Button
            label={t.learn.quiz.check}
            disabled={picked === null}
            onPress={() => {
              setChecked(true);
              if (picked === question.correctIndex) setCorrect((value) => value + 1);
            }}
          />
        )}
      </View>
    </Card>
  );
}
