import { useCallback } from "react";
import { Pressable, RefreshControl, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { fmt, formatDuration, groupDigits, radius, space, type CourseStats } from "@jarvis/core";
import { useIntl } from "@/lib/settings";
import { useAuth } from "@/lib/auth";
import { useAsync } from "@/lib/use-async";
import { getStudentOverview } from "@/lib/queries";
import { Button, Card, Empty, Loading, Progress, Txt } from "@/components/ui";

/**
 * Where a signed-in student lands.
 *
 * The same three things the web's dashboard shows, in the same order: carry on,
 * three numbers, and what is open. The arithmetic behind «Үргэлжлүүлэх» is
 * `resumeCourse` and `nextLesson` from `@jarvis/core` — the phone and the
 * browser send you to the same lesson because they ask the same function.
 *
 * Signed out it asks rather than redirects, like the learn tab: being bounced
 * to a form you did not open is the thing that makes people close an app.
 */
export default function DashboardScreen() {
  const { locale, t, palette } = useIntl();
  const { userId, ready, profile } = useAuth();

  const read = useCallback(
    () =>
      userId
        ? getStudentOverview(locale, userId)
        : Promise.resolve({ courses: [], lessonsDone: 0, minutesWatched: 0, resume: null }),
    [locale, userId],
  );
  const { data, loading, refreshing, refresh } = useAsync(read, [locale, userId]);

  if (!ready || (loading && !data)) return <Loading />;

  const firstName = profile?.fullName?.trim().split(/\s+/)[0];
  const started = (data?.courses ?? []).filter((course) => !course.progress.finished);

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: palette.bg }}>
      <ScrollView
        contentContainerStyle={{ padding: space.lg, paddingBottom: space.xxl, gap: space.xl }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={palette.ink3} />
        }
      >
        <View style={{ gap: space.xs }}>
          <Txt variant="display">
            {firstName ? fmt(t.learn.overview.greeting, { name: firstName }) : t.learn.overview.greetingPlain}
          </Txt>
          <Txt variant="small" tone="dim">
            {t.learn.overview.deck}
          </Txt>
        </View>

        {!userId ? (
          <Empty
            title={t.auth.errors.signedOut}
            body={t.learn.dashboard.empty}
            action={
              <View style={{ marginTop: space.md }}>
                <Button label={t.nav.signIn} onPress={() => router.push("/sign-in")} />
              </View>
            }
          />
        ) : (
          <>
            {/* Carry on */}
            {data?.resume ? (
              <Card>
                <Txt variant="micro" tone="dim">
                  {data.resume.courseTitle}
                </Txt>
                <View style={{ marginTop: space.xs, marginBottom: space.md }}>
                  <Txt variant="title">{data.resume.lessonTitle}</Txt>
                </View>
                <Button
                  label={t.learn.overview.resume}
                  onPress={() =>
                    router.push(`/lesson/${data.resume!.courseSlug}/${data.resume!.lessonSlug}`)
                  }
                />
              </Card>
            ) : null}

            {/* Three numbers */}
            <View style={{ flexDirection: "row", gap: space.sm }}>
              <Stat
                icon="library-outline"
                label={t.learn.overview.statCourses}
                value={groupDigits(data?.courses.length ?? 0)}
              />
              <Stat
                icon="checkmark-circle-outline"
                label={t.learn.overview.statLessons}
                value={groupDigits(data?.lessonsDone ?? 0)}
              />
              <Stat
                icon="time-outline"
                label={t.learn.overview.statMinutes}
                value={formatDuration(data?.minutesWatched ?? 0, locale)}
              />
            </View>

            {/* What is open */}
            {started.length > 0 ? (
              <View style={{ gap: space.sm }}>
                <Txt variant="heading">{t.learn.overview.inProgress}</Txt>
                <Card padded={false}>
                  {started.map((course, index) => (
                    <OpenCourse
                      key={course.id}
                      title={course.title}
                      progress={course.progress}
                      first={index === 0}
                      onPress={() => router.push(`/course/${course.slug}`)}
                    />
                  ))}
                </Card>
              </View>
            ) : null}

            {/* Somebody holding nothing is shown the way in, not an empty panel. */}
            {(data?.courses ?? []).length === 0 ? (
              <Empty
                title={t.learn.dashboard.empty}
                action={
                  <View style={{ marginTop: space.md, gap: space.sm, alignItems: "center" }}>
                    <Button
                      label={t.guide.trail.title}
                      onPress={() => router.push("/hello")}
                    />
                    <Button
                      label={t.learn.dashboard.emptyAction}
                      variant="secondary"
                      onPress={() => router.push("/")}
                    />
                  </View>
                }
              />
            ) : null}

            {/* Quietly, for everybody else: the guide is worth a second read
                and there is nowhere else on the phone that points at it. */}
            {(data?.courses ?? []).length > 0 ? (
              <Pressable
                onPress={() => router.push("/hello")}
                style={({ pressed }) => ({
                  flexDirection: "row",
                  alignItems: "center",
                  gap: space.sm,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Ionicons name="compass-outline" size={16} color={palette.ink3} />
                <Txt variant="small" tone="dim">
                  {t.guide.trail.title}
                </Txt>
              </Pressable>
            ) : null}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  const { palette } = useIntl();
  return (
    <View
      style={{
        flex: 1,
        minWidth: 0,
        gap: 2,
        padding: space.md,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: palette.line,
        backgroundColor: palette.panel,
      }}
    >
      <Ionicons name={icon} size={14} color={palette.ink3} />
      <Txt variant="heading">{value}</Txt>
      <Txt variant="micro" tone="dim" numberOfLines={2}>
        {label}
      </Txt>
    </View>
  );
}

function OpenCourse({
  title,
  progress,
  first,
  onPress,
}: {
  title: string;
  progress: CourseStats;
  first: boolean;
  onPress: () => void;
}) {
  const { palette } = useIntl();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        gap: space.sm,
        padding: space.md,
        borderTopWidth: first ? 0 : 1,
        borderTopColor: palette.line,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: space.sm }}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Txt variant="body" numberOfLines={1}>
            {title}
          </Txt>
        </View>
        <Txt variant="micro" tone="dim">
          {progress.completed}/{progress.total}
        </Txt>
      </View>
      <Progress value={progress.percent} tone={progress.finished ? "ok" : "accent"} />
    </Pressable>
  );
}
