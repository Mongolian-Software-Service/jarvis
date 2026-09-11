/**
 * The palette, as values.
 *
 * The web reads its colours from CSS custom properties, which React Native
 * cannot do — so the same design language has to exist here as plain data for
 * `apps/mobile` to style with. **These values and the ones in
 * `apps/web/src/app/globals.css` are the same design and must stay identical**;
 * `test/theme.test.ts` reads that stylesheet and fails if they drift, which is
 * the only thing standing between one palette and two.
 *
 * Only the values live here. The *rules* — pills, weight 510, translucent
 * hairlines — are in CLAUDE.md §4 and are followed by both platforms.
 */
export type Palette = {
  bg: string;
  panel: string;
  panel2: string;
  panel3: string;
  line: string;
  lineStrong: string;
  ink: string;
  ink2: string;
  ink3: string;
  solid: string;
  solidHover: string;
  solidInk: string;
  accent: string;
  accentHover: string;
  accentSoft: string;
  accentInk: string;
  ok: string;
  okSoft: string;
  warn: string;
  warnSoft: string;
  bad: string;
  badSoft: string;
  codeBg: string;
  codeLine: string;
  tokKeyword: string;
  tokString: string;
  tokComment: string;
  tokNumber: string;
  tokFunction: string;
  tokTag: string;
  tokAttr: string;
};

/**
 * The palette. One of them — there is no light edition (CLAUDE.md §4).
 */
export const palette: Palette = {
  bg: "#08090a",
  panel: "#0e0f11",
  panel2: "#141516",
  panel3: "#1c1d1f",
  line: "rgba(255, 255, 255, 0.08)",
  lineStrong: "rgba(255, 255, 255, 0.14)",
  ink: "#f7f8f8",
  ink2: "#b4b8bf",
  ink3: "#8a8f98",
  solid: "#e5e5e6",
  solidHover: "#ffffff",
  solidInk: "#08090a",
  accent: "#7b83eb",
  accentHover: "#949bf0",
  accentSoft: "rgba(94, 106, 210, 0.16)",
  accentInk: "#ffffff",
  ok: "#4cb782",
  okSoft: "rgba(76, 183, 130, 0.14)",
  warn: "#f2c94c",
  warnSoft: "rgba(242, 201, 76, 0.14)",
  bad: "#eb5757",
  badSoft: "rgba(235, 87, 87, 0.14)",
  codeBg: "#0b0c0d",
  codeLine: "rgba(255, 255, 255, 0.06)",
  tokKeyword: "#b48eff",
  tokString: "#7ee0a8",
  tokComment: "#6a6f78",
  tokNumber: "#f2c97d",
  tokFunction: "#6fb9ff",
  tokTag: "#ff8fa3",
  tokAttr: "#e3bd5a",
};

/** The CSS custom property each palette key mirrors, for the drift test. */
export const PALETTE_TO_CSS: Record<keyof Palette, string> = {
  bg: "--bg",
  panel: "--panel",
  panel2: "--panel-2",
  panel3: "--panel-3",
  line: "--line",
  lineStrong: "--line-strong",
  ink: "--ink",
  ink2: "--ink-2",
  ink3: "--ink-3",
  solid: "--solid",
  solidHover: "--solid-hover",
  solidInk: "--solid-ink",
  accent: "--accent",
  accentHover: "--accent-hover",
  accentSoft: "--accent-soft",
  accentInk: "--accent-ink",
  ok: "--ok",
  okSoft: "--ok-soft",
  warn: "--warn",
  warnSoft: "--warn-soft",
  bad: "--bad",
  badSoft: "--bad-soft",
  codeBg: "--code-bg",
  codeLine: "--code-line",
  tokKeyword: "--tok-keyword",
  tokString: "--tok-string",
  tokComment: "--tok-comment",
  tokNumber: "--tok-number",
  tokFunction: "--tok-function",
  tokTag: "--tok-tag",
  tokAttr: "--tok-attr",
};

/**
 * The type scale, measured off the reference alongside the colours.
 *
 * `line` values are absolute, not multipliers: React Native's `lineHeight` is
 * in points, and a Mongolian paragraph needs 1.6 where the reference sets 1.5
 * (CLAUDE.md §4.3).
 */
export const type = {
  display: { size: 32, line: 36, weight: "500" as const, tracking: -0.7 },
  title: { size: 22, line: 26, weight: "500" as const, tracking: -0.4 },
  heading: { size: 17, line: 22, weight: "600" as const, tracking: -0.2 },
  body: { size: 15, line: 24, weight: "400" as const, tracking: 0 },
  small: { size: 13, line: 20, weight: "400" as const, tracking: 0 },
  micro: { size: 11, line: 16, weight: "500" as const, tracking: 0.2 },
  code: { size: 12.5, line: 20, weight: "400" as const, tracking: 0 },
};

export const radius = { sm: 6, md: 8, lg: 12, xl: 16, pill: 999 };

/** A four-point rhythm, so spacing is chosen from a list rather than invented. */
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };

/** The font families registered in the mobile app's root layout. */
export const fonts = {
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semibold: "Inter_600SemiBold",
  mono: "JetBrainsMono_400Regular",
};
