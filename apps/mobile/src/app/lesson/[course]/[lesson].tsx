import { useCallback } from "react";
import { Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { space } from "@jarvis/core";
import { useIntl } from "@/lib/settings";
import { useAuth } from "@/lib/auth";
import { useAsync } from "@/lib/use-async";
import { getLesson } from "@/lib/queries";
import { Button, Card, Loading, Txt } from "@/components/ui";
import { LessonBody } from "@/components/lesson/lesson-body";

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
