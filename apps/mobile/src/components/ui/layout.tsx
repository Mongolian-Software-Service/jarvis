import type { ReactNode } from "react";
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { radius, space } from "@jarvis/core";
import { useSettings } from "@/lib/settings";

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
