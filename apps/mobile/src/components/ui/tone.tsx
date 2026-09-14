import { fonts, type, type Palette } from "@jarvis/core";

/**
 * The design language of CLAUDE.md §4, in React Native.
 *
 * Same rules as the web and the same values (`palette` in `@jarvis/core`, kept
 * in step with globals.css by a test): pills for controls, weight 500/600 and
 * never bolder, translucent hairlines, a near-black ground.
 *
 * Weight comes from the **family name** — `Inter_500Medium` — and `fontWeight`
 * is never set. Setting both makes Android synthesise a second bold on top of
 * a font that already has one, and the text comes out smeared.
 */

export type Tone = "ink" | "muted" | "dim" | "accent" | "ok" | "warn" | "bad" | "solid";
export type Variant = keyof typeof type;

export function toneColor(tone: Tone, palette: Palette): string {
  switch (tone) {
    case "muted":
      return palette.ink2;
    case "dim":
      return palette.ink3;
    case "accent":
      return palette.accent;
    case "ok":
      return palette.ok;
    case "warn":
      return palette.warn;
    case "bad":
      return palette.bad;
    case "solid":
      return palette.solidInk;
    default:
      return palette.ink;
  }
}

export const FAMILY: Record<string, string> = {
  "400": fonts.regular,
  "500": fonts.medium,
  "600": fonts.semibold,
};
