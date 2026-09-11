import { useCallback, useMemo, useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COURSE_LEVELS, fmt, levelLabel, radius, space, type CourseLevel } from "@jarvis/core";
import { useIntl } from "@/lib/settings";
import { useAsync } from "@/lib/use-async";
import { listCourses } from "@/lib/queries";
import { CourseCardView } from "@/components/course-card";
import { Empty, Loading, Txt } from "@/components/ui";

/** The catalogue. Public — a signed-out visitor can browse and read a preview. */
export default function CatalogueScreen() {
  const { locale, t, palette } = useIntl();
  const [level, setLevel] = useState<CourseLevel | null>(null);

  const read = useCallback(() => listCourses(locale), [locale]);
  const { data, loading, refreshing, refresh } = useAsync(read, [locale]);

  const courses = useMemo(
    () => (data ?? []).filter((course) => !level || course.level === level),
    [data, level],
  );

  if (loading && !data) return <Loading />;

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: palette.bg }}>
      <ScrollView
        contentContainerStyle={{ padding: space.lg, paddingBottom: space.xxl, gap: space.lg }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={palette.ink3} />
        }
      >
        <View style={{ gap: space.xs }}>
          <Txt variant="display">{t.learn.catalogue.title}</Txt>
          <Txt variant="small" tone="dim">
            {t.learn.catalogue.deck}
          </Txt>
        </View>

        {/* Pills, like every other control in this design (§4). */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: "row", gap: space.sm }}>
            <Chip label={t.learn.catalogue.all} active={!level} onPress={() => setLevel(null)} />
            {COURSE_LEVELS.map((option) => (
              <Chip
                key={option}
                label={levelLabel(option, locale)}
                active={level === option}
                onPress={() => setLevel(level === option ? null : option)}
              />
            ))}
          </View>
        </ScrollView>

        {courses.length === 0 ? (
          <Empty title={t.learn.catalogue.empty} />
        ) : (
          <View style={{ gap: space.lg }}>
            <Txt variant="micro" tone="dim">
              {fmt(t.learn.catalogue.count, { count: courses.length })}
            </Txt>
            {courses.map((course) => (
              <CourseCardView key={course.id} course={course} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const { palette } = useIntl();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        paddingHorizontal: space.md,
        paddingVertical: 6,
        borderRadius: radius.pill,
        backgroundColor: active ? palette.solid : "transparent",
        borderWidth: StyleSheet.hairlineWidth * 2,
        borderColor: active ? "transparent" : palette.line,
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <Txt variant="small" tone={active ? "solid" : "dim"}>
        {label}
      </Txt>
    </Pressable>
  );
}
