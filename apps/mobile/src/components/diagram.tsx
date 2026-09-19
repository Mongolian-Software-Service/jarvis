import { Text, View } from "react-native";
import { fonts, radius, space, type MdStep } from "@jarvis/core";
import { useSettings } from "@/lib/settings";

/**
 * A ```diagram block, drawn as a column.
 *
 * The web lays the same steps out in a row from `sm` up; a phone never has the
 * width for that, so this is the column half of the pair and there is no second
 * layout to keep in step. The connector is a short vertical rule with a chevron
 * rather than a drawn arrowhead — `▾` is in every font the app bundles, and a
 * shape would have been an asset to ship for four pixels of line.
 */
export function Diagram({ steps }: { steps: readonly MdStep[] }) {
  const { palette } = useSettings();

  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: palette.line,
        borderRadius: radius.md,
        padding: space.md,
        gap: 2,
      }}
    >
      {steps.map((step, index) => (
        <View key={index} style={{ gap: 2 }}>
          <View
            style={{
              backgroundColor: palette.panel,
              borderWidth: 1,
              borderColor: palette.line,
              borderRadius: radius.sm,
              paddingVertical: space.sm,
              paddingHorizontal: space.md,
            }}
          >
            <View style={{ flexDirection: "row", gap: 6 }}>
              <Text style={{ fontFamily: fonts.regular, fontSize: 11, color: palette.ink3 }}>
                {index + 1}
              </Text>
              <Text
                style={{
                  flex: 1,
                  fontFamily: fonts.medium,
                  fontSize: 14,
                  lineHeight: 20,
                  color: palette.ink,
                }}
              >
                {step.label}
              </Text>
            </View>
            {step.note ? (
              <Text
                style={{
                  fontFamily: fonts.regular,
                  fontSize: 13,
                  lineHeight: 19,
                  color: palette.ink3,
                  marginTop: 3,
                  marginLeft: 17,
                }}
              >
                {step.note}
              </Text>
            ) : null}
          </View>

          {index < steps.length - 1 ? (
            <Text
              style={{
                fontFamily: fonts.regular,
                fontSize: 12,
                color: palette.ink3,
                textAlign: "center",
              }}
            >
              ▾
            </Text>
          ) : null}
        </View>
      ))}
    </View>
  );
}
