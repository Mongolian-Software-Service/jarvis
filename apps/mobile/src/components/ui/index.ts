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

export * from "./tone";
export * from "./text";
export * from "./layout";
export * from "./controls";
export * from "./form";
export * from "./status";
