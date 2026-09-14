import { useCallback } from "react";
import { Pressable, RefreshControl, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { formatDuration, groupDigits, space } from "@jarvis/core";
import { useIntl } from "@/lib/settings";
import { useAuth } from "@/lib/auth";
import { useAsync } from "@/lib/use-async";
import { listCourses, listMyCourses } from "@/lib/queries";
import { Markdown } from "@/components/markdown";
import { Trail, type TrailStep } from "@/components/hello/trail";
import { Button, Card, Loading, Txt } from "@/components/ui";

/**
 * What a new student reads first.
 *
 * A pushed screen rather than a sixth tab. The web can afford it in the rail;
 * a phone's tab bar holds five before the labels start truncating, and this is
 * a screen somebody reads once and then rarely — the dashboard links to it, and
 * links to it loudly while they still hold nothing.
 *
 * Every word comes from `t.guide`, and the body is Markdown parsed by the same
 * `parseMarkdown()` the web uses, so the two editions cannot say different
 * things (CLAUDE.md §9).
 */
export default function HelloScreen() {
  const { locale, t, palette } = useIntl();
  const { userId } = useAuth();

  const read = useCallback(
    async () => ({
      courses: await listCourses(locale),
      mine: userId ? await listMyCourses(locale, userId) : [],
    }),
    [locale, userId],
  );
  const { data, loading, refreshing, refresh } = useAsync(read, [locale, userId]);

  if (loading && !data) return <Loading />;

  const courses = data?.courses ?? [];
  const mine = data?.mine ?? [];
  const held = new Map(mine.map((course) => [course.id, course.progress]));

  const opened = (course: (typeof courses)[number]) => held.has(course.id) || course.isFree;
  const done = (course: (typeof courses)[number]) => held.get(course.id)?.finished ?? false;

  /*
   * Exactly one step may be "you are here", so it is found before the map
   * rather than flipped inside it. `-1` when everything is finished, and then
   * no node is marked — which is the honest answer.
   */
  const currentIndex = courses.findIndex((course) => opened(course) && !done(course));

  const steps: TrailStep[] = courses.map((course, index) => {
    const progress = held.get(course.id);
    return {
      id: course.id,
      slug: course.slug,
      title: course.title,
      lessonCount: course.lessonCount,
      open: opened(course),
      enrolled: Boolean(progress),
      percent: progress?.percent ?? 0,
      finished: done(course),
      current: index === currentIndex,
    };
  });

  const next = currentIndex >= 0 ? steps[currentIndex] : undefined;
  const lessons = courses.reduce((sum, course) => sum + course.lessonCount, 0);
  const minutes = courses.reduce((sum, course) => sum + course.minutes, 0);
  const completed = mine.reduce((sum, course) => sum + course.progress.completed, 0);

  const open = (step: TrailStep) => router.push(`/course/${step.slug}`);

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: palette.bg }}>
      {/* The same back affordance every pushed screen here carries; the stack
          draws no header (see the root layout). */}
      <Pressable
        onPress={() => router.back()}
        style={{ padding: space.lg, paddingBottom: space.sm, flexDirection: "row", gap: 6 }}
      >
        <Ionicons name="chevron-back" size={20} color={palette.ink3} />
        <Txt variant="small" tone="dim">
          {t.actions.back}
        </Txt>
      </Pressable>

      <ScrollView
        contentContainerStyle={{ padding: space.lg, paddingTop: 0, paddingBottom: space.xxl, gap: space.xl }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={palette.ink3} />
        }
      >
        <View style={{ gap: space.xs }}>
          <Txt variant="display">{t.guide.thanks.title}</Txt>
          <Txt variant="small" tone="dim">
            {t.guide.thanks.body}
          </Txt>
        </View>

        {next ? (
          <Card>
            <Txt variant="micro" tone="dim">
              {t.guide.trail.step.replace("{n}", String(currentIndex + 1))}
            </Txt>
            <View style={{ marginTop: space.xs, marginBottom: space.md }}>
              <Txt variant="title">{next.title}</Txt>
            </View>
            <Button
              label={next.enrolled ? t.guide.trail.continue : t.guide.trail.start}
              onPress={() => open(next)}
            />
          </Card>
        ) : null}

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.sm }}>
          <Stat label={t.guide.stats.courses} value={groupDigits(courses.length)} />
          <Stat label={t.guide.stats.lessons} value={groupDigits(lessons)} />
          <Stat label={t.guide.stats.hours} value={formatDuration(minutes, locale)} />
          <Stat label={t.guide.stats.progress} value={groupDigits(completed)} />
        </View>

        <View style={{ gap: space.md }}>
          <View style={{ gap: space.xs }}>
            <Txt variant="title">{t.guide.trail.title}</Txt>
            <Txt variant="small" tone="dim">
              {t.guide.trail.deck}
            </Txt>
          </View>
          <Trail steps={steps} t={t} onOpen={open} />
        </View>

        <Card>
          <Txt variant="heading">{t.guide.tips.title}</Txt>
          <View style={{ gap: space.sm, marginTop: space.xs }}>
            {[t.guide.tips.one, t.guide.tips.two, t.guide.tips.three].map((tip, index) => (
              <View key={tip} style={{ flexDirection: "row", gap: space.sm }}>
                <Txt variant="small" tone="dim">
                  {index + 1}.
                </Txt>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Txt variant="small" tone="muted">
                    {tip}
                  </Txt>
                </View>
              </View>
            ))}
          </View>
          <View style={{ marginTop: space.sm }}>
            <Txt variant="small" tone="dim">
              {t.guide.tips.help}
            </Txt>
          </View>
        </Card>

        <Markdown source={t.guide.body} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  const { palette } = useIntl();
  return (
    <View
      style={{
        flexGrow: 1,
        flexBasis: "45%",
        minWidth: 0,
        gap: 2,
        padding: space.md,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: palette.line,
        backgroundColor: palette.panel,
      }}
    >
      <Txt variant="heading">{value}</Txt>
      <Txt variant="micro" tone="dim">
        {label}
      </Txt>
    </View>
  );
}
