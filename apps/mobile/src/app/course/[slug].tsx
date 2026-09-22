import { useCallback, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { formatDuration, levelLabel, radius, space, topicLabel } from "@jarvis/core";
import { useIntl } from "@/lib/settings";
import { useAuth } from "@/lib/auth";
import { useAsync } from "@/lib/use-async";
import { enrollFree, getCourse, hasAccess, resumeLesson } from "@/lib/queries";
import { AccessCard } from "@/components/course/access-card";
import { CourseSyllabus } from "@/components/course/syllabus";
import { Badge, Loading, Txt } from "@/components/ui";

export default function CourseScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { locale, t, palette } = useIntl();
  const { userId } = useAuth();
  const [busy, setBusy] = useState(false);

  const read = useCallback(async () => {
    const course = await getCourse(slug, locale);
    if (!course) return null;
    return { course, access: await hasAccess(course.id) };
  }, [slug, locale]);

  const { data, loading, refresh } = useAsync(read, [slug, locale, userId]);

  if (loading && !data) return <Loading />;
  if (!data?.course) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: palette.bg, padding: space.lg }}>
        <Txt variant="title">{t.states.notFound}</Txt>
      </SafeAreaView>
    );
  }

  const { course, access } = data;

  async function open() {
    const next = await resumeLesson(course.slug, locale);
    if (next) {
      router.push({
        pathname: "/lesson/[course]/[lesson]",
        params: { course: course.slug, lesson: next },
      });
    }
  }

  async function take() {
    if (!userId) {
      router.push("/sign-in");
      return;
    }
    setBusy(true);
    const ok = await enrollFree(userId, course.id);
    setBusy(false);
    if (ok) {
      refresh();
      await open();
    }
  }

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: palette.bg }}>
      <Pressable
        onPress={() => router.back()}
        style={{ padding: space.lg, paddingBottom: space.sm, flexDirection: "row", gap: 6 }}
      >
        <Ionicons name="chevron-back" size={20} color={palette.ink3} />
        <Txt variant="small" tone="dim">
          {t.actions.back}
        </Txt>
      </Pressable>

      <ScrollView contentContainerStyle={{ padding: space.lg, paddingTop: 0, gap: space.lg, paddingBottom: space.xxl * 2 }}>
        <View style={{ aspectRatio: 16 / 9, borderRadius: radius.lg, overflow: "hidden", backgroundColor: palette.panel2 }}>
          {course.coverUrl ? (
            <Image source={{ uri: course.coverUrl }} style={{ width: "100%", height: "100%" }} contentFit="cover" />
          ) : null}
        </View>

        <View style={{ gap: space.sm }}>
          <View style={{ flexDirection: "row", gap: space.sm }}>
            <Badge label={topicLabel(course.topic)} tone="accent" />
            <Badge label={levelLabel(course.level, locale)} />
          </View>
          <Txt variant="display">{course.title}</Txt>
          <Txt variant="body" tone="muted">
            {course.summary}
          </Txt>
          <Txt variant="small" tone="dim">
            {course.lessonCount} {t.learn.course.lessons} · {formatDuration(course.minutes, locale)}
          </Txt>
        </View>

        <AccessCard
          course={course}
          locale={locale}
          t={t}
          access={access}
          userId={userId}
          busy={busy}
          open={() => void open()}
          take={() => void take()}
        />

        <CourseSyllabus course={course} locale={locale} t={t} access={access} />
      </ScrollView>
    </SafeAreaView>
  );
}
