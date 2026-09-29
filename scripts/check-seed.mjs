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
import { FIELDS, splitFields } from "./seed/fields.mjs";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const lines = readFileSync(join(root, "supabase/seed.sql"), "utf8").split("\n");

const starts = [];
lines.forEach((line, index) => {
  if (line.startsWith("  ('30000000-")) starts.push(index);
});

const problems = [];

/** Lessons pointing at a sample reel. Reported, never fatal — see below. */
const placeholders = [];

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
  /*
   * The player is a plain `<video src>` (§4 has the reasoning), so `video_url`
   * has to be a media file. A youtube.com/watch or vimeo.com page is HTML: the
   * element loads it, finds nothing it can decode, and draws a black frame
   * stuck at 0:00 with no error anywhere. Four lessons shipped like that.
   */
  if (/youtube\.com|youtu\.be|vimeo\.com|\/watch\?/.test(at("video_url"))) {
    problems.push([
      start + 1,
      slug,
      "video_url is a web page, not a file — <video> cannot play it",
    ]);
  }
  /*
   * Google's sample bucket was this seed's stand-in until it began refusing
   * anonymous requests. Every clip in it is a 403 now — a black frame with
   * nothing in the console — so a row copied from an old seed is refused here
   * rather than discovered by a student.
   */
  if (/commondatastorage\.googleapis\.com|gtv-videos-bucket/.test(at("video_url"))) {
    problems.push([start + 1, slug, "video_url is in Google's sample bucket, which answers 403"]);
  }
  /*
   * A stand-in video is not a failure — a lesson has to exist before its film
   * does, and blocking the build until somebody shoots one would only mean the
   * lesson never gets written. It is a failure to *forget*, which is a
   * different thing, and the only way that happens is silently.
   *
   * So these are counted and named on every run. `pnpm test` stays green and
   * still says out loud which lessons are showing the MDN sample clip.
   */
  if (/interactive-examples\.mdn\.mozilla\.net\/media\/cc0-videos\//.test(at("video_url"))) {
    placeholders.push([start + 1, slug]);
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
 * No lesson body may open a fence that is not a diagram.
 *
 * The school teaches directing, not typing (CLAUDE.md §1): a body carries no
 * code, and the one fence it may open is ```diagram, which parses to boxes
 * rather than to a `code` block. This is the guard for that rule, because it is
 * a rule about prose — nothing in Postgres or TypeScript can notice a lesson
 * quietly growing a `js` snippet again, and six courses had to be rewritten
 * once already.
 *
 * Tables are checked in the same pass. The renderer has no table node, so a
 * `| a | b |` row reaches the reader as four pipes on the page, and it did for
 * months in the intro course before anybody opened that lesson.
 */
const source = readFileSync(join(root, "supabase/seed.sql"), "utf8");
for (const match of source.matchAll(/\$md\$([\s\S]*?)\$md\$/g)) {
  const body = match[1];
  const first = source.slice(0, match.index).split("\n").length;

  // Fences come in pairs, so only every other one names a language — checking
  // each ``` line independently reports the closing fence of a legal diagram.
  let open = false;
  body.split("\n").forEach((text, offset) => {
    const fence = /^```[ \t]*([A-Za-z0-9+#-]*)[ \t]*$/.exec(text);
    if (fence) {
      if (!open && fence[1].toLowerCase() !== "diagram") {
        const what = fence[1] || "(no language)";
        problems.push([
          first + offset,
          "body",
          `opens a \`\`\`${what} fence — only \`\`\`diagram is allowed`,
        ]);
      }
      open = !open;
      return;
    }
    if (!open && /^[ \t]*\|/.test(text)) {
      problems.push([
        first + offset,
        "body",
        "has a Markdown table — the renderer draws it as pipes",
      ]);
    }
  });
}

/*
 * And one thing about courses, which Postgres cannot catch.
 *
 * `courses.is_free` defaults to false. Drop it from the insert's column list
 * and the seed still applies cleanly — it just quietly makes every course paid,
 * including the free intro track, and the only symptom is that nobody can start
 * anything without buying. A default that silently means "no" is exactly the
 * kind of omission worth a line of arithmetic here.
 */
const courseBlock = source.split("insert into public.courses")[1]?.split("on conflict")[0] ?? "";

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

function reportPlaceholders() {
  if (placeholders.length === 0) return;
  console.log(
    `  ${placeholders.length} lesson(s) still on a stand-in video — replace video_url when the real one exists:`,
  );
  for (const [line, slug] of placeholders) console.log(`    seed.sql:${line}  ${slug}`);
}

if (problems.length === 0) {
  console.log(`✓ seed.sql — ${starts.length} lessons, every one satisfies its constraint`);
  reportPlaceholders();
  process.exit(0);
}

console.error(
  `✗ seed.sql — ${problems.length} problem(s) in ${starts.length} lessons and the course rows:\n`,
);
for (const [line, slug, why] of problems) {
  console.error(`  seed.sql${line ? `:${line}` : ""}  ${slug}\n    ${why}`);
}
reportPlaceholders();
process.exit(1);
