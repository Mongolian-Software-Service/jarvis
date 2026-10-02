#!/usr/bin/env node
/**
 * Put a lesson's film in Cloudflare R2 and point the lesson at it.
 *
 *   pnpm video:upload <file> [lesson-slug] [--seed-only]
 *   pnpm video:upload ~/Movies/ehlehiin-umnu.mp4 ehlehiin-umnu
 *
 * R2 because egress is free (decision #014). The school's whole cost model for
 * video is storage — a few tögrög a month for the entire curriculum — and every
 * competing store charges per gigabyte *watched*, which is the one number that
 * grows with the thing we want to grow.
 *
 * **The website needs none of this.** `lessons.video_url` holds an absolute URL
 * and the player is a plain `<video src>`, so no R2 name appears in
 * `turbo.json`, in Vercel, or in a browser bundle. R2 credentials are read here,
 * by a script, from a gitignored `.env` — and nowhere else in the repository.
 *
 * With a slug it writes the URL to three places that all have to agree:
 * `supabase/seed.sql`, so the curriculum in git is true and `check-seed.mjs`
 * stops counting that lesson as a stand-in; and the live row, with one targeted
 * `update` rather than a re-run of the seed. Without a slug it only uploads and
 * prints the URL, which is what a poster frame or a subtitle file wants.
 */
import { readFileSync, statSync, existsSync } from "node:fs";
import { basename, extname, join, resolve } from "node:path";
import { loadEnvFile, required, REPO_ROOT } from "./env.mjs";
import { r2, contentTypeOf } from "./r2/api.mjs";
import { setSeedVideoUrl } from "./seed/video.mjs";

loadEnvFile();

/*
 * A failed upload is a message, not a stack trace.
 *
 * Everything that can go wrong here goes wrong inside somebody else's API —
 * a token without the right permission, a bucket name already taken, a body
 * refused for its size — and each of those already arrives carrying the
 * sentence that explains it. Node's default is to print that sentence under
 * eight frames of its own event loop, which buries the only useful line.
 *
 * Both events, because this file uses top-level `await`: a rejection there is
 * delivered as an *uncaught exception* during module evaluation rather than as
 * an unhandled rejection, so registering only the obvious one catches nothing.
 */
for (const event of ["uncaughtException", "unhandledRejection"]) {
  process.on(event, (error) => {
    console.error(`\n  ✗ ${error instanceof Error ? error.message : error}\n`);
    process.exit(1);
  });
}

const argv = process.argv.slice(2);
const flags = new Set(argv.filter((arg) => arg.startsWith("--")));
const [file, slug] = argv.filter((arg) => !arg.startsWith("--"));

if (!file || !existsSync(resolve(file))) {
  console.error(
    "\nUsage: pnpm video:upload <file> [lesson-slug] [--seed-only]\n\n" +
      "  pnpm video:upload ~/Movies/ehlehiin-umnu.mp4 ehlehiin-umnu\n\n" +
      "  The slug is the lesson's own slug in supabase/seed.sql. Given one, the\n" +
      "  URL is written to the seed and to the live row. Omit it to upload a\n" +
      "  file and just be told its URL.\n\n" +
      "  --seed-only   write the seed, leave the live database alone\n",
  );
  process.exit(1);
}

const accountId = required(
  "CLOUDFLARE_ACCOUNT_ID",
  "dash.cloudflare.com → the account ID is in the URL and on the R2 overview page.",
);
/*
 * **Admin** Read & Write, not Object Read & Write.
 *
 * Object Read & Write can put the file and nothing else — it cannot create a
 * bucket and cannot edit bucket configuration, which is what switching on the
 * public domain is. The narrow token still works here if the bucket already
 * exists and `R2_PUBLIC_BASE` is set; both of those steps then happen by hand
 * in the dashboard, once, and the two failures below say so rather than
 * stopping the upload.
 */
const token = required(
  "CLOUDFLARE_API_TOKEN",
  "dash.cloudflare.com → R2 → Manage API tokens → Create token, permission “Admin Read & Write”.",
);

const bucket = process.env.R2_BUCKET || "tsstark-videos";
const path = resolve(file);
const bytes = readFileSync(path);
const megabytes = statSync(path).size / 1_000_000;
const type = contentTypeOf(path);

console.log(`\n${basename(path)} — ${megabytes.toFixed(1)}MB, ${type}\n`);

/*
 * A size warning, not a limit.
 *
 * Two separate reasons, and the student's is the one that matters. A lesson is
 * a screen recording of somebody directing Claude: mostly still frames, which
 * H.264 compresses to almost nothing, so ten minutes ought to be tens of
 * megabytes rather than hundreds. A file that is bigger than that has not been
 * encoded for the phone on mobile data that most of this school is read on, and
 * R2's free egress does not make a student's data plan free.
 *
 * The other reason is mechanical: this is one HTTP request (see `r2/api.mjs`),
 * and Cloudflare's REST API will refuse a body past a few hundred megabytes.
 */
