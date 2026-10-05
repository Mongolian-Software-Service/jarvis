#!/usr/bin/env node
/**
 * The Google OAuth client, into Vercel Production and this laptop — after
 * Google has said the pair is real.
 *
 *   pnpm google:keys
 *
 * Without both keys `googleDirect()` says no and sign-in goes through
 * Supabase's redirect, whose account chooser reads «to continue to
 * dhdrcjhrznkgdizkuolo.supabase.co» (CLAUDE.md §6.6). On 2026-10-05 the laptop
 * held the 64-hex SHA-256 that Supabase's Management API returns in place of
 * the secret, and Vercel held no Google key at all — so both took that path,
 * and the direct flow, written and correct, had never once run.
 *
 * The secret is asked for with the echo off, like `bonum:keys`, and tried
 * against Google's token endpoint with a code that cannot be real. Google
 * checks the client before the code: `invalid_grant` means the pair was
 * accepted and `invalid_client` means it was not. Only an accepted pair writes
 * anything.
 *
 * What this cannot check is the OAuth client's redirect list. Both callback
 * URLs must be on it, or Google answers `redirect_uri_mismatch` and nobody can
 * sign in with Google at all — so the script says so last, where it is read.
 *
 * Prompts are Mongolian for the same reason as `bonum:keys`: the owner runs it.
 * Every refusal exits 0, also for the same reason.
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { REPO_ROOT } from "./env.mjs";
import { describe } from "./bonum/probe.mjs";
import { ask, setEnvFile, setVercelSecret } from "./secrets.mjs";

const SITE = "https://www.tsstark-academy.com";
const CALLBACKS = [`${SITE}/auth/google`, "http://localhost:3001/auth/google"];
const LOCAL_ENV = join(REPO_ROOT, "apps/web/.env.local");
const CLIENT_ID = /^\d+-[a-z0-9]+\.apps\.googleusercontent\.com$/;

function stop(lines) {
  console.log(`\n  ✗ ${lines}\n\n  Юу ч бичигдээгүй — Vercel ч, энэ компьютер ч хэвээрээ.\n`);
  process.exit(0);
}

/** The client id already on this laptop, offered so Enter keeps it. */
function currentClientId() {
  if (!existsSync(LOCAL_ENV)) return "";
  const line = readFileSync(LOCAL_ENV, "utf8").match(/^GOOGLE_CLIENT_ID=(.*)$/m);
  return line?.[1]?.trim().replace(/^["']|["']$/g, "") ?? "";
}

/** Google's verdict on the pair, from an exchange that is meant to fail. */
async function tryGoogle(clientId, clientSecret) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code: "tsa-probe-not-a-real-code",
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: CALLBACKS[0],
      grant_type: "authorization_code",
    }),
    signal: AbortSignal.timeout(10_000),
  }).catch(() => null);
  if (!response) return { ok: false, error: "сүлжээ — Google руу холбогдож чадсангүй" };
  const body = await response.json().catch(() => ({}));
  const ok = body.error === "invalid_grant" || body.error === "redirect_uri_mismatch";
  return {
    ok,
    error: `${response.status} ${body.error ?? ""} ${body.error_description ?? ""}`.trim(),
  };
}

if (!process.stdin.isTTY) {
  console.error("\n  ✗ Терминал дотор ажиллуулна уу — түлхүүрийг нууцаар асуудаг.\n");
  process.exit(1);
}

console.log(
  "\n  Google нэвтрэлт → Vercel Production + энэ компьютер (localhost).\n" +
    "  Google Cloud Console → Clients → TsStark-ийн client-ээс хуулна.\n" +
    "  Secret дэлгэцэнд харагдахгүй — энэ хэвийн.\n",
);

const existing = currentClientId();
const hint = existing ? ` [Enter = ${existing.slice(0, 12)}…]` : "";
const clientId = (await ask(`  Client ID${hint}: `, false)) || existing;
const clientSecret = await ask("  Client secret (нууц, GOCSPX-…): ", true);

const prefixed = clientSecret.startsWith("GOCSPX-");
console.log(`\n  Client secret: ${describe(clientSecret)}, ${prefixed ? "GOCSPX-… ✓" : "GOCSPX- биш ✗"}\n`);

if (!CLIENT_ID.test(clientId)) {
  stop("Client ID «…apps.googleusercontent.com» гэж төгсөх ёстой. Буруу зүйл хуулагдсан байна.");
}
if (!clientSecret) stop("Client secret хоосон байна — юу ч наагдаагүй.");
if (/^[0-9a-f]{64}$/.test(clientSecret)) {
  stop(
    "Энэ бол secret биш, Supabase-ийн буцаадаг SHA-256 hash. Жинхэнэ secret нь\n" +
      "    «GOCSPX-» гэж эхэлдэг бөгөөд зөвхөн Google Cloud Console-оос авна.",
  );
}
// Every secret Google has issued since 2021 carries the prefix, and a 58-character
// paste that did not is what the first real run of this script was handed.
if (!prefixed) {
  stop(
    "Google-ийн secret «GOCSPX-» гэж эхэлдэг — өөр зүйл хуулагдсан байна. Console дээр\n" +
      "    NEW гэсэн secret-ийн хажуудах хуулах (⧉) товчийг дараад дахин оролдоно уу.",
  );
}

process.stdout.write("  Google (oauth2.googleapis.com) … ");
const verdict = await tryGoogle(clientId, clientSecret);
if (!verdict.ok) {
  console.log(`татгалзлаа: ${verdict.error}`);
  stop(
    "Google энэ Client ID, secret хоёрыг хүлээж авсангүй. Хоёулаа НЭГ client-ийнх\n" +
      "    эсэхийг шалгана уу. Дөнгөж нэмсэн secret Google дээр идэвхжихэд хэдэн минут\n" +
      "    болдог — тийм бол 5 минутын дараа дахин ажиллуулна уу.",
  );
}
console.log("зөв ✓\n");

for (const [name, value] of [
  ["GOOGLE_CLIENT_ID", clientId],
  ["GOOGLE_CLIENT_SECRET", clientSecret],
]) {
  const failed = setVercelSecret(name, value);
  if (failed) stop(`Vercel: ${name} бичигдсэнгүй — ${failed}`);
  console.log(`  ✓ Vercel  ${name}`);
}

setEnvFile(
  LOCAL_ENV,
  { GOOGLE_CLIENT_ID: clientId, GOOGLE_CLIENT_SECRET: clientSecret },
  { heading: "# Google — written by `pnpm google:keys`" },
);
console.log("  ✓ localhost  apps/web/.env.local");

console.log(
  "\n  Бүгд бичигдлээ. Localhost шууд шинэчлэгдэнэ; production дараагийн deploy-оос —\n" +
    "  Claude-д «болсон» гэж хэлэхэд redeploy хийнэ.\n\n" +
    "  Энэ client-ийн «Authorised redirect URIs» дотор эдгээр байх ёстой:\n" +
    CALLBACKS.map((url) => `    ${url}\n`).join(""),
);
