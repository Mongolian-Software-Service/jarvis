import { fmt, space } from "@jarvis/core";
import { Button, Card, Txt } from "../ui";

/** The score card, and the only way back in. */
export function QuizResult({
  score,
  passed,
  correct,
  total,
  t,
  restart,
}: {
  score: number;
  passed: boolean;
  correct: number;
  total: number;
  t: { learn: { quiz: { result: string; passed: string; failed: string; retry: string } } };
  restart: () => void;
}) {
  return (
      <Card style={{ alignItems: "center", gap: space.md, paddingVertical: space.xl }}>
        <Txt variant="display" tone={passed ? "ok" : "warn"}>
          {score}%
        </Txt>
        <Txt variant="small" tone="dim" center>
          {fmt(t.learn.quiz.result, { score, correct, total })}
        </Txt>
        <Txt variant="heading">{passed ? t.learn.quiz.passed : t.learn.quiz.failed}</Txt>
        <Button
          label={t.learn.quiz.retry}
          variant="secondary"
          onPress={restart}
        />
      </Card>
  );
}
