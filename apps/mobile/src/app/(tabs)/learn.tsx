import { useCallback } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { formatAgo, space } from "@jarvis/core";
import { useIntl } from "@/lib/settings";
import { useAuth } from "@/lib/auth";
import { useAsync } from "@/lib/use-async";
import { listMyCourses } from "@/lib/queries";
import { CourseCardView } from "@/components/course-card";
import { Button, Empty, Loading, Txt } from "@/components/ui";

/**
 * What this student holds.
 *
 * Signed out, this asks them to sign in *here* rather than redirecting: being
 * bounced to a form you did not open is the thing that makes people close an
 * app.
 */
export default function LearnScreen() {
  const { locale, t, palette } = useIntl();
  const { userId, ready } = useAuth();

  const read = useCallback(
    () => (userId ? listMyCourses(locale, userId) : Promise.resolve([])),
    [locale, userId],
  );
  const { data, loading, refreshing, refresh } = useAsync(read, [locale, userId]);

  if (!ready || (loading && !data)) return <Loading />;

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: palette.bg }}>
      <ScrollView
        contentContainerStyle={{ padding: space.lg, paddingBottom: space.xxl, gap: space.lg }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={palette.ink3} />
        }
      >
        <View style={{ gap: space.xs }}>
          <Txt variant="display">{t.learn.dashboard.title}</Txt>
          <Txt variant="small" tone="dim">
            {t.learn.dashboard.deck}
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
        ) : (data ?? []).length === 0 ? (
          <Empty
            title={t.learn.dashboard.empty}
            action={
              <View style={{ marginTop: space.md }}>
                <Button
                  label={t.learn.dashboard.emptyAction}
                  onPress={() => router.push("/")}
                  variant="secondary"
                />
              </View>
            }
          />
        ) : (
          <View style={{ gap: space.lg }}>
            {(data ?? []).map((course) => (
              <View key={course.id} style={{ gap: 6 }}>
                <CourseCardView course={course} progress={course.progress} />
                {course.lastActivity ? (
                  <Txt variant="micro" tone="dim">
                    {t.learn.dashboard.lastActivity} {formatAgo(course.lastActivity, locale)}
                  </Txt>
                ) : null}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
