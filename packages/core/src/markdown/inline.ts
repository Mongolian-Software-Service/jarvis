/**
 * The inline pass: bold, italic, code and links inside a run of text.
 *
 * Separate from the block scanner because it runs over every heading, list
 * item, quote and paragraph the block scanner produces — one grammar applied
 * in many places, rather than a stage of the other.
 */
import type { MdInline } from "./types";

const INLINE = /(\*\*([^*]+)\*\*)|(\*([^*\n]+)\*)|(`([^`]+)`)|(\[([^\]]+)\]\(([^)\s]+)\))/g;

export function parseInline(source: string): MdInline[] {
  const out: MdInline[] = [];
  let last = 0;
  INLINE.lastIndex = 0;

  for (let match = INLINE.exec(source); match; match = INLINE.exec(source)) {
    if (match.index > last) {
      out.push({ type: "text", value: source.slice(last, match.index) });
    }
    if (match[2] != null) out.push({ type: "strong", value: match[2] });
    else if (match[4] != null) out.push({ type: "em", value: match[4] });
    else if (match[6] != null) out.push({ type: "code", value: match[6] });
    else if (match[8] != null) {
      out.push({ type: "link", value: match[8], href: safeHref(match[9] ?? "") });
    }
    last = match.index + match[0].length;
  }

  if (last < source.length) out.push({ type: "text", value: source.slice(last) });
  return out;
}

/**
 * Only schemes a lesson has any business linking to.
 *
 * `javascript:` in a body that an admin pasted from somewhere is a stored XSS,
 * and the body is the one field in this product that is free-form text meant to
 * be rendered rather than displayed. Anything else becomes a plain `#`.
 */
function safeHref(href: string): string {
  const value = href.trim();
  if (/^(https?:|mailto:|tel:)/i.test(value)) return value;
  if (value.startsWith("/") || value.startsWith("#")) return value;
  return "#";
}
