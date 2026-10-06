/**
 * The block scanner: headings, fences, lists, quotes, rules, paragraphs.
 *
 * Line-oriented and single-pass. Every run of text it produces is handed to
 * the inline pass, which is the only thing that knows about `**` and `[]()`.
 */
import type { MdBlock, MdStep } from "./types";
import { parseInline } from "./inline";

const HEADING = /^(#{1,3})\s+(.*)$/;
const FENCE = /^```\s*([A-Za-z0-9+#-]*)\s*$/;
const BULLET = /^[-*]\s+(.*)$/;
const NUMBERED = /^\d+[.)]\s+(.*)$/;
const QUOTE = /^>\s?(.*)$/;
const ALERT = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]$/i;
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
      if (language === "diagram") {
        const steps = body.map(parseStep).filter((step): step is MdStep => step !== null);
        if (steps.length) blocks.push({ type: "diagram", steps });
        continue;
      }
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
      // Every GitHub alert name draws the same one box: a body with two kinds
      // of warning would ask the reader to learn which one matters more.
      if (ALERT.test((parts[0] ?? "").trim())) {
        const content = parseInline(parts.slice(1).join(" ").trim());
        if (content.length) blocks.push({ type: "notice", content });
        continue;
      }
      blocks.push({ type: "quote", content: parseInline(parts.join(" ").trim()) });
      continue;
    }

    const ordered = NUMBERED.test(line);
    if (ordered || BULLET.test(line)) {
      const pattern = ordered ? NUMBERED : BULLET;
      const texts: string[] = [];
      while (i < lines.length) {
        const raw = lines[i] ?? "";
        const match = pattern.exec(raw);
        if (match) {
          texts.push(match[1] ?? "");
          i++;
          continue;
        }

        /*
         * An item that ran onto the next line.
         *
         * Markdown lets a bullet wrap, and Mongolian bullets wrap constantly —
         * the compounds are long and the guide is written at 80 columns.
         * Without this the tail of a wrapped item fell out of the list and
         * rendered as a stray paragraph underneath it, which is what «…дараа нь
         * / тэндээсээ үргэлжилнэ» looked like on the welcome page.
         *
         * The continuation has to be **indented**: an unindented line after a
         * list is a new paragraph, and swallowing it would be the opposite
         * mistake. A nested bullet still ends the list — nesting is not
         * supported, and pretending otherwise would flatten it silently.
         */
        const trimmed = raw.trim();
        const wraps =
          texts.length > 0 &&
          trimmed !== "" &&
          raw.startsWith(" ") &&
          !FENCE.test(trimmed) &&
          !HEADING.test(trimmed) &&
          !QUOTE.test(trimmed) &&
          !RULE.test(trimmed) &&
          !BULLET.test(trimmed) &&
          !NUMBERED.test(trimmed);

        if (!wraps) break;
        texts[texts.length - 1] += ` ${trimmed}`;
        i++;
      }
      blocks.push({ type: "list", ordered, items: texts.map(parseInline) });
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

/**
 * One line of a ```diagram fence: `Label` or `Label | the note under it`.
 *
 * A pipe, because it is the one punctuation mark that never appears in
 * Mongolian prose — an em dash or a colon would have made every step with a
 * clause in it split in the wrong place. Blank lines are skipped so a long
 * diagram can be spaced out in the seed for whoever edits it next.
 */
function parseStep(line: string): MdStep | null {
  const text = line.trim();
  if (!text) return null;
  const bar = text.indexOf("|");
  if (bar === -1) return { label: text, note: null };
  return { label: text.slice(0, bar).trim(), note: text.slice(bar + 1).trim() || null };
}
