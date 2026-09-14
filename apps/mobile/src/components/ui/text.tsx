import type { ReactNode } from "react";
import { Text, type StyleProp, type TextStyle } from "react-native";
import { fonts, type } from "@jarvis/core";
import { useSettings } from "@/lib/settings";
import { FAMILY, toneColor, type Tone, type Variant } from "./tone";

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
