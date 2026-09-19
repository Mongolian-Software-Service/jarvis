/**
 * The shape of a `public.lessons` row in seed.sql, and how to take one apart.
 *
 * Split out of `check-seed.mjs` when that file crossed the 160-line cap
 * (CLAUDE.md §3.1). The pressure named the seam correctly: this half knows
 * the column order and SQL quoting, the other half knows what the database
 * will refuse — and only one of those changes when a lesson is written.
 */

export const FIELDS = [
  "id",
  "module_id",
  "course_id",
  "slug",
  "title_mn",
  "title_en",
  "kind",
  "video_url",
  "duration_minutes",
  "body_mn",
  "body_en",
  "code_language",
  "starter_code",
  "solution_code",
  "is_preview",
  "rank",
];

/**
 * Split on top-level commas only.
 *
 * A naive `split(",")` breaks on a title like `'Текст, холбоос, зураг'` and
 * then reports a parse failure for a row that is perfectly fine — which is
 * exactly how a checker teaches people to ignore it.
 */
export function splitFields(text) {
  const out = [];
  let current = "";
  let quoted = false;
  let depth = 0;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === "'" && text[i + 1] === "'") {
        current += "''";
        i++;
        continue;
      }
      if (ch === "'") quoted = false;
      current += ch;
    } else if (ch === "'") {
      quoted = true;
      current += ch;
    } else if (ch === "(") {
      depth++;
      current += ch;
    } else if (ch === ")") {
      depth--;
      current += ch;
    } else if (ch === "," && depth === 0) {
      out.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  if (current.trim()) out.push(current.trim());
  return out;
}
