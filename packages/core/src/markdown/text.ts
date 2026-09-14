/**
 * Markdown read as plain text: what a card blurb shows and how long a lesson
 * takes. Neither needs the tree that `parseMarkdown` builds kept around, and
 * building one to throw it away is how a list of thirty courses gets slow.
 */
import { parseMarkdown } from "./block";

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
