#!/usr/bin/env node
/**
 * Does seed.sql satisfy the constraints the database will check?
 *
 * It did not, and finding out cost a failed push: eight lessons were typed
 * `code` with no `starter_code`, which `lesson_code_needs_code` refuses. The
 * constraint was right — `code` means "leads with the exercise" (CLAUDE.md §1)
 * and those lessons are reading lessons with samples in them.
 *
 * Checking here rather than only in Postgres means the answer arrives in a
 * second, names every bad row at once, and does not need a project to talk to.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const lines = readFileSync(join(root, "supabase/seed.sql"), "utf8").split("\n");

const FIELDS = [
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
function splitFields(text) {
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

const starts = [];
lines.forEach((line, index) => {
  if (line.startsWith("  ('30000000-")) starts.push(index);
});

const problems = [];

/*
 * Which lessons have questions written for them.
 *
 * `kind = 'quiz'` is the one kind of lesson the database cannot check: the
 * other three need a column on the same row, and a check constraint can see
 * that. Questions live in another table, so a quiz lesson with none applies
 * cleanly and then renders as an exam with nothing in it — a dead end at the
 * end of a course, which is the worst place for one.
 */
const questionCounts = new Map();
for (const line of lines) {
  const match = /^ {2}\('4[0-9a-f-]+',\s*'(3[0-9a-f-]+)',/.exec(line);
  if (match) {
    const lesson = match[1];
    questionCounts.set(lesson, (questionCounts.get(lesson) ?? 0) + 1);
  }
}

starts.forEach((start, n) => {
  let stop = n + 1 < starts.length ? starts[n + 1] : lines.length;
  for (let i = start; i < stop; i++) {
    if (lines[i].startsWith("on conflict")) {
      stop = i;
      break;
    }
  }

  // Bodies are `$md$`-quoted and hold commas, parentheses and quotes of their
  // own; blanking them first is what makes the field split tractable.
  const block = lines
    .slice(start, stop)
    .join("\n")
    .replace(/\$md\$[\s\S]*?\$md\$/g, "MD");
  let inner = block.trim().replace(/,$/, "").trim();
  if (inner.startsWith("(")) inner = inner.slice(1);
  if (inner.endsWith(")")) inner = inner.slice(0, -1);

  const values = splitFields(inner);
  const at = (name) => values[FIELDS.indexOf(name)] ?? "";

  if (values.length !== FIELDS.length) {
    problems.push([
      start + 1,
      "could not be parsed",
      `${values.length} fields, expected ${FIELDS.length}`,
    ]);
    return;
  }

  const slug = at("slug").replaceAll("'", "");
  const kind = at("kind").replaceAll("'", "");

  if (kind === "code" && at("starter_code") === "null") {
    problems.push([start + 1, slug, "kind 'code' with no starter_code — lesson_code_needs_code"]);
  }
  if (kind === "video" && at("video_url") === "null") {
    problems.push([start + 1, slug, "kind 'video' with no video_url — lesson_video_needs_url"]);
  }
  if (kind === "text" && at("body_mn") === "null") {
    problems.push([start + 1, slug, "kind 'text' with no body_mn — lesson_text_needs_body"]);
  }
  if (kind === "quiz") {
    const id = at("id").replaceAll("'", "").replace("(", "");
    const asked = questionCounts.get(id) ?? 0;
    if (asked === 0) {
      problems.push([start + 1, slug, "kind 'quiz' with no questions — the exam would open empty"]);
    }
  }
});

/*
 * And one thing about courses, which Postgres cannot catch.
 *
 * `courses.is_free` defaults to false. Drop it from the insert's column list
 * and the seed still applies cleanly — it just quietly makes every course paid,
 * including the free intro track, and the only symptom is that nobody can start
 * anything without buying. A default that silently means "no" is exactly the
 * kind of omission worth a line of arithmetic here.
 */
const courseBlock =
  readFileSync(join(root, "supabase/seed.sql"), "utf8")
    .split("insert into public.courses")[1]
    ?.split("on conflict")[0] ?? "";

if (!/\(.*\bis_free\b/s.test(courseBlock.split("values")[0] ?? "")) {
  problems.push([
    0,
    "courses",
    "the insert does not name is_free — every course would default to paid",
  ]);
} else if (!/,\s*true,\s*true,/.test(courseBlock)) {
  problems.push([
    0,
    "courses",
    "no course is free — the intro track has to be, or nobody can start",
  ]);
}

if (problems.length === 0) {
  console.log(`✓ seed.sql — ${starts.length} lessons, every one satisfies its constraint`);
  process.exit(0);
}

console.error(
  `✗ seed.sql — ${problems.length} problem(s) in ${starts.length} lessons and the course rows:\n`,
);
for (const [line, slug, why] of problems) {
  console.error(`  seed.sql${line ? `:${line}` : ""}  ${slug}\n    ${why}`);
}
process.exit(1);
