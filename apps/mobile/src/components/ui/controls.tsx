import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { fonts, radius, space } from "@jarvis/core";
import { useSettings } from "@/lib/settings";

export function Button({
  label,
  onPress,
  variant = "primary",
  busy = false,
  disabled = false,
  icon,
  full = false,
}: {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost";
  busy?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  full?: boolean;
}) {
  const { palette } = useSettings();

  const background =
    variant === "primary" ? palette.solid : variant === "secondary" ? palette.panel2 : "transparent";
  const color =
    variant === "primary" ? palette.solidInk : variant === "ghost" ? palette.ink3 : palette.ink;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || busy}
      style={({ pressed }) => [
        {
          height: 40,
          paddingHorizontal: space.lg,
          borderRadius: radius.pill,
          backgroundColor: background,
          borderWidth: variant === "secondary" ? StyleSheet.hairlineWidth * 2 : 0,
          borderColor: palette.line,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: space.sm,
          alignSelf: full ? "stretch" : "flex-start",
          opacity: disabled || busy ? 0.55 : pressed ? 0.85 : 1,
        },
      ]}
    >
      {busy ? <ActivityIndicator size="small" color={color} /> : icon}
      <Text
        style={{
          fontFamily: fonts.medium,
          fontSize: 14,
          color,
          letterSpacing: -0.1,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function Badge({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "neutral" | "ok" | "accent" | "warn";
}) {
  const { palette } = useSettings();
  const background =
    tone === "ok"
      ? palette.okSoft
      : tone === "accent"
        ? palette.accentSoft
        : tone === "warn"
          ? palette.warnSoft
          : palette.panel2;
  const color =
    tone === "ok"
      ? palette.ok
      : tone === "accent"
        ? palette.accent
        : tone === "warn"
          ? palette.warn
          : palette.ink3;

  return (
    <View
      style={{
        backgroundColor: background,
        borderRadius: radius.pill,
        paddingHorizontal: space.sm,
        paddingVertical: 2,
        alignSelf: "flex-start",
      }}
    >
      <Text style={{ fontFamily: fonts.medium, fontSize: 11, color, letterSpacing: 0.1 }}>
        {label}
      </Text>
    </View>
  );
}
