import { useCallback } from "react";
import { Linking, RefreshControl, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  BUNDLE_FULL_PRICE_MNT,
  BUNDLE_PRICE_MNT,
  BUNDLE_SAVING_MNT,
  SITE_URL,
  coursesPath,
  fmt,
  formatDuration,
  formatMoney,
  groupDigits,
  space,
  type CourseCard,
  type Locale,
  type Strings,
} from "@jarvis/core";
import { useIntl } from "@/lib/settings";
import { useAsync } from "@/lib/use-async";
import { listCourses } from "@/lib/queries";
import { CourseCardView } from "@/components/course-card";
import { Button, Card, Empty, Loading, Txt } from "@/components/ui";

/** The catalogue. Public — a signed-out visitor can browse and read a preview. */
export default function CatalogueScreen() {
  const { locale, t, palette } = useIntl();

  const read = useCallback(() => listCourses(locale), [locale]);
  const { data, loading, refreshing, refresh } = useAsync(read, [locale]);
  const courses = data ?? [];

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

        {/*
         * The offer, before the list — the cards carry no price of their own
         * (§1), so without this the phone would show six courses and never say
         * what they cost. No level filter above it: filtering implies a choice
         * to make, which is the opposite of what this panel says, and the web
         * catalogue dropped its own for the same reason.
         */}
        {courses.length > 1 ? <BundleCard courses={courses} locale={locale} t={t} /> : null}

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

/** The same offer the web catalogue leads with, drawn for a narrow screen. */
function BundleCard({
  courses,
  locale,
  t,
}: {
  courses: CourseCard[];
  locale: Locale;
  t: Strings;
}) {
  const lessons = courses.reduce((sum, course) => sum + course.lessonCount, 0);
  const minutes = courses.reduce((sum, course) => sum + course.minutes, 0);

  return (
    <Card style={{ gap: space.md }}>
      <View style={{ gap: space.xs }}>
        <Txt variant="title">{t.learn.bundle.title}</Txt>
        <Txt variant="small" tone="dim">
          {fmt(t.learn.bundle.deck, {
            courses: groupDigits(courses.length),
            lessons: groupDigits(lessons),
            hours: formatDuration(minutes, locale),
          })}
        </Txt>
      </View>

      <View style={{ flexDirection: "row", alignItems: "baseline", gap: space.sm }}>
        <Txt variant="display">{formatMoney(BUNDLE_PRICE_MNT, locale)}</Txt>
        <Txt variant="small" tone="dim" style={{ textDecorationLine: "line-through" }}>
          {formatMoney(BUNDLE_FULL_PRICE_MNT, locale)}
        </Txt>
        <Txt variant="small" tone="ok">
          {fmt(t.learn.bundle.save, { amount: formatMoney(BUNDLE_SAVING_MNT, locale) })}
        </Txt>
      </View>

      {/* Bought on the website, never in the app — Apple's 3.1.1, ADR #009. */}
      <Button
        label={t.learn.course.buyOnWeb}
        onPress={() => void Linking.openURL(`${SITE_URL}${coursesPath(locale)}`)}
        full
      />
      <Txt variant="micro" tone="dim">
        {t.learn.course.buyOnWebNote}
      </Txt>
    </Card>
  );
}
