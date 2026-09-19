import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { radius, space, type Strings } from "@jarvis/core";
import { useIntl } from "@/lib/settings";
import { Progress, Txt } from "@/components/ui";
import type { TrailStep } from "./trail";
import { nodeTone, statusLabel } from "./trail";

/**
 * One stop on the road, and the flag at the end of it.
 *
 * Separated from `Trail` for the same reason the web's `trail/node.tsx` is:
 * the parent decides *which* steps exist and in what state, and this decides
 * what one looks like. Two jobs, two files.
 */
export function Step({
  step,
  index,
  t,
  onPress,
}: {
  step: TrailStep;
  index: number;
  t: Strings;
  onPress: () => void;
}) {
  const { palette } = useIntl();
  const tone = nodeTone(step, palette);

  return (
    <Pressable
      onPress={step.open ? onPress : undefined}
      accessibilityRole={step.open ? "button" : undefined}
      accessibilityLabel={`${step.title} — ${statusLabel(step, t)}`}
      style={({ pressed }) => ({
        flexDirection: "row",
        gap: space.md,
        opacity: pressed && step.open ? 0.7 : 1,
      })}
    >
      {/* The node, and the line that carries the eye to the next one. */}
      <View style={{ alignItems: "center", width: 40 }}>
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            borderWidth: 1.5,
            borderColor: tone.ring,
            backgroundColor: tone.fill,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {step.finished ? (
            <Ionicons name="checkmark" size={18} color={tone.ink} />
          ) : step.open ? (
            <Txt variant="small" style={{ color: tone.ink }}>
              {index + 1}
            </Txt>
          ) : (
            <Ionicons name="lock-closed" size={14} color={tone.ink} />
          )}
        </View>
        {/* Always drawn: the finish flag closes the column, so every course
            node has something below it to point at. */}
        <View style={{ flex: 1, width: 2, backgroundColor: palette.line, minHeight: space.lg }} />
      </View>

      <View style={{ flex: 1, minWidth: 0, paddingBottom: space.xl, gap: 4 }}>
        <Txt variant="micro" tone="dim">
          {t.guide.trail.step.replace("{n}", String(index + 1))}
        </Txt>
        <Txt variant="heading">{step.title}</Txt>

        {step.current ? (
          <View
            style={{
              alignSelf: "flex-start",
              marginTop: 2,
              paddingHorizontal: space.sm,
              paddingVertical: 2,
              borderRadius: radius.pill,
              backgroundColor: palette.accentSoft,
            }}
          >
            <Txt variant="micro" style={{ color: palette.accent }}>
              {t.guide.trail.here}
            </Txt>
          </View>
        ) : null}

        {step.enrolled && !step.finished && step.percent > 0 ? (
          <View style={{ marginTop: space.xs }}>
            <Progress value={step.percent} />
          </View>
        ) : null}

        <Txt variant="micro" tone="dim">
          {statusLabel(step, t)}
        </Txt>
      </View>
    </Pressable>
  );
}

/** The flag at the bottom: a step for the drawing, not one for the links. */
export function Finish({ t }: { t: Strings }) {
  const { palette } = useIntl();
  return (
    <View style={{ flexDirection: "row", gap: space.md }}>
      <View style={{ width: 40, alignItems: "center" }}>
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            borderWidth: 1.5,
            borderColor: palette.line,
            backgroundColor: palette.panel2,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="flag-outline" size={16} color={palette.ink3} />
        </View>
      </View>
      <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
        <Txt variant="heading">{t.guide.trail.finish}</Txt>
        <Txt variant="small" tone="dim">
          {t.guide.trail.finishBody}
        </Txt>
      </View>
    </View>
  );
}
