import { View } from "react-native";
import { router } from "expo-router";
import { space, type Strings } from "@jarvis/core";
import { Button } from "@/components/ui";

/** The tick, and where to go next. */
export function LessonActions({
  t,
  complete,
  mark,
  next,
  courseSlug,
}: {
  t: Strings;
  complete: boolean;
  mark: (value: boolean) => void;
  next: { slug: string } | null;
  courseSlug: string;
}) {
  return (
      <View style={{ gap: space.sm }}>
        <Button
          label={complete ? t.learn.player.marked : t.learn.player.markComplete}
          variant={complete ? "secondary" : "primary"}
          onPress={() => void mark(!complete)}
          full
          icon={null}
        />

        {next ? (
          <Button
            label={t.learn.player.nextLesson}
            variant="secondary"
            full
            onPress={() =>
              router.replace({
                pathname: "/lesson/[course]/[lesson]",
                params: { course: courseSlug, lesson: next.slug },
              })
            }
          />
        ) : (
          <Button
            label={t.learn.player.backToCourse}
            variant="secondary"
            full
            onPress={() => router.back()}
          />
        )}
      </View>
  );
}
