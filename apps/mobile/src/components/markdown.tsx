import { StyleSheet, Text, View } from "react-native";
import { fonts, parseMarkdown, radius, space, type MdBlock } from "@jarvis/core";
import { useSettings } from "@/lib/settings";
import { CodeBlock } from "./code";
import { Diagram } from "./diagram";
import { Inline } from "./markdown-inline";

/**
 * A lesson body, rendered from the shared parser's blocks.
 *
 * The web renders the same tree to HTML; this renders it to views. That is the
 * whole reason `parseMarkdown()` returns a typed tree instead of a string
 * (CLAUDE.md §4.5) — a library that emits HTML would have left this file with
 * nothing to work from.
 */
export function Markdown({ source }: { source: string }) {
  const blocks = parseMarkdown(source);
  return (
    <View style={{ gap: space.md }}>
      {blocks.map((block, index) => (
        <Block key={index} block={block} />
      ))}
    </View>
  );
}

function Block({ block }: { block: MdBlock }) {
  const { palette } = useSettings();

  switch (block.type) {
    case "heading": {
      const size = block.level === 1 ? 20 : block.level === 2 ? 17 : 15;
      return (
        <Text
          style={{
            fontFamily: fonts.semibold,
            fontSize: size,
            lineHeight: size * 1.3,
            letterSpacing: -0.3,
            color: palette.ink,
            marginTop: space.sm,
          }}
        >
          <Inline parts={block.content} />
        </Text>
      );
    }

    case "diagram":
      return <Diagram steps={block.steps} />;

    case "paragraph":
      return (
        <Text
          style={{
            fontFamily: fonts.regular,
            fontSize: 15,
            /* 1.75, not the reference's 1.5 — Cyrillic closes up (§4.3). */
            lineHeight: 26,
            color: palette.ink2,
          }}
        >
          <Inline parts={block.content} />
        </Text>
      );

    case "list":
      return (
        <View style={{ gap: space.sm }}>
          {block.items.map((item, index) => (
            <View key={index} style={{ flexDirection: "row", gap: space.sm }}>
              <Text
                style={{
                  fontFamily: fonts.regular,
                  fontSize: 15,
                  lineHeight: 26,
                  color: palette.ink3,
                  minWidth: 18,
                }}
              >
                {block.ordered ? `${index + 1}.` : "•"}
              </Text>
              <Text
                style={{
                  flex: 1,
                  fontFamily: fonts.regular,
                  fontSize: 15,
                  lineHeight: 26,
                  color: palette.ink2,
                }}
              >
                <Inline parts={item} />
              </Text>
            </View>
          ))}
        </View>
      );

    case "code":
      return <CodeBlock code={block.code} language={block.language} />;

    case "quote":
      return (
        <View
          style={{
            borderLeftWidth: 2,
            borderLeftColor: palette.accent,
            backgroundColor: palette.accentSoft,
            borderRadius: radius.sm,
            paddingVertical: space.md,
            paddingHorizontal: space.lg,
          }}
        >
          <Text
            style={{ fontFamily: fonts.regular, fontSize: 15, lineHeight: 24, color: palette.ink2 }}
          >
            <Inline parts={block.content} />
          </Text>
        </View>
      );

    case "rule":
      return (
        <View style={{ height: StyleSheet.hairlineWidth * 2, backgroundColor: palette.line }} />
      );
  }
}
