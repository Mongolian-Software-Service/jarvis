#!/usr/bin/env node
/**
 * Everything that can be done to a Supabase project without a browser.
 *
 * Two things genuinely need a person at a keyboard — creating the project
 * (the form sets a database password) and creating the Google OAuth client
 * (Google's console). Everything after that is configuration, and
 * configuration belongs in a script that can be read, re-run and corrected
 * rather than in a sequence of clicks nobody can review.
 *
 * It is idempotent: the migrations guard themselves, the seed upserts, and the
 * auth settings are a PATCH. Run it again after changing anything.
 *
 * Reads from the environment, or from a `.env` beside this repo's root:
 *
 *   SUPABASE_ACCESS_TOKEN   required — a personal access token
 *                           (supabase.com/dashboard/account/tokens)
 *   SUPABASE_PROJECT_REF    required — the ref in the project's URL
 *   GOOGLE_CLIENT_ID        optional — enables Google sign-in when both are set
 *   GOOGLE_CLIENT_SECRET
 *   APP_URL                 optional — the production site, for the allowlist
 *
 * Usage:
 *   node scripts/supabase-setup.mjs            everything
 *   node scripts/supabase-setup.mjs --schema   migrations + seed only
 *   node scripts/supabase-setup.mjs --migrations   migrations only, no seed
 *
 * `--migrations` is the one to use against the live project. The seed upserts
 * every course, module and lesson by id, so re-running it overwrites whatever
 * the team has since edited in the console — and nothing records that it did.
 *   node scripts/supabase-setup.mjs --auth     auth settings only
 */
import { readFileSync, readdirSync } from "node:fs";
import { configureAuth } from "./supabase/auth.mjs";
import { join } from "node:path";
import { loadEnvFile, REPO_ROOT as root } from "./env.mjs";

const API = "https://api.supabase.com/v1";

loadEnvFile();

const token = process.env.SUPABASE_ACCESS_TOKEN;
const ref = process.env.SUPABASE_PROJECT_REF;

if (!token || !ref) {
  console.error(
    "SUPABASE_ACCESS_TOKEN and SUPABASE_PROJECT_REF are both required.\n\n" +
      "  1. supabase.com/dashboard/account/tokens → generate a token\n" +
      "  2. put both in a `.env` at the repo root (it is gitignored):\n\n" +
      "     SUPABASE_ACCESS_TOKEN=sbp_...\n" +
      "     SUPABASE_PROJECT_REF=abcdefghijklmnop\n",
  );
  process.exit(1);
}

async function api(path, init = {}) {
  const response = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`${init.method ?? "GET"} ${path} → ${response.status}\n${text}`);
  }
  return text ? JSON.parse(text) : null;
}

/** Run SQL against the project. The only way in without a database password. */
async function sql(query, label) {
  process.stdout.write(`  ${label} … `);
  await api(`/projects/${ref}/database/query`, {
    method: "POST",
    body: JSON.stringify({ query }),
  });
  console.log("ok");
}

const only = process.argv[2];
const doSchema = !only || only === "--schema" || only === "--migrations";
const doSeed = !only || only === "--schema";
const doAuth = !only || only === "--auth";

const project = await api(`/projects/${ref}`);
console.log(`\nProject: ${project.name} (${project.region})\n`);

// ── Schema and content ───────────────────────────────────────────────────────
if (doSchema) {
  console.log("Schema");

  /*
   * Which migrations have run.
   *
   * The first version of this checked whether the `courses` table existed and
   * skipped everything if it did — which worked exactly once. The second
   * migration was then silently never applied, and the only symptom was a
   * feature that did not work against a database that looked fine.
   */
  await api(`/projects/${ref}/database/query`, {
    method: "POST",
    body: JSON.stringify({
      query:
        "create table if not exists public.applied_migrations (" +
        "  name text primary key, applied_at timestamptz not null default now())",
    }),
  });

  const done = new Set(
    (
      (await api(`/projects/${ref}/database/query`, {
        method: "POST",
        body: JSON.stringify({ query: "select name from public.applied_migrations" }),
      })) ?? []
    ).map((row) => row.name),
  );

  const files = readdirSync(join(root, "supabase/migrations"))
    .filter((name) => name.endsWith(".sql"))
    .sort();

  /*
   * A database that predates this tracking table.
   *
   * Its schema is already there and re-running `create type` over it fails with
   * 42710. The three original migrations are recorded by name rather than
   * detected, because "has this migration run?" has no general answer without a
   * record — which is the whole reason the table now exists. A fresh project
   * has no `courses` table, skips this, and applies everything normally.
   */
  const schemaExists = (
    await api(`/projects/${ref}/database/query`, {
      method: "POST",
      body: JSON.stringify({ query: "select to_regclass('public.courses') is not null as ready" }),
    })
  )?.[0]?.ready;

  if (done.size === 0 && schemaExists) {
    const bootstrap = [
      "20260911000100_init.sql",
      "20260911000200_functions.sql",
      "20260911000300_rls.sql",
    ].filter((name) => files.includes(name));

    for (const name of bootstrap) {
      await api(`/projects/${ref}/database/query`, {
        method: "POST",
        body: JSON.stringify({
          query: `insert into public.applied_migrations (name) values ('${name}') on conflict do nothing`,
        }),
      });
      done.add(name);
    }
    console.log(`  ${bootstrap.length} migrations were already applied — recorded`);
  }

  let applied = 0;
  for (const name of files) {
    if (done.has(name)) continue;
    await sql(readFileSync(join(root, "supabase/migrations", name), "utf8"), name);
    await api(`/projects/${ref}/database/query`, {
      method: "POST",
      body: JSON.stringify({
        query: `insert into public.applied_migrations (name) values ('${name}')`,
      }),
    });
    applied += 1;
  }

  if (applied === 0) console.log("  migrations … up to date");
}

// The seed upserts by id, so re-running it updates the courses in place.
if (doSeed) {
  await sql(readFileSync(join(root, "supabase/seed.sql"), "utf8"), "seed.sql");

  const counts = await api(`/projects/${ref}/database/query`, {
    method: "POST",
    body: JSON.stringify({
      query:
        "select (select count(*) from public.courses) as courses, " +
        "(select count(*) from public.lessons) as lessons, " +
        "(select count(*) from public.quiz_questions) as questions",
    }),
  });
  const row = counts?.[0] ?? {};
  console.log(
    `  ${row.courses} courses, ${row.lessons} lessons, ${row.questions} quiz questions\n`,
  );
}

// ── Auth ─────────────────────────────────────────────────────────────────────
if (doAuth) {
  console.log("Auth");
  await configureAuth(api, ref, {
    appUrl: (process.env.APP_URL ?? "").replace(/\/$/, ""),
    googleId: process.env.GOOGLE_CLIENT_ID,
    googleSecret: process.env.GOOGLE_CLIENT_SECRET,
  });
}

// ── What to put in .env.local ────────────────────────────────────────────────
const keys = await api(`/projects/${ref}/api-keys`);
const publishable = keys.find((key) => key.type === "publishable" || key.name === "anon");

console.log("For apps/web/.env.local:\n");
console.log(`  NEXT_PUBLIC_SUPABASE_URL=https://${ref}.supabase.co`);
if (publishable?.api_key)
  console.log(`  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=${publishable.api_key}`);
console.log(
  "\n  SUPABASE_SECRET_KEY — copy it yourself from Project Settings → API keys.\n" +
    "  It bypasses RLS, so this script does not print it.\n",
);
