/**
 * Syntax highlighting, as tokens rather than as HTML.
 *
 * A coding school that renders code as flat grey text looks unfinished, and the
 * obvious answers — Shiki, Prism, highlight.js — all produce an HTML string.
 * An HTML string is useless to `apps/mobile`, which has to draw the same
 * snippet with `<Text>` runs, and Shiki's WASM grammar engine is a heavy thing
 * to start inside a serverless request.
 *
 * So this returns **lines of tokens**, and each platform draws them: the web
 * with spans, the phone with nested Text. It is a lexer, not a parser — it does
 * not know what a type is, only what one looks like — which is the right
 * trade-off for teaching snippets of ten to forty lines.
 */

export type { TokenKind, CodeToken, CodeLine } from "./types";

import type { CodeLine } from "./types";
import { SPECS, familyOf } from "./languages";
import { scan, scanMarkup, toLines } from "./lexer";

export function highlight(code: string, language?: string | null): CodeLine[] {
  const family = familyOf(language);
  if (family === "plain") return toLines([{ text: code, kind: "plain" }]);
  if (family === "markup") return toLines(scanMarkup(code));
  const spec = SPECS[family];
  if (!spec) return toLines([{ text: code, kind: "plain" }]);
  return toLines(scan(code, spec));
}
