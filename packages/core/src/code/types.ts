/**
 * The shape a highlighted snippet takes, and the shape a language is described
 * in. Both platforms draw from these: the web as spans, the phone as nested
 * `<Text>` runs — see `./index.ts` for why this is tokens and not HTML.
 */

export type TokenKind =
  | "plain"
  | "keyword"
  | "string"
  | "comment"
  | "number"
  | "function"
  | "punct"
  | "tag"
  | "attr";

export type CodeToken = { text: string; kind: TokenKind };
export type CodeLine = CodeToken[];

export type LangSpec = {
  lineComment: readonly string[];
  blockComment: readonly (readonly [string, string])[];
  quotes: readonly string[];
  /** Python's `"""`, checked before the single-character quotes. */
  longQuotes?: readonly string[];
  keywords: ReadonlySet<string>;
  /** CSS: `padding` in `padding: 20px` is a property, not a bare word. */
  attrBeforeColon?: boolean;
};

