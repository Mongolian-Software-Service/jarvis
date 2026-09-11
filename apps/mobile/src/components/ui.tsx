import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { fonts, radius, space, type, type Palette } from "@jarvis/core";
import { useSettings } from "@/lib/settings";

/**
 * The design language of CLAUDE.md §4, in React Native.
 *
 * Same rules as the web and the same values (`palette` in `@jarvis/core`, kept
 * in step with globals.css by a test): pills for controls, weight 500/600 and
 * never bolder, translucent hairlines, a near-black ground.
 *
 * Weight comes from the **family name** — `Inter_500Medium` — and `fontWeight`
 * is never set. Setting both makes Android synthesise a second bold on top of
 * a font that already has one, and the text comes out smeared.
 */

type Tone = "ink" | "muted" | "dim" | "accent" | "ok" | "warn" | "bad" | "solid";
type Variant = keyof typeof type;

function toneColor(tone: Tone, palette: Palette): string {
  switch (tone) {
    case "muted":
      return palette.ink2;
    case "dim":
      return palette.ink3;
    case "accent":
      return palette.accent;
    case "ok":
      return palette.ok;
    case "warn":
      return palette.warn;
    case "bad":
      return palette.bad;
    case "solid":
      return palette.solidInk;
    default:
      return palette.ink;
  }
}

const FAMILY: Record<string, string> = {
  "400": fonts.regular,
  "500": fonts.medium,
  "600": fonts.semibold,
};

export function Txt({
  variant = "body",
  tone = "ink",
  mono = false,
  center = false,
  style,
  numberOfLines,
  children,
}: {
  variant?: Variant;
  tone?: Tone;
  mono?: boolean;
  center?: boolean;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
  children: ReactNode;
}) {
  const { palette } = useSettings();
  const scale = type[variant];

  return (
    <Text
      numberOfLines={numberOfLines}
      style={[
        {
          fontFamily: mono ? fonts.mono : (FAMILY[scale.weight] ?? fonts.regular),
          fontSize: scale.size,
          lineHeight: scale.line,
          letterSpacing: scale.tracking,
          color: toneColor(tone, palette),
          textAlign: center ? "center" : "left",
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

export function Screen({
  children,
  scroll = true,
  padded = true,
}: {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
}) {
  const { palette } = useSettings();
  const body = (
    <View style={padded ? { padding: space.lg, gap: space.lg } : undefined}>{children}</View>
  );

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: palette.bg }}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={{ paddingBottom: space.xxl * 2 }}
          keyboardShouldPersistTaps="handled"
        >
          {body}
        </ScrollView>
      ) : (
        body
      )}
    </SafeAreaView>
  );
}

export function Card({
  children,
  style,
  padded = true,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
}) {
  const { palette } = useSettings();
  return (
    <View
      style={[
        {
          backgroundColor: palette.panel,
          borderColor: palette.line,
          borderWidth: StyleSheet.hairlineWidth * 2,
          borderRadius: radius.lg,
          overflow: "hidden",
        },
        padded && { padding: space.lg, gap: space.sm },
        style,
      ]}
    >
      {children}
    </View>
  );
}

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

/** A labelled text field, with the one message that belongs under it. */
export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <View style={{ gap: 6 }}>
      <Txt variant="small" tone="muted">
        {label}
      </Txt>
      {children}
      {error ? (
        <Txt variant="micro" tone="bad">
          {error}
        </Txt>
      ) : hint ? (
        <Txt variant="micro" tone="dim">
          {hint}
        </Txt>
      ) : null}
    </View>
  );
}

export function Input({ style, ...rest }: TextInputProps) {
  const { palette } = useSettings();
  return (
    <TextInput
      placeholderTextColor={palette.ink3}
      style={[
        {
          height: 44,
          paddingHorizontal: space.md,
          borderRadius: radius.md,
          backgroundColor: palette.panel2,
          borderWidth: StyleSheet.hairlineWidth * 2,
          borderColor: palette.line,
          color: palette.ink,
          fontFamily: fonts.regular,
          fontSize: 15,
        },
        style,
      ]}
      {...rest}
    />
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
