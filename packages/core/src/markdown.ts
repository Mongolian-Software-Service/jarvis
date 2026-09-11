/**
 * The Markdown a lesson body is allowed to use, parsed into blocks.
 *
 * Not a full CommonMark implementation and not trying to be. It is a *shared*
 * parser: the web renders these blocks to HTML and `apps/mobile` will render
 * the same blocks to React Native views, so a lesson reads the same on both.
 * A library that emits an HTML string could not do that — `dangerouslySetInner
 * HTML` has no counterpart on a phone, and a lesson body is content our own
 * editor writes, not something to hand to a renderer and hope.
 *
 * Supported, deliberately: `#`/`##`/`###` headings, paragraphs, `-` and `1.`
 * lists, fenced code with a language, `>` quotes, `---` rules, and inline
 * `**bold**`, `*italic*`, `` `code` `` and `[links](href)`.
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

const HEADING = /^(#{1,3})\s+(.*)$/;
const FENCE = /^```\s*([A-Za-z0-9+#-]*)\s*$/;
const BULLET = /^[-*]\s+(.*)$/;
const NUMBERED = /^\d+[.)]\s+(.*)$/;
const QUOTE = /^>\s?(.*)$/;
const RULE = /^(-{3,}|\*{3,}|_{3,})$/;

export function parseMarkdown(source: string): MdBlock[] {
  if (!source) return [];
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  const blocks: MdBlock[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i] ?? "";

    if (line.trim() === "") {
      i++;
      continue;
    }

    // Fenced code. Everything to the closing fence is taken verbatim — an
    // unclosed fence runs to the end of the body rather than swallowing the
    // parser, because a half-written lesson still has to render.
    const fence = FENCE.exec(line.trim());
    if (fence) {
      const language = fence[1] ? fence[1].toLowerCase() : null;
      const body: string[] = [];
      i++;
      while (i < lines.length && !/^```/.test((lines[i] ?? "").trim())) {
        body.push(lines[i] ?? "");
        i++;
      }
      i++; // past the closing fence
      blocks.push({ type: "code", language, code: body.join("\n") });
      continue;
    }

    if (RULE.test(line.trim())) {
      blocks.push({ type: "rule" });
      i++;
      continue;
    }

    const heading = HEADING.exec(line);
    if (heading) {
      const hashes = heading[1] ?? "#";
      const level = Math.min(3, hashes.length) as 1 | 2 | 3;
      blocks.push({ type: "heading", level, content: parseInline(heading[2] ?? "") });
      i++;
      continue;
    }

    const quote = QUOTE.exec(line);
    if (quote) {
      const parts: string[] = [quote[1] ?? ""];
      i++;
      while (i < lines.length) {
        const next = QUOTE.exec(lines[i] ?? "");
        if (!next) break;
        parts.push(next[1] ?? "");
        i++;
      }
      blocks.push({ type: "quote", content: parseInline(parts.join(" ").trim()) });
      continue;
    }

    const ordered = NUMBERED.test(line);
    if (ordered || BULLET.test(line)) {
      const pattern = ordered ? NUMBERED : BULLET;
      const items: MdInline[][] = [];
      while (i < lines.length) {
        const match = pattern.exec(lines[i] ?? "");
        if (!match) break;
        items.push(parseInline(match[1] ?? ""));
        i++;
      }
      blocks.push({ type: "list", ordered, items });
      continue;
    }

    // A paragraph runs to the next blank line or the next block that announces
    // itself. Soft line breaks join with a space, the way Markdown reads them.
    const paragraph: string[] = [];
    while (i < lines.length) {
      const current = lines[i] ?? "";
      if (
        current.trim() === "" ||
        FENCE.test(current.trim()) ||
        HEADING.test(current) ||
        QUOTE.test(current) ||
        BULLET.test(current) ||
        NUMBERED.test(current) ||
        RULE.test(current.trim())
      ) {
        break;
      }
      paragraph.push(current.trim());
      i++;
    }
    if (paragraph.length) {
      blocks.push({ type: "paragraph", content: parseInline(paragraph.join(" ")) });
    }
  }

  return blocks;
}

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

/** The first plain-text run of a body — for an excerpt or an OG description. */
export function excerpt(source: string, limit = 160): string {
  const blocks = parseMarkdown(source);
  for (const block of blocks) {
    if (block.type !== "paragraph") continue;
    const text = block.content.map((part) => part.value).join("");
    if (text.length <= limit) return text;
    return `${text.slice(0, limit - 1).trimEnd()}…`;
  }
  return "";
}

/** Roughly how long this takes to read, at 180 Cyrillic words a minute. */
export function readingMinutes(source: string): number {
  const words = source.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 180));
}
