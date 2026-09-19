import { View } from "react-native";
import type { Strings } from "@jarvis/core";
import { useIntl } from "@/lib/settings";
import { Finish, Step } from "./trail-node";

/**
 * The order the courses are meant to be taken in, drawn down the screen.
 *
 * The web draws this as a winding road with hand-tuned geometry. That is a
 * web-specific flourish, not the meaning — the meaning is *sequence*, and on a
 * phone a straight column with a connecting line says it in a fraction of the
 * code. Porting the road would have been a rewrite of arithmetic that exists to
 * dodge CSS problems React Native does not have.
 */

export type TrailStep = {
  id: string;
  slug: string;
  title: string;
  lessonCount: number;
  /** Can be opened now: enrolled in it, or it is the free track anybody may take. */
  open: boolean;
  /** Already enrolled, so the tap goes to the player rather than the sales page. */
  enrolled: boolean;
  percent: number;
  finished: boolean;
  /** The one to do next. Exactly one step carries this. */
  current: boolean;
};

export function Trail({
  steps,
  t,
  onOpen,
}: {
  steps: TrailStep[];
  t: Strings;
  onOpen: (step: TrailStep) => void;
}) {
  return (
    <View>
      {steps.map((step, index) => (
        <Step
          key={step.id}
          step={step}
          index={index}
          t={t}
          onPress={() => onOpen(step)}
        />
      ))}
      <Finish t={t} />
    </View>
  );
}

/** The colour a node carries is its state, and there are only four. */
export function nodeTone(step: TrailStep, palette: ReturnType<typeof useIntl>["palette"]) {
  if (step.finished) return { ring: palette.ok, fill: palette.okSoft, ink: palette.ok };
  if (step.current) return { ring: palette.accent, fill: palette.accentSoft, ink: palette.accent };
  if (step.open) return { ring: palette.line, fill: palette.panel2, ink: palette.ink2 };
  return { ring: palette.line, fill: palette.panel, ink: palette.ink3 };
}

export function statusLabel(step: TrailStep, t: Strings): string {
  const copy = t.guide.trail;
  if (step.finished) return copy.done;
  if (!step.open) return copy.locked;
  if (step.enrolled && step.percent > 0) return copy.continue;
  return step.current ? copy.start : copy.open;
}
