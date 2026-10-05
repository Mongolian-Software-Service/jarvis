/**
 * Where a secret comes from and the two places it goes, written the same way
 * for every key the owner pastes in (`pnpm bonum:keys`, `pnpm google:keys`).
 *
 * - **From the terminal, echo off**: never in shell history, a chat or a file
 *   on the way in.
 * - **Vercel Production**, as Secret-type variables: the live site.
 * - **`apps/web/.env.local`**: the laptop, so localhost behaves like the live
 *   site. For Bonum that means real money on localhost too, which the owner
 *   asked for; for Google it means the chooser names our domain there as well.
 *
 * It lived in `scripts/bonum/` while Bonum was its only caller. The second
 * caller is why it moved rather than being copied: two hidden prompts is two
 * places an empty Enter is treated differently.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { createInterface } from "node:readline";
import { Writable } from "node:stream";
import { REPO_ROOT } from "./env.mjs";

/**
 * One line from the terminal, with every space and newline taken out.
 *
 * Hidden by routing readline's echo through a writable that drops it. The
 * prompt itself is written synchronously by `question()`, before `muted` flips,
 * so the question shows and the answer does not.
 */
export function ask(question, hidden) {
  return new Promise((resolve) => {
    let muted = false;
    const output = new Writable({
      write(chunk, encoding, done) {
        if (!muted) process.stdout.write(chunk, encoding);
        done();
      },
    });
    const rl = createInterface({ input: process.stdin, output, terminal: true });
    rl.question(question, (answer) => {
      rl.close();
      if (hidden) process.stdout.write("\n");
      resolve(answer.replace(/\s+/g, ""));
    });
    muted = hidden;
  });
}

function vercel(args, input) {
  return spawnSync("pnpm", ["dlx", "vercel", ...args], { cwd: REPO_ROOT, input, encoding: "utf8" });
}

/**
 * Replace one Production variable. `rm` first, because `add` refuses a name
 * that exists; a missing name makes `rm` fail, which is fine. Returns the
 * CLI's last line when `add` fails, or null.
 */
export function setVercelSecret(name, value) {
  vercel(["env", "rm", name, "production", "-y"]);
  const added = vercel(["env", "add", name, "production"], value);
  if (added.status === 0) return null;
  return `${added.stderr ?? ""}${added.stdout ?? ""}`.trim().split("\n").pop() || "unknown error";
}

/**
 * Set keys in a dotenv file, in place.
 *
 * An existing line is rewritten where it stands, a second copy of the same
 * name is dropped — two lines for one key is a key whose value depends on
 * which loader you ask — and anything new goes at the end under `heading`.
 * Every other line, comments included, is left exactly as it was.
 */
export function setEnvFile(file, values, { drop = [], heading } = {}) {
  const lines = existsSync(file) ? readFileSync(file, "utf8").split("\n") : [];
  const seen = new Set();
  const out = [];

  for (const line of lines) {
    const key = /^\s*([A-Z0-9_]+)\s*=/.exec(line)?.[1];
    if (key && drop.includes(key)) continue;
    if (key && key in values) {
      if (!seen.has(key)) out.push(`${key}=${values[key]}`);
      seen.add(key);
      continue;
    }
    out.push(line);
  }

  const missing = Object.keys(values).filter((key) => !seen.has(key));
  if (missing.length > 0) {
    while (out.length > 0 && out[out.length - 1] === "") out.pop();
    out.push("", heading ?? "# written by a `pnpm …:keys` script");
    for (const key of missing) out.push(`${key}=${values[key]}`);
  }
  writeFileSync(file, `${out.join("\n").replace(/\n+$/, "")}\n`);
}
