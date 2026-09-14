import { Linking, Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { fmt, handbookFor, radius, space, type Strings } from "@jarvis/core";
import { useIntl } from "@/lib/settings";
import { apiUrl } from "@/lib/supabase";
import { Txt } from "@/components/ui";

/**
 * The printed companion, for the courses that have one.
 *
 * `handbookFor` and the file path come from `@jarvis/core`, so the phone offers
 * exactly the handbooks the website does — adding one is a line in that map and
 * both platforms pick it up.
 *
 * The PDF is opened by the phone rather than drawn here: iOS and Android both
 * have a reader that handles a document better than a bundled viewer would, and
 * it is a public file, deliberately outside the paywall, so no session travels
 * with the request. `apiUrl` is the website's origin — the file is served by the
 * web app, not by Supabase.
 */
export function HandbookRow({ slug, t }: { slug: string; t: Strings }) {
  const { palette } = useIntl();
  const handbook = handbookFor(slug);
  if (!handbook) return null;

  const copy = t.learn.course.handbook;
  const url = `${apiUrl}${handbook.file}`;

  return (
    <Pressable
      onPress={() => void Linking.openURL(url)}
      accessibilityRole="link"
      accessibilityLabel={`${copy.title} — ${copy.open}`}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        gap: space.md,
        padding: space.lg,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: palette.line,
        backgroundColor: palette.panel,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Ionicons name="document-text-outline" size={20} color={palette.ink2} />
      <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
        <Txt variant="heading">{copy.title}</Txt>
        <Txt variant="micro" tone="dim">
          {fmt(copy.meta, { pages: handbook.pages, size: handbook.sizeKb })}
        </Txt>
      </View>
      <Ionicons name="open-outline" size={16} color={palette.ink3} />
    </Pressable>
  );
}
