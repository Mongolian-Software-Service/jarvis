/**
 * The two places Bonum's keys have to live, written the same way every time.
 *
 * - **Vercel Production**, as Secret-type variables: the live site.
 * - **`apps/web/.env.local`**: the laptop. The owner asked to test purchases on
 *   localhost exactly as on the live site, so localhost holds the live keys
 *   too — and its callback is production's webhook, because Bonum cannot reach
 *   a laptop. Production verifies the callback and settles the row in the one
 *   database both share; the payer's browser is then sent back to localhost
 *   (see the webhook's GET). Real money either way, which is the point.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { REPO_ROOT } from "../env.mjs";

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
 * which loader you ask — and anything new goes at the end under a comment.
 * Every other line, comments included, is left exactly as it was.
 */
export function setEnvFile(file, values, drop = []) {
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
    out.push("", "# Bonum — written by `pnpm bonum:keys`");
    for (const key of missing) out.push(`${key}=${values[key]}`);
  }
  writeFileSync(file, `${out.join("\n").replace(/\n+$/, "")}\n`);
}
