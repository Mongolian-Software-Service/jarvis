import { Stack } from "expo-router";
import { useSettings } from "@/lib/settings";

export default function AuthLayout() {
  const { palette } = useSettings();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: palette.bg },
      }}
    />
  );
}
