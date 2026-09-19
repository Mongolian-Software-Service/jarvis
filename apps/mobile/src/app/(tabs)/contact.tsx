import { Linking, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { CONTACT, radius, space, telHref, type ContactChannel } from "@jarvis/core";
import { useIntl } from "@/lib/settings";
import { Card, Txt } from "@/components/ui";
import { FeedbackBox } from "@/components/contact/feedback-box";

/**
 * How to reach the school, and how to tell it something.
 *
 * It is a tab rather than a row inside settings for the reason the web gives it
 * one: somebody whose payment went wrong has to be able to reach a person, and
 * a support route two taps deep is a support route people give up on.
 *
 * The channels come from `CONTACT` in `@jarvis/core` — the same four values the
 * website prints — and an empty one is not drawn at all, so emptying a line in
 * core removes it from both platforms at once.
 */

type Channel = {
  key: ContactChannel;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  display: string;
  href: string;
  note: string;
};

/** `facebook.com/x` reads as an address; the full URL reads as markup. */
function handle(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
}

export default function ContactScreen() {
  const { t, palette } = useIntl();
  const copy = t.marketing.contact;

  const channels: Channel[] = [];
  if (CONTACT.email) {
    channels.push({
      key: "email", icon: "mail-outline", label: copy.channels.email.label,
      display: CONTACT.email, href: `mailto:${CONTACT.email}`, note: copy.channels.email.note,
    });
  }
  if (CONTACT.phone) {
    channels.push({
      key: "phone", icon: "call-outline", label: copy.channels.phone.label,
      display: CONTACT.phone, href: telHref(CONTACT.phone), note: copy.channels.phone.note,
    });
  }
  if (CONTACT.facebook) {
    channels.push({
      key: "facebook", icon: "logo-facebook", label: copy.channels.facebook.label,
      display: handle(CONTACT.facebook), href: CONTACT.facebook, note: copy.channels.facebook.note,
    });
  }
  if (CONTACT.instagram) {
    channels.push({
      key: "instagram", icon: "logo-instagram", label: copy.channels.instagram.label,
      display: handle(CONTACT.instagram), href: CONTACT.instagram, note: copy.channels.instagram.note,
    });
  }

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: palette.bg }}>
      <ScrollView
        contentContainerStyle={{ padding: space.lg, paddingBottom: space.xxl, gap: space.xl }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ gap: space.xs }}>
          <Txt variant="display">{copy.title}</Txt>
          <Txt variant="small" tone="dim">
            {copy.deck}
          </Txt>
        </View>

        <View style={{ gap: space.sm }}>
          {channels.map((channel) => (
            <Pressable
              key={channel.key}
              onPress={() => void Linking.openURL(channel.href)}
              accessibilityRole="link"
              accessibilityLabel={`${channel.label}: ${channel.display}`}
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <Card>
                <View style={{ flexDirection: "row", gap: space.md, alignItems: "flex-start" }}>
                  <View
                    style={{
                      width: 36, height: 36, borderRadius: radius.md,
                      alignItems: "center", justifyContent: "center",
                      backgroundColor: palette.panel2,
                    }}
                  >
                    <Ionicons name={channel.icon} size={18} color={palette.ink2} />
                  </View>
                  <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
                    <Txt variant="micro" tone="dim">
                      {channel.label}
                    </Txt>
                    <Txt variant="body">{channel.display}</Txt>
                    <Txt variant="micro" tone="dim">
                      {channel.note}
                    </Txt>
                  </View>
                </View>
              </Card>
            </Pressable>
          ))}
        </View>

        <FeedbackBox />

        {[copy.response, copy.support].map((block) => (
          <View key={block.title} style={{ gap: space.xs }}>
            <Txt variant="heading">{block.title}</Txt>
            <Txt variant="small" tone="dim">
              {block.body}
            </Txt>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
