import type { ReactNode } from "react";
import { StyleSheet, TextInput, View, type TextInputProps } from "react-native";
import { fonts, radius, space } from "@jarvis/core";
import { useSettings } from "@/lib/settings";
import { Txt } from "./text";

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
