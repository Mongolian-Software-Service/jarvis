/**
 * Point one lesson's `video_url` at a real file, in `supabase/seed.sql`.
 *
 * The seed is the source of truth for the curriculum, so an upload that patched
 * only the live database would be undone by the next `pnpm supabase:setup` —
 * and until then the seed would go on advertising the MDN sample clip to
 * everybody reading it, including `check-seed.mjs`, which counts those. The
 * upload writes both, and this is the half that writes the file.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { FIELDS } from "./fields.mjs";

/**
 * The character range of one top-level field of a row, in the whole file.
 *
 * `from` is the offset just after the row's opening `(`, so depth starts at 0
 * and the row's own closing paren is the terminator.
 *
 * The same state machine as `splitFields`, but reporting offsets and stopping
 * the moment it has what it was asked for — which is what makes it safe to run
 * over a *raw* row. `video_url` is field 8 of 16 and every `$md$`-quoted body
 * is field 10 or later, so the scan is finished before it reaches text this
 * parser does not understand. Ask it for `body_mn` and that stops being true.
 */
function fieldRange(text, from, index) {
  let start = from;
  let field = 0;
  let quoted = false;
  let depth = 0;

  for (let i = from; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      // '' is an escaped quote inside a string, not the end of one.
      if (ch === "'" && text[i + 1] === "'") i++;
      else if (ch === "'") quoted = false;
    } else if (ch === "'") {
      quoted = true;
    } else if (ch === "(") {
      depth++;
    } else if (ch === ")") {
      if (depth === 0) return field === index ? [start, i] : null;
      depth--;
    } else if (ch === "," && depth === 0) {
      if (field === index) return [start, i];
      field++;
      start = i + 1;
    }
  }
  return null;
}

/** Where each line begins, as an offset into the file. */
function lineOffsets(lines) {
  const offsets = [];
  let at = 0;
  for (const line of lines) {
    offsets.push(at);
    at += line.length + 1;
  }
  return offsets;
}

/**
 * Rewrite `slug`'s `video_url` to `url`.
 *
 * Returns `{ was }` — the SQL literal it replaced — or **null** when no lesson
 * has that slug, which the caller reports rather than swallowing: a typo'd slug
 * would otherwise look like a successful upload that changed nothing.
 *
 * An object rather than the literal on its own, because a lesson with no video
 * carries the literal `null` and `"null" === null` is false only as long as
 * nobody writes `==`. The two answers now have two different shapes.
 *
 * Splices by offset rather than replacing the old URL as a string: the same URL
 * can legitimately appear in the lesson's own prose, and a blind replace would
 * edit the teaching as well as the column.
 */
export function setSeedVideoUrl(file, slug, url) {
  const text = readFileSync(file, "utf8");
  const lines = text.split("\n");
  const offsets = lineOffsets(lines);

  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].startsWith("  ('30000000-")) continue;

    const from = offsets[i] + lines[i].indexOf("(") + 1;
    const slugAt = fieldRange(text, from, FIELDS.indexOf("slug"));
    if (
      !slugAt ||
      text
        .slice(...slugAt)
        .trim()
        .replaceAll("'", "") !== slug
    )
      continue;

    const videoAt = fieldRange(text, from, FIELDS.indexOf("video_url"));
    if (!videoAt) return null;

    /*
     * The field's range begins immediately after the comma, so it owns the
     * newline and indent the seed wrote for readability. Keeping that prefix is
     * what stops a URL swap from also reflowing the row — `pnpm format` cannot
     * put SQL back, so an edit that loses the shape loses it for good.
     */
    const raw = text.slice(...videoAt);
    const lead = raw.slice(0, raw.length - raw.trimStart().length);

    writeFileSync(file, `${text.slice(0, videoAt[0])}${lead}'${url}'${text.slice(videoAt[1])}`);
    return { was: raw.trim() };
  }
  return null;
}
