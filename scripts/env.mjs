/**
 * The `.env` at the repo root, loaded by hand.
 *
 * These scripts are plain Node, not Next — nothing loads a `.env` for them.
 * `supabase-setup.mjs` had its own copy of this and `upload-video.mjs` needed
 * the same file with the same quoting rules; two copies of a parser is two
 * places a stray quote behaves differently, and the second one is always the
 * one nobody tests.
 *
 * The real environment wins: a variable already set is never overwritten, so
 *
 *   CLOUDFLARE_API_TOKEN=… pnpm video:upload film.mp4 ehlehiin-umnu
 *
 * works without editing a file. That matters for a token somebody would rather
 * not leave on disk at all.
 */
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

/** The repo root, from this file's own location — never from `process.cwd()`. */
export const REPO_ROOT = dirname(dirname(fileURLToPath(import.meta.url)));

export function loadEnvFile(file = join(REPO_ROOT, ".env")) {
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)$/.exec(line);
    if (!match?.[1]) continue;
    const value = (match[2] ?? "").trim().replace(/^["']|["']$/g, "");
    if (value && !process.env[match[1]]) process.env[match[1]] = value;
  }
}

/**
 * A variable the script cannot run without, and how to get one.
 *
 * Exits rather than throwing: a stack trace from inside a fetch tells somebody
 * that a token is missing in the least useful way available.
 */
export function required(name, hint) {
  const value = process.env[name];
  if (value) return value;
  console.error(`\n${name} is not set.\n\n  ${hint}\n`);
  process.exit(1);
}
