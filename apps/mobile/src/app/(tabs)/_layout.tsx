import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet } from "react-native";
import { fonts } from "@jarvis/core";
import { useSettings } from "@/lib/settings";

/**
 * Five tabs, and the catalogue is public.
 *
 * A signed-out visitor can browse and read a preview lesson, exactly as on the
 * web — the tabs that need an account ask them to sign in *inside* the tab
 * rather than bouncing them to a form they did not ask for.
 *
 * The set is the web's, with one deliberate difference: the phone keeps a
 * catalogue tab. On the web a stranger arrives through a marketing site and the
 * catalogue is one of its pages; the phone has no marketing site, so browsing
 * is the front door and cannot be two taps inside somebody else's dashboard.
 * «Холбоо» earns its place for the reason it does there — somebody whose
 * payment went wrong has to be able to reach a person.
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
        name="dashboard"
        options={{
          title: t.nav.tab.dashboard,
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: t.nav.tab.courses,
          tabBarIcon: ({ color, size }) => <Ionicons name="library-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: t.nav.tab.learn,
          tabBarIcon: ({ color, size }) => <Ionicons name="play-circle-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="contact"
        options={{
          title: t.nav.tab.contact,
          tabBarIcon: ({ color, size }) => <Ionicons name="chatbubble-ellipses-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: t.nav.tab.account,
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