if (megabytes > 100) {
  console.log(
    "  ⚠️  Over 100MB. Students read this school on mobile data — re-encode first:\n\n" +
      `      ffmpeg -i ${basename(path)} -vf scale=-2:720 -c:v libx264 -crf 26 \\\n` +
      "        -preset slow -profile:v high -pix_fmt yuv420p -movflags +faststart \\\n" +
      "        -c:a aac -b:a 96k out.mp4\n\n" +
      "      (+faststart is what lets the video start before the whole file lands.)\n",
  );
}

const api = r2(accountId, token);

/** Cloudflare's own sentence, without the request line above it. */
const why = (error) => error.message.split("\n").pop().trim();

/*
 * Creating the bucket is a convenience, so a token that may not is not fatal.
 *
 * If the bucket is genuinely missing the upload below fails and says so — which
 * is the honest place for that error, rather than here where the only thing
 * known is that this token cannot ask.
 */
try {
  console.log(
    `  bucket ${bucket} — ${(await api.ensureBucket(bucket)) ? "created" : "already there"}`,
  );
} catch (error) {
  console.log(`  bucket ${bucket} — not checked (${why(error)})`);
}

/*
 * Where the file will be readable from.
 *
 * `R2_PUBLIC_BASE` is a custom domain and is what production uses. Without one
 * this falls back to the managed `r2.dev` origin, which Cloudflare rate-limits
 * and does not cache — fine for checking a lesson on a laptop, wrong for a
 * class. SETUP.md §11 has the dashboard path that fixes it.
 */
let base = (process.env.R2_PUBLIC_BASE || "").replace(/\/$/, "");
if (base) {
  console.log(`  domain ${base.replace(/^https?:\/\//, "")} — from R2_PUBLIC_BASE`);
} else {
  const domain = await api.managedDomain(bucket).catch((error) => {
    console.error(
      `\n  ✗ Could not read or switch on the bucket's public domain.\n    ${why(error)}\n\n` +
        "    Either use an “Admin Read & Write” token, or switch public access on\n" +
        "    once in the dashboard and put the address in R2_PUBLIC_BASE.\n",
    );
    process.exit(1);
  });
  if (!domain) {
    console.error(
      "\n  ✗ The bucket has no public domain and none was returned. Set R2_PUBLIC_BASE.\n",
    );
    process.exit(1);
  }
  base = `https://${domain}`;
  console.log(`  domain ${domain} — ⚠️  r2.dev, rate-limited and uncached (development only)`);
}

const key = `lessons/${slug || basename(path, extname(path))}${extname(path).toLowerCase()}`;
await api.put(bucket, key, bytes, type);

const url = `${base}/${key}`;
console.log(`  upload ${key} — ok\n\n  ${url}\n`);

if (!slug) {
  console.log("  No lesson slug given, so nothing was wired up.\n");
  process.exit(0);
}

const seeded = setSeedVideoUrl(join(REPO_ROOT, "supabase/seed.sql"), slug, url);
if (!seeded) {
  console.error(
    `  ✗ No lesson in seed.sql has the slug '${slug}'. The file is uploaded;\n` +
      "    nothing points at it. Check the slug and re-run — the upload is idempotent.\n",
  );
  process.exit(1);
}
console.log(`  seed.sql — video_url was ${seeded.was}`);

/**
 * The one live row, updated on its own.
 *
 * Deliberately not `pnpm supabase:setup`: that re-runs the whole seed, which on
 * a project students are reading rewrites every lesson from a file that may be
 * ahead of them. One `update` touches the row this upload is about.
 *
 * Both values are escaped, and `slug` has already been matched against the seed
 * above — so this cannot name a row the curriculum does not have.
 */
async function patchLive() {
  const supabaseToken = process.env.SUPABASE_ACCESS_TOKEN;
  const ref = process.env.SUPABASE_PROJECT_REF;
  if (!supabaseToken || !ref) return "skipped (no SUPABASE_ACCESS_TOKEN / SUPABASE_PROJECT_REF)";

  const quote = (value) => value.replaceAll("'", "''");
  const response = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
    method: "POST",
    headers: { Authorization: `Bearer ${supabaseToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      query:
        `update public.lessons set video_url = '${quote(url)}' ` +
        `where slug = '${quote(slug)}' returning slug`,
    }),
  });

  const text = await response.text();
  if (!response.ok) throw new Error(`live update → ${response.status}\n  ${text.slice(0, 300)}`);
  /*
   * 0 rows is not an error and is worth saying loudly: it means the live
   * database does not have this lesson yet, so the seed write above is the whole
   * of the change and `pnpm supabase:setup` is what will carry it over.
   */
  const rows = JSON.parse(text || "[]");
  if (rows.length === 1) return "1 row updated";
  return `⚠️  ${rows.length} rows matched '${slug}' — expected 1; seed.sql is written either way`;
}

console.log(
  `  live db  — ${flags.has("--seed-only") ? "skipped (--seed-only)" : await patchLive()}\n`,
);
