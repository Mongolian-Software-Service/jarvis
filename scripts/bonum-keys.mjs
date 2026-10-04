#!/usr/bin/env node
/**
 * Bonum's three credentials, into Vercel Production — after Bonum has said yes.
 *
 *   pnpm bonum:keys
 *
 * Why a script and not three `vercel env add`s: on 2026-10-04 the keys went in
 * by hand. The CLI's hidden prompt took an empty Enter as a value — it printed
 * `Value is empty` and saved it anyway — and the clipboard route that replaced
 * it stored *something*, after which production answered every purchase with
 * Bonum's `401 NO_AUTH`. Nothing on the way in could have said which of the
 * three was wrong, or that any was.
 *
 * So each value is asked for with the echo off — never in shell history, a chat
 * or a file — and the terminal id and app secret are tried against Bonum's own
 * token endpoint first. Only a token back writes anything. The checksum key
 * cannot be tried that way (only Bonum signs with it), so it is checked for
 * shape and nothing more; a wrong one shows up after a real payment, as
 * `[bonum] webhook rejected: bad checksum` in the Vercel log.
 *
 * Writes go through the Vercel CLI this repo is linked with (`.vercel/`), value
 * on stdin, as Secret-type variables nobody can read back. A variable reaches
 * only builds made after it is set, so the last line says to redeploy.
 *
 * The prompts are Mongolian because the person who runs this is the owner, not
 * a developer; the reasoning stays in English like every other script here.
 */
import { spawnSync } from "node:child_process";
import { createInterface } from "node:readline";
import { Writable } from "node:stream";
import { REPO_ROOT } from "./env.mjs";

const BASE = (process.env.BONUM_API_BASE_URL || "https://apis.bonum.mn").replace(/\/$/, "");

function fail(line) {
  console.error(`\n  ✗ ${line}\n\n  Vercel-д юу ч бичигдээгүй.\n`);
  process.exit(1);
}

/**
 * One line from the terminal, with every space and newline taken out.
 *
 * Hidden by routing readline's echo through a writable that drops it. The
 * prompt itself is written synchronously by `question()`, before `muted` flips,
 * so the question shows and the answer does not.
 */
function ask(question, hidden) {
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

/** Ask Bonum for a token. Reports the status and Bonum's error code — never the token. */
async function tryBonum(terminalId, appSecret) {
  try {
    const response = await fetch(`${BASE}/bonum-gateway/ecommerce/auth/create`, {
      headers: { Authorization: `AppSecret ${appSecret}`, "X-TERMINAL-ID": terminalId },
      signal: AbortSignal.timeout(15_000),
    });
    const body = await response.json().catch(() => null);
    return {
      ok: response.ok && Boolean(body?.accessToken),
      status: response.status,
      code: body?.errorCode ?? null,
    };
  } catch (error) {
    return { ok: false, status: 0, code: error instanceof Error ? error.message : String(error) };
  }
}

function vercel(args, input) {
  return spawnSync("pnpm", ["dlx", "vercel", ...args], { cwd: REPO_ROOT, input, encoding: "utf8" });
}

/** Replace one Production variable. `rm` first, because `add` refuses a name that exists. */
function setSecret(name, value) {
  vercel(["env", "rm", name, "production", "-y"]);
  const added = vercel(["env", "add", name, "production"], value);
  if (added.status !== 0) {
    const why = `${added.stderr ?? ""}${added.stdout ?? ""}`.trim().split("\n").pop();
    fail(`${name} бичигдсэнгүй: ${why}`);
  }
  console.log(`  ✓ ${name}`);
}

if (!process.stdin.isTTY) fail("Терминал дотор ажиллуулна уу — түлхүүрүүдийг нууцаар асуудаг.");

console.log(
  "\n  Bonum → Vercel Production.\n" +
    "  Утга бүрийг нааж Enter дарна. Нууц утгууд дэлгэцэнд харагдахгүй — энэ хэвийн.\n",
);

const terminalId = await ask("  Terminal ID: ", false);
const appSecret = await ask("  App Secret (нууц): ", true);
const checksumKey = await ask("  Merchant checksum key (нууц): ", true);

if (!terminalId) fail("Terminal ID хоосон байна.");
if (!appSecret) fail("App Secret хоосон байна — юу ч наагдаагүй.");
if (!checksumKey) fail("Checksum key хоосон байна — юу ч наагдаагүй.");
if (!/^[0-9a-f]+$/i.test(checksumKey)) {
  fail("Checksum key зөвхөн 0-9, a-f тэмдэгтээс бүрдэх ёстой. Буруу зүйл хуулагдсан байна.");
}

console.log(
  `\n  App Secret: ${appSecret.length} тэмдэгт · checksum key: ${checksumKey.length} тэмдэгт`,
);
process.stdout.write(`  Bonum-аас token авч үзэж байна (${BASE}) … `);

const probe = await tryBonum(terminalId, appSecret);
if (!probe.ok) {
  console.log(`татгалзлаа: HTTP ${probe.status}${probe.code ? ` · ${probe.code}` : ""}`);
  fail(
    "Bonum энэ Terminal ID, App Secret хоёрыг хүлээж авсангүй.\n" +
      "    Bonum самбар → Мерчант → «Терминал» табаас терминалын дугаарыг,\n" +
      "    «Secret Key» табаас тэр терминалын App Secret-ийг хуулж дахин оролдоно уу.\n" +
      "    Тэгсэн ч 401 гарвал Bonum-ын дэмжлэгээс ecommerce API-ийн түлхүүрийг асуугаарай.",
  );
}
console.log("зөв ✓\n");

setSecret("BONUM_TERMINAL_ID", terminalId);
setSecret("BONUM_APP_SECRET", appSecret);
setSecret("BONUM_MERCHANT_CHECKSUM_KEY", checksumKey);

console.log(
  "\n  Vercel Production-д бичигдлээ. Шинэ утгууд дараагийн deploy-оос л орно —\n" +
    "  production-ийг redeploy хийнэ үү (Claude-д «болсон» гэж хэлэхэд хангалттай).\n",
);
