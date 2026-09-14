import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { radius, space, type QuizItem } from "@jarvis/core";
import { useSettings } from "@/lib/settings";
import { Txt } from "../ui";

/**
 * The four answers, and what the card says once one is checked.
 *
 * Colour alone never carries the verdict — a tick and a cross sit in the
 * bullet — because a red and a green pill are the same pill to a good number
 * of readers.
 */
export function QuizOptions({
  question,
  picked,
  setPicked,
  checked,
  right,
  t,
}: {
  question: QuizItem;
  picked: number | null;
  setPicked: (value: number) => void;
  checked: boolean;
  right: boolean;
  t: { learn: { quiz: { correct: string; wrong: string } } };
}) {
  const { palette } = useSettings();

  return (
    <>
      <View style={{ gap: space.sm }}>
        {question.options.map((option, position) => {
          const isPicked = picked === position;
          const isAnswer = position === question.correctIndex;
          const revealed = checked && isAnswer;
          const wrong = checked && isPicked && !isAnswer;

          return (
            <Pressable
              key={position}
              disabled={checked}
              onPress={() => setPicked(position)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: space.md,
                padding: space.md,
                borderRadius: radius.md,
                borderWidth: StyleSheet.hairlineWidth * 2,
                borderColor: revealed
                  ? palette.ok
                  : wrong
                    ? palette.bad
                    : isPicked
                      ? palette.accent
                      : palette.line,
                backgroundColor: revealed
                  ? palette.okSoft
                  : wrong
                    ? palette.badSoft
                    : isPicked
                      ? palette.accentSoft
                      : "transparent",
              }}
            >
              <View
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: radius.pill,
                  borderWidth: StyleSheet.hairlineWidth * 2,
                  borderColor: isPicked ? palette.accent : palette.lineStrong,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {revealed ? (
                  <Ionicons name="checkmark" size={13} color={palette.ok} />
                ) : wrong ? (
                  <Ionicons name="close" size={13} color={palette.bad} />
                ) : (
                  <Txt variant="micro" tone={isPicked ? "accent" : "dim"}>
                    {String.fromCharCode(65 + position)}
                  </Txt>
                )}
              </View>
              <Txt variant="small" style={{ flex: 1 }}>
                {option}
              </Txt>
            </Pressable>
          );
        })}
      </View>
    </>
  );
}
