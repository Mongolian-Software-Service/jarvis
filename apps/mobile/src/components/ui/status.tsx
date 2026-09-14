import type { ReactNode } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { radius, space } from "@jarvis/core";
import { useSettings } from "@/lib/settings";
import { Txt } from "./text";
import { Card } from "./layout";

/**
 * A progress bar that says what it means.
 *
 * `accessibilityValue` carries the number, because the bar beside a course is
 * often the only thing saying how much of it is left.
 */
export function Progress({ value, tone = "accent" }: { value: number; tone?: "accent" | "ok" }) {
  const { palette } = useSettings();
  const clamped = Math.min(100, Math.max(0, Math.round(value)));

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: clamped }}
      style={{
        height: 6,
        borderRadius: radius.pill,
        backgroundColor: palette.panel3,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          width: `${clamped}%`,
          height: "100%",
          borderRadius: radius.pill,
          backgroundColor: tone === "ok" ? palette.ok : palette.accent,
        }}
      />
    </View>
  );
}

export function Divider() {
  const { palette } = useSettings();
  return <View style={{ height: StyleSheet.hairlineWidth * 2, backgroundColor: palette.line }} />;
}

export function Empty({ title, body, action }: { title: string; body?: string; action?: ReactNode }) {
  return (
    <Card style={{ alignItems: "center", paddingVertical: space.xxl }}>
      <Txt variant="heading" center>
        {title}
      </Txt>
      {body ? (
        <Txt variant="small" tone="dim" center>
          {body}
        </Txt>
      ) : null}
      {action}
    </Card>
  );
}

export function Loading() {
  const { palette } = useSettings();
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: palette.bg }}>
      <ActivityIndicator color={palette.ink3} />
    </View>
  );
}
