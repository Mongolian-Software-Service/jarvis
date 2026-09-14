import { View } from "react-native";
import { VideoView, type VideoPlayer } from "expo-video";
import { formatDuration, kindLabel, radius, space, type LessonContent as Content, type Locale, type Strings } from "@jarvis/core";
import { getLesson, setProgress } from "@/lib/queries";
import { Markdown } from "@/components/markdown";
import { CodeBlock } from "@/components/code";
import { Quiz } from "@/components/quiz";
import { Button, Txt } from "@/components/ui";

/**
 * Whatever this lesson actually has, in reading order.
 *
 * `kind` says what it leads with, not what it holds (§1) — a row with a video
 * and a body and an exercise draws all three.
 */
export function LessonContent({
  item,
  view,
  locale,
  t,
  player,
  showSolution,
  setShowSolution,
  userId,
  setComplete,
  onProgress,
}: {
  item: Content;
  view: NonNullable<Awaited<ReturnType<typeof getLesson>>>;
  locale: Locale;
  t: Strings;
  player: VideoPlayer;
  showSolution: boolean;
  setShowSolution: (value: boolean) => void;
  userId: string | null;
  setComplete: (value: boolean) => void;
  onProgress: () => void;
}) {
  return (
    <>
      <View style={{ gap: space.xs }}>
        <Txt variant="micro" tone="dim">
          {kindLabel(item.kind, locale)}
          {item.minutes > 0 ? ` · ${formatDuration(item.minutes, locale)}` : ""}
        </Txt>
        <Txt variant="display">{item.title}</Txt>
      </View>

      {item.videoUrl ? (
        <VideoView
          player={player}
          style={{ width: "100%", aspectRatio: 16 / 9, borderRadius: radius.lg, backgroundColor: "#000" }}
          fullscreenOptions={{ enable: true }}
          allowsPictureInPicture
          nativeControls
        />
      ) : null}

      {item.body ? (
        <>
          <Markdown source={item.body} />
          {item.bodyIsFallback ? (
            <Txt variant="micro" tone="dim">
              {t.learn.fallbackNotice}
            </Txt>
          ) : null}
        </>
      ) : null}

      {item.starterCode ? (
        <View style={{ gap: space.md }}>
          <CodeBlock
            code={item.starterCode}
            language={item.codeLanguage}
            title={t.learn.code.starter}
          />
          {item.solutionCode ? (
            showSolution ? (
              <CodeBlock
                code={item.solutionCode}
                language={item.codeLanguage}
                title={t.learn.code.solution}
              />
            ) : (
              <View style={{ gap: 6 }}>
                <Button
                  label={t.learn.code.showSolution}
                  variant="secondary"
                  onPress={() => setShowSolution(true)}
                />
                <Txt variant="micro" tone="dim">
                  {t.learn.code.solutionWarning}
                </Txt>
              </View>
            )
          ) : null}
        </View>
      ) : null}

      {view.quiz.length > 0 ? (
        <Quiz
          questions={view.quiz}
          onFinish={(score, passed) => {
            setComplete(passed);
            if (userId) {
              void setProgress({
                userId,
                courseId: view.course.id,
                lessonId: item.id,
                // A quiz below the pass mark leaves the lesson unfinished — the
                // tick has to mean the same thing everywhere it appears.
                completed: passed,
                quizScore: score,
              }).then(onProgress);
            }
          }}
        />
      ) : null}
    </>
  );
}
