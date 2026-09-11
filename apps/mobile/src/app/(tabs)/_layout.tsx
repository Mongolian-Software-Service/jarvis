import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet } from "react-native";
import { fonts } from "@jarvis/core";
import { useSettings } from "@/lib/settings";

/**
 * Three tabs, and the catalogue is public.
 *
 * A signed-out visitor can browse and read a preview lesson, exactly as on the
 * web — the other two tabs ask them to sign in *inside* the tab rather than
 * bouncing them to a form they did not ask for.
 */
export default function TabsLayout() {
  const { palette, t } = useSettings();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.ink,
        tabBarInactiveTintColor: palette.ink3,
        tabBarStyle: {
          backgroundColor: palette.panel,
          borderTopColor: palette.line,
          borderTopWidth: StyleSheet.hairlineWidth * 2,
        },
        tabBarLabelStyle: { fontFamily: fonts.medium, fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t.nav.courses,
          tabBarIcon: ({ color, size }) => <Ionicons name="library-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: t.nav.learn,
          tabBarIcon: ({ color, size }) => <Ionicons name="play-circle-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: t.nav.account,
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
