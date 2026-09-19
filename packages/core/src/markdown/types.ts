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

/**
 * One box in a diagram: a short label and, optionally, the line under it.
 *
 * A lesson body cannot carry a picture — there is no image node here and there
 * will not be one, because an image is a file somebody has to keep in step with
 * the prose in two places. A diagram that is *written* stays with the sentence
 * that explains it, translates with it, and draws itself in whatever the
 * platform's colours are. It is also the only figure a school that teaches
 * directing actually needs: things, in order, with arrows.
 */
export type MdStep = { label: string; note: string | null };

export type MdBlock =
  | { type: "heading"; level: 1 | 2 | 3; content: MdInline[] }
  | { type: "diagram"; steps: MdStep[] }
  | { type: "paragraph"; content: MdInline[] }
  | { type: "list"; ordered: boolean; items: MdInline[][] }
  | { type: "code"; language: string | null; code: string }
  | { type: "quote"; content: MdInline[] }
  | { type: "rule" };
