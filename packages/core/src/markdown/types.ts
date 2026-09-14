/**
 * What a lesson body parses to.
 *
 * A typed tree rather than an HTML string, so the web and the phone each draw
 * it their own way and there is no `dangerouslySetInnerHTML` anywhere in this
 * codebase (§4.5).
 */

export type MdInline =
  | { type: "text"; value: string }
  | { type: "strong"; value: string }
  | { type: "em"; value: string }
  | { type: "code"; value: string }
  | { type: "link"; value: string; href: string };

export type MdBlock =
  | { type: "heading"; level: 1 | 2 | 3; content: MdInline[] }
  | { type: "paragraph"; content: MdInline[] }
  | { type: "list"; ordered: boolean; items: MdInline[][] }
  | { type: "code"; language: string | null; code: string }
  | { type: "quote"; content: MdInline[] }
  | { type: "rule" };
