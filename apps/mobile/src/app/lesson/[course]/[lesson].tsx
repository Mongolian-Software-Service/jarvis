import { useCallback, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import { formatDuration, kindLabel, radius, space } from "@jarvis/core";
import { useIntl } from "@/lib/settings";
import { useAuth } from "@/lib/auth";
import { useAsync } from "@/lib/use-async";
import { getLesson, setProgress } from "@/lib/queries";
import { Markdown } from "@/components/markdown";
import { CodeBlock } from "@/components/code";
import { Quiz } from "@/components/quiz";
import { Button, Card, Loading, Txt } from "@/components/ui";

/** The lesson screen: whatever this lesson actually has, in reading order. */
export default function LessonScreen() {
  const { course, lesson } = useLocalSearchParams<{ course: string; lesson: string }>();
  const { locale, t, palette } = useIntl();
  const { userId } = useAuth();

  const read = useCallback(
    () => getLesson(course, lesson, locale, userId),
    [course, lesson, locale, userId],
  );
  const { data, loading, refresh } = useAsync(read, [course, lesson, locale, userId]);

  if (loading && !data) return <Loading />;

  if (!data) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: palette.bg, padding: space.lg }}>
        <Txt variant="title">{t.states.notFound}</Txt>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: palette.bg }}>
      <Pressable
        onPress={() => router.back()}
        style={{ padding: space.lg, paddingBottom: space.sm, flexDirection: "row", gap: 6 }}
      >
        <Ionicons name="chevron-back" size={20} color={palette.ink3} />
        <Txt variant="small" tone="dim" numberOfLines={1}>
          {data.course.title}
        </Txt>
      </Pressable>

      <ScrollView
        contentContainerStyle={{
          padding: space.lg,
          paddingTop: 0,
          gap: space.lg,
          paddingBottom: space.xxl * 2,
        }}
      >
        {data.locked || !data.lesson ? (
          <Card style={{ alignItems: "center", gap: space.md, paddingVertical: space.xxl }}>
            <Ionicons name="lock-closed-outline" size={28} color={palette.ink3} />
            <Txt variant="title" center>
              {t.learn.player.lockedTitle}
            </Txt>
            <Txt variant="small" tone="dim" center>
              {t.learn.player.lockedBody}
            </Txt>
            <Button label={t.learn.player.backToCourse} onPress={() => router.back()} />
          </Card>
        ) : (
          <LessonBody
            view={data}
            onProgress={refresh}
            userId={userId}
            courseSlug={course}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function LessonBody({
  view,
  userId,
  courseSlug,
  onProgress,
}: {
  view: NonNullable<Awaited<ReturnType<typeof getLesson>>>;
  userId: string | null;
  courseSlug: string;
  onProgress: () => void;
}) {
  const { locale, t } = useIntl();
  const [complete, setComplete] = useState(view.progress.completed);
  const [showSolution, setShowSolution] = useState(false);
  const item = view.lesson!;

  /*
   * One player, created once per source.
   *
   * `useVideoPlayer` keeps the native player alive across re-renders; creating
   * it inside the render would restart the video every time the "done" button
   * flips a piece of state.
   */
  const player = useVideoPlayer(item.videoUrl ?? null, (instance) => {
    instance.loop = false;
    if (view.progress.secondsWatched > 0) instance.currentTime = view.progress.secondsWatched;
  });

  async function mark(next: boolean) {
    setComplete(next);
    if (!userId) return;
    const ok = await setProgress({ userId, lessonId: item.id, completed: next });
    if (!ok) setComplete(!next);
    else onProgress();
  }

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

      <View style={{ gap: space.sm }}>
        <Button
          label={complete ? t.learn.player.marked : t.learn.player.markComplete}
          variant={complete ? "secondary" : "primary"}
          onPress={() => void mark(!complete)}
          full
          icon={null}
        />

        {view.next ? (
          <Button
            label={t.learn.player.nextLesson}
            variant="secondary"
            full
            onPress={() =>
              router.replace({
                pathname: "/lesson/[course]/[lesson]",
                params: { course: courseSlug, lesson: view.next!.slug },
              })
            }
          />
        ) : (
          <Button
            label={t.learn.player.backToCourse}
            variant="secondary"
            full
            onPress={() => router.back()}
          />
        )}
      </View>
    </>
  );
}
