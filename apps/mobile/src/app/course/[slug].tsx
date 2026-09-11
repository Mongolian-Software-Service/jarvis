import { useCallback, useState } from "react";
import { Linking, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import {
  SITE_URL,
  coursePath,
  formatDuration,
  formatMoney,
  kindLabel,
  levelLabel,
  radius,
  space,
  topicLabel,
  type LessonOutline,
} from "@jarvis/core";
import { useIntl } from "@/lib/settings";
import { useAuth } from "@/lib/auth";
import { useAsync } from "@/lib/use-async";
import { enrollFree, getCourse, hasAccess, resumeLesson } from "@/lib/queries";
import { Markdown } from "@/components/markdown";
import { Badge, Button, Card, Divider, Loading, Txt } from "@/components/ui";

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

        <Card>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Txt variant="title" tone={course.priceMnt <= 0 ? "ok" : "ink"}>
              {formatMoney(course.priceMnt, locale)}
            </Txt>
            {access ? <Badge label={t.learn.course.enrolled} tone="ok" /> : null}
          </View>

          {access ? (
            <Button label={t.learn.course.continue} onPress={() => void open()} full />
          ) : course.priceMnt <= 0 ? (
            <Button
              label={userId ? t.learn.course.startFree : t.learn.course.signInToBuy}
              onPress={() => void take()}
              busy={busy}
              full
            />
          ) : (
            <View style={{ gap: space.sm }}>
              {/*
               * Paid courses are bought on the web, not here.
               *
               * Apple's guideline 3.1.1 requires in-app purchase for digital
               * content sold inside an iOS app, and Bonum is not that. Sending
               * the buyer to the website is the honest version of this — see
               * docs/decisions #009.
               */}
              <Button
                label={t.learn.course.buyOnWeb}
                onPress={() => void Linking.openURL(`${SITE_URL}${coursePath(locale, course.slug)}`)}
                full
              />
              <Txt variant="micro" tone="dim">
                {t.learn.course.buyOnWebNote}
              </Txt>
            </View>
          )}
        </Card>

        {course.description ? (
          <View style={{ gap: space.sm }}>
            <Txt variant="title">{t.learn.course.about}</Txt>
            <Markdown source={course.description} />
            {course.descriptionIsFallback ? (
              <Txt variant="micro" tone="dim">
                {t.learn.fallbackNotice}
              </Txt>
            ) : null}
          </View>
        ) : null}

        <View style={{ gap: space.md }}>
          <Txt variant="title">{t.learn.course.syllabus}</Txt>
          {course.modules.map((section, index) => (
            <View key={section.id} style={{ gap: space.sm }}>
              <Txt variant="micro" tone="dim">
                {String(index + 1).padStart(2, "0")} · {section.title}
              </Txt>
              <Card padded={false}>
                {section.lessons.map((lesson, position) => (
                  <View key={lesson.id}>
                    {position > 0 ? <Divider /> : null}
                    <LessonRow
                      lesson={lesson}
                      courseSlug={course.slug}
                      open={access || lesson.isPreview}
                      previewLabel={t.learn.course.preview}
                      kindText={`${kindLabel(lesson.kind, locale)}${lesson.minutes > 0 ? ` · ${formatDuration(lesson.minutes, locale)}` : ""}`}
                    />
                  </View>
                ))}
              </Card>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/** A locked row is not a link — tapping through to a refusal wastes the tap. */
function LessonRow({
  lesson,
  courseSlug,
  open,
  previewLabel,
  kindText,
}: {
  lesson: LessonOutline;
  courseSlug: string;
  open: boolean;
  previewLabel: string;
  kindText: string;
}) {
  const { palette } = useIntl();

  const body = (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: space.md,
        padding: space.md,
        paddingHorizontal: space.lg,
      }}
    >
      <Ionicons
        name={open ? "play-circle-outline" : "lock-closed-outline"}
        size={18}
        color={open ? palette.ink3 : palette.ink3}
        style={{ opacity: open ? 1 : 0.6 }}
      />
      <View style={{ flex: 1, gap: 2 }}>
        <Txt variant="small" tone={open ? "ink" : "dim"} numberOfLines={1}>
          {lesson.title}
        </Txt>
        <Txt variant="micro" tone="dim">
          {kindText}
        </Txt>
      </View>
      {lesson.isPreview && !open ? <Badge label={previewLabel} tone="ok" /> : null}
    </View>
  );

  if (!open) return body;

  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: "/lesson/[course]/[lesson]",
          params: { course: courseSlug, lesson: lesson.slug },
        })
      }
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
    >
      {body}
    </Pressable>
  );
}

export const hairline = StyleSheet.hairlineWidth;
