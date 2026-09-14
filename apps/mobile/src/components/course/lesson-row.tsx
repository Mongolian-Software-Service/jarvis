import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { space, type LessonOutline } from "@jarvis/core";
import { router } from "expo-router";
import { useIntl } from "@/lib/settings";
import { Badge, Txt } from "@/components/ui";

/**
 * One lesson in the syllabus: its number, what it is, and whether it opens.
 *
 * A locked row is not a link — tapping through to a refusal wastes the tap.
 */
export function LessonRow({
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
