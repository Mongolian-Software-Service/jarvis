import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { radius, space, type CourseStats } from "@jarvis/core";
import { useIntl } from "@/lib/settings";
import { Progress, Txt } from "@/components/ui";

/**
 * The two blocks the dashboard is assembled from: one number, and the card
 * that opens a course. They are here rather than in the screen because the
 * screen's job is to decide *what* to show — and a file that both decides and
 * draws is a file where the deciding is hard to find.
 */
export function Stat({
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

export function OpenCourse({
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
