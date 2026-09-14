import { View } from "react-native";
import { Link } from "expo-router";
import { Image } from "expo-image";
import {
  formatDuration,
  levelLabel,
  radius,
  space,
  topicLabel,
  type CourseCard as CourseCardData,
  type CourseStats,
} from "@jarvis/core";
import { useIntl } from "@/lib/settings";
import { Badge, Card, Progress, Txt } from "./ui";

/**
 * One card, in both places it appears — the catalogue and the dashboard.
 *
 * `progress` is what tells them apart: a course somebody owns shows how far
 * through it they are instead of what it costs.
 */
export function CourseCardView({
  course,
  progress,
}: {
  course: CourseCardData;
  progress?: CourseStats;
}) {
  const { locale, t, palette } = useIntl();

  return (
    <Link href={{ pathname: "/course/[slug]", params: { slug: course.slug } }} asChild>
      <Card padded={false}>
        <View style={{ aspectRatio: 16 / 9, backgroundColor: palette.panel2 }}>
          {course.coverUrl ? (
            <Image
              source={{ uri: course.coverUrl }}
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
              transition={200}
            />
          ) : null}
        </View>

        <View style={{ padding: space.lg, gap: space.sm }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: space.sm }}>
            <Badge label={topicLabel(course.topic)} tone="accent" />
            <Txt variant="micro" tone="dim">
              {levelLabel(course.level, locale)} · {course.lessonCount} {t.learn.course.lessons}
              {course.minutes > 0 ? ` · ${formatDuration(course.minutes, locale)}` : ""}
            </Txt>
          </View>

          <Txt variant="heading" numberOfLines={2}>
            {course.title}
          </Txt>

          <Txt variant="small" tone="dim" numberOfLines={2}>
            {course.summary}
          </Txt>

          {progress ? (
            <View style={{ gap: 6, marginTop: space.xs }}>
              <Progress value={progress.percent} tone={progress.finished ? "ok" : "accent"} />
              <Txt variant="micro" tone={progress.finished ? "ok" : "dim"}>
                {progress.finished
                  ? t.learn.dashboard.finished
                  : `${progress.percent}% · ${progress.completed}/${progress.total}`}
              </Txt>
            </View>
          ) : (
            /* No price on a card — there is one price and a course is either
               free or inside it (§1). The web catalogue says the same. */
            <View style={{ flexDirection: "row", alignItems: "center", gap: space.sm }}>
              {course.isFree ? (
                <Txt variant="heading" tone="ok">
                  {t.learn.course.free}
                </Txt>
              ) : (
                <Txt variant="small" tone="dim">
                  {t.learn.bundle.included}
                </Txt>
              )}
            </View>
          )}
        </View>
      </Card>
    </Link>
  );
}

export const cardRadius = radius.lg;
