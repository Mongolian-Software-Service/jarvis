import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { GOOGLE_MARK, fonts, radius, space } from "@jarvis/core";
import { useIntl } from "@/lib/settings";
import { useAuth } from "@/lib/auth";
import { Txt } from "./ui";

/**
 * The same mark the web draws, from the same path data in `@jarvis/core`.
 *
 * `react-native-svg` earns its place here: Google's brand terms require their
 * four-colour "G" unmodified, and a monochrome glyph from an icon font — which
 * is what most Expo apps reach for — is not that mark.
 */
function GoogleMark({ size = 18 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox={GOOGLE_MARK.viewBox}>
      {GOOGLE_MARK.paths.map((path) => (
        <Path key={path.fill} fill={path.fill} d={path.d} />
      ))}
    </Svg>
  );
}

/**
 * One button for both doors.
 *
 * Google sign-in *is* sign-up when the address is new: Supabase creates the
 * account and the profiles trigger fills the name and picture out of the
 * claims. So the copy says "continue with", and this component is identical on
 * the sign-in and sign-up screens.
 *
 * A cancelled sign-in is silent. Somebody who backed out of the browser knows
 * they backed out, and an error banner for it reads as a fault.
 */
export function GoogleButton() {
  const { t, palette } = useIntl();
  const { signInWithGoogle } = useAuth();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  async function press() {
    setFailed(false);
    setBusy(true);
    const result = await signInWithGoogle();
    setBusy(false);
    if (!result.ok && !result.cancelled) setFailed(true);
  }

  return (
    <View style={{ gap: space.sm }}>
      <Pressable
        onPress={() => void press()}
        disabled={busy}
        accessibilityRole="button"
        style={({ pressed }) => ({
          height: 44,
          borderRadius: radius.pill,
          backgroundColor: palette.panel2,
          borderWidth: StyleSheet.hairlineWidth * 2,
          borderColor: palette.line,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: space.sm,
          opacity: busy ? 0.6 : pressed ? 0.85 : 1,
        })}
      >
        {busy ? <ActivityIndicator size="small" color={palette.ink} /> : <GoogleMark />}
        <Text style={{ fontFamily: fonts.medium, fontSize: 14, color: palette.ink }}>
          {busy ? t.auth.google.opening : t.auth.google.continue}
        </Text>
      </Pressable>

      {failed ? (
        <Txt variant="micro" tone="bad">
          {t.auth.google.failed}
        </Txt>
      ) : null}
    </View>
  );
}

/** A rule with a word in it. Only ever separates Google from the email form. */
export function OrDivider() {
  const { t, palette } = useIntl();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: space.md }}>
      <View style={{ flex: 1, height: StyleSheet.hairlineWidth * 2, backgroundColor: palette.line }} />
      <Txt variant="micro" tone="dim">
        {t.auth.google.or}
      </Txt>
      <View style={{ flex: 1, height: StyleSheet.hairlineWidth * 2, backgroundColor: palette.line }} />
    </View>
  );
}
