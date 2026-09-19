import { Linking, Text } from "react-native";
import { fonts, type MdInline } from "@jarvis/core";
import { useSettings } from "@/lib/settings";

/**
 * The inline half of a lesson body: bold, italic, `code` and links.
 *
 * Split out from `markdown.tsx` when that file crossed the 160-line cap
 * (§3.1). The pressure was right — block layout and inline text styling are
 * two jobs, and a link's URL policy has nothing to say about how a list draws
 * its bullets.
 */
export function Inline({ parts }: { parts: MdInline[] }) {
  const { palette } = useSettings();

  return (
    <>
      {parts.map((part, index) => {
        switch (part.type) {
          case "strong":
            return (
              <Text key={index} style={{ fontFamily: fonts.semibold, color: palette.ink }}>
                {part.value}
              </Text>
            );
          case "em":
            return (
              <Text key={index} style={{ fontStyle: "italic" }}>
                {part.value}
              </Text>
            );
          case "code":
            return (
              <Text
                key={index}
                style={{ fontFamily: fonts.mono, fontSize: 13, color: palette.ink }}
              >
                {part.value}
              </Text>
            );
          case "link":
            return (
              <Text
                key={index}
                style={{ color: palette.accent }}
                onPress={() => {
                  // The parser already refused anything but http(s), mailto,
                  // tel and an in-app path, so this cannot open a javascript: URL.
                  void Linking.openURL(part.href).catch(() => {});
                }}
              >
                {part.value}
              </Text>
            );
          default:
            return <Text key={index}>{part.value}</Text>;
        }
      })}
    </>
  );
}
