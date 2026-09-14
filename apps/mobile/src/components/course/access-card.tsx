import { Linking, View } from "react-native";
import {
  BUNDLE_PRICE_MNT,
  SITE_URL,
  coursePath,
  formatMoney,
  space,
  type CourseDetail,
  type Locale,
  type Strings,
} from "@jarvis/core";
import { Badge, Button, Card, Txt } from "@/components/ui";

/**
 * What this course costs, or the button that opens it.
 *
 * A paid course is never sold here — Apple's 3.1.1 requires in-app purchase
 * for digital content sold inside an iOS app and Bonum is not that (decision
 * #009) — so the button sends the buyer to the website, and the course opens
 * the moment they come back.
 */
export function AccessCard({
  course,
  locale,
  t,
  access,
  userId,
  busy,
  open,
  take,
}: {
  course: CourseDetail;
  locale: Locale;
  t: Strings;
  access: boolean;
  userId: string | null;
  busy: boolean;
  open: () => void;
  take: () => void;
}) {
  return (
        <Card>
          {/* A paid course has no price of its own (§1): the panel quotes the
              one price, and the note says it opens all of them. */}
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            {course.isFree ? (
              <Txt variant="title" tone="ok">
                {t.learn.course.free}
              </Txt>
            ) : (
              <View>
                <Txt variant="micro" tone="dim">
                  {t.learn.bundle.allCourses}
                </Txt>
                <Txt variant="title">{formatMoney(BUNDLE_PRICE_MNT, locale)}</Txt>
              </View>
            )}
            {access ? <Badge label={t.learn.course.enrolled} tone="ok" /> : null}
          </View>

          {access ? (
            <Button label={t.learn.course.continue} onPress={() => void open()} full />
          ) : course.isFree ? (
            <Button
              label={userId ? t.learn.course.startFree : t.learn.course.signInToStart}
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
                {t.learn.bundle.onlyTogether} {t.learn.course.buyOnWebNote}
              </Txt>
            </View>
          )}
        </Card>
  );
}
