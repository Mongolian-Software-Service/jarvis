import { ScrollView, StyleSheet, Text, View } from "react-native";
import { fonts, highlight, radius, space, type TokenKind, type Palette } from "@jarvis/core";
import { useSettings } from "@/lib/settings";

/**
 * A code block, drawn from the same tokens the web draws.
 *
 * `highlight()` returns lines of tokens rather than an HTML string precisely so
 * this file can exist (CLAUDE.md §4.5). Nothing is parsed twice and nothing can
 * drift: change the lexer and both platforms change together.
 *
 * The block scrolls horizontally inside itself. Long lines are normal in code,
 * and a screen that scrolls sideways as a whole is not.
 */
function tokenColor(kind: TokenKind, palette: Palette): string {
  switch (kind) {
    case "keyword":
      return palette.tokKeyword;
    case "string":
      return palette.tokString;
    case "comment":
      return palette.tokComment;
    case "number":
      return palette.tokNumber;
    case "function":
      return palette.tokFunction;
    case "tag":
      return palette.tokTag;
    case "attr":
      return palette.tokAttr;
    case "punct":
      return palette.ink3;
    default:
      return palette.ink;
  }
}

export function CodeBlock({
  code,
  language,
  title,
}: {
  code: string;
  language?: string | null;
  title?: string;
}) {
  const { palette } = useSettings();
  const lines = highlight(code.replace(/\n+$/, ""), language);

  return (
    <View
      style={{
        backgroundColor: palette.codeBg,
        borderColor: palette.codeLine,
        borderWidth: StyleSheet.hairlineWidth * 2,
        borderRadius: radius.md,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          paddingHorizontal: space.md,
          paddingVertical: 6,
          borderBottomWidth: StyleSheet.hairlineWidth * 2,
          borderBottomColor: palette.codeLine,
        }}
      >
        <Text style={{ fontFamily: fonts.mono, fontSize: 10, color: palette.ink3 }}>
          {title ?? language ?? "code"}
        </Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ padding: space.md }}>
          {lines.map((tokens, index) => (
            <Text
              key={index}
              style={{ fontFamily: fonts.mono, fontSize: 12.5, lineHeight: 20 }}
            >
              <Text style={{ color: palette.ink3, opacity: 0.6 }}>
                {String(index + 1).padStart(2, " ")}  
              </Text>
              {tokens.map((token, position) => (
                <Text key={position} style={{ color: tokenColor(token.kind, palette) }}>
                  {token.text}
                </Text>
              ))}
              {tokens.length === 0 ? " " : null}
            </Text>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
