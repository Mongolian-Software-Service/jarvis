import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import * as SystemUI from "expo-system-ui";
import { useFonts } from "expo-font";
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from "@expo-google-fonts/inter";
import { JetBrainsMono_400Regular } from "@expo-google-fonts/jetbrains-mono";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { palette } from "@jarvis/core";
import { AuthProvider } from "@/lib/auth";
import { SettingsProvider } from "@/lib/settings";

void SplashScreen.preventAutoHideAsync();

/**
 * The app's one root.
 *
 * Three weights of Inter and one of JetBrains Mono, loaded before anything
 * paints. Inter is the same face the web uses and carries the two Mongolian
 * vowels that Google's plain `cyrillic` subset leaves out — `pnpm --filter
 * @jarvis/mobile test` proves it against the actual TTF, because on a phone
 * there is no fallback chain to rescue a missing glyph.
 */
export default function RootLayout() {
  const [loaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    JetBrainsMono_400Regular,
  });

  useEffect(() => {
    if (loaded) void SplashScreen.hideAsync();
  }, [loaded]);

  // Held rather than rendered unstyled: the splash is still up, and one frame
  // of system-font Mongolian is worse than one frame of nothing.
  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SettingsProvider>
          <AuthProvider>
            <Shell />
          </AuthProvider>
        </SettingsProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

/**
 * The window behind the React tree, and the status bar above it.
 *
 * `SystemUI.setBackgroundColorAsync` paints the window itself — without it, a
 * swipe past the end of a list shows white through the gap on Android whatever
 * the screens are painted. The bar's content is light because the ground is
 * always dark (CLAUDE.md §4); nothing reads a preference to decide it.
 */
function Shell() {
  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(palette.bg);
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: palette.bg },
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" options={{ presentation: "modal", animation: "slide_from_bottom" }} />
        <Stack.Screen name="course/[slug]" />
        <Stack.Screen name="lesson/[course]/[lesson]" />
      </Stack>
    </>
  );
}
