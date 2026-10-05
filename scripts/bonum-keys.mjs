#!/usr/bin/env node
/**
 * Bonum's three credentials, into Vercel Production and this laptop — after
 * Bonum has said yes.
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
 * or a file — described by its shape (length and alphabet, never content), and
 * the terminal id and app secret are tried against Bonum's production token
 * endpoint. Only a token back writes anything. When production refuses, the
 * sandbox is asked the same question: a yes there means the keys are test
 * keys, which is worth knowing and still writes nothing, because this site
 * takes real money.
 *
 * The checksum key cannot be tried that way (only Bonum signs with it), so it
 * is checked for shape; a wrong one shows up after a real payment, as
 * `[bonum] webhook rejected: bad checksum` in the Vercel log.
 *
 * Every refusal ends with exit code 0 on purpose. The owner runs this, and
 * pnpm prints a red `ELIFECYCLE Command failed` under any non-zero exit — which
 * read as the script having crashed when it had done exactly its job.
 *
 * The prompts are Mongolian because the person who runs this is the owner, not
 * a developer; the reasoning stays in English like every other script here.
 */
import { join } from "node:path";
import { REPO_ROOT } from "./env.mjs";
import { PRODUCTION, SANDBOX, describe, looksLabelled, tryBonum, verdict } from "./bonum/probe.mjs";
import { ask, setEnvFile, setVercelSecret } from "./secrets.mjs";

const CALLBACK =
  process.env.BONUM_CALLBACK_URL || "https://www.tsstark-academy.com/api/webhooks/bonum";
const LOCAL_ENV = join(REPO_ROOT, "apps/web/.env.local");

/** A handled outcome: say it, write nothing, leave with 0 (see above). */
function stop(lines) {
  console.log(`\n  ✗ ${lines}\n\n  Юу ч бичигдээгүй — Vercel ч, энэ компьютер ч хэвээрээ.\n`);
  process.exit(0);
}

if (!process.stdin.isTTY) {
  console.error("\n  ✗ Терминал дотор ажиллуулна уу — түлхүүрүүдийг нууцаар асуудаг.\n");
  process.exit(1);
}

console.log(
  "\n  Bonum → Vercel Production + энэ компьютер (localhost).\n" +
    "  Утга бүрийг Bonum самбараас НЭГ НЭГЭЭР нь хуулж, нааж Enter дарна.\n" +
    "  Нууц утгууд дэлгэцэнд харагдахгүй — энэ хэвийн.\n",
);

const terminalId = await ask("  Terminal ID: ", false);
const appSecret = await ask("  App Secret (нууц): ", true);
const checksumKey = await ask("  Merchant checksum key (нууц): ", true);

console.log(`\n  App Secret:   ${describe(appSecret)}`);
console.log(`  Checksum key: ${describe(checksumKey)}\n`);

if (!/^\d+$/.test(terminalId)) stop("Terminal ID зөвхөн цифр байх ёстой (жишээ нь 17173165).");
if (!appSecret) stop("App Secret хоосон байна — юу ч наагдаагүй.");
if (!checksumKey) stop("Checksum key хоосон байна — юу ч наагдаагүй.");
if (looksLabelled(appSecret)) {
  stop(
    "App Secret дотор «:» эсвэл кирилл үсэг байна — нэг түлхүүр биш, хэд хэдэн мөр\n" +
      "    хамт хуулагдсан байна. Зөвхөн түлхүүрийг өөрийг нь хуулж дахин оролдоно уу.",
  );
}
if (!/^[0-9a-f]+$/i.test(checksumKey)) {
  stop("Checksum key зөвхөн 0-9, a-f тэмдэгтээс бүрдэх ёстой. Буруу зүйл хуулагдсан байна.");
}

process.stdout.write(`  Bonum production (${PRODUCTION}) … `);
const live = await tryBonum(PRODUCTION, terminalId, appSecret);

if (!live.ok) {
  console.log(`татгалзлаа: ${verdict(live)}`);
  process.stdout.write(`  Bonum test (${SANDBOX}) … `);
  const sandbox = await tryBonum(SANDBOX, terminalId, appSecret);

  if (sandbox.ok) {
    console.log("зөв ✓");
    stop(
      "Эдгээр нь TEST түлхүүр байна: Bonum-ын туршилтын сервер хүлээж авсан, бодит сервер\n" +
        "    татгалзсан. Бодит мөнгө авахын тулд Bonum-аас production-ий App Secret авах хэрэгтэй.",
    );
  }
  console.log(`татгалзлаа: ${verdict(sandbox)}`);
  stop(
    "Bonum энэ Terminal ID, App Secret хоёрыг аль ч сервер дээр хүлээж авсангүй.\n" +
      "    1. Bonum самбар → Мерчант → «Secret Key» табаас App Secret-ийг дахин хуулна уу.\n" +
      "    2. Тэгсэн ч ингэж гарвал Bonum-ын дэмжлэг (+976 7200-5000) рүү дээрх\n" +
      "       «trace» дугаартай нь хандаж, ecommerce API-ийн App Secret-ийг асуугаарай.",
  );
}
console.log("зөв ✓\n");

for (const [name, value] of [
  ["BONUM_TERMINAL_ID", terminalId],
  ["BONUM_APP_SECRET", appSecret],
  ["BONUM_MERCHANT_CHECKSUM_KEY", checksumKey],
]) {
  const failed = setVercelSecret(name, value);
  if (failed) stop(`Vercel: ${name} бичигдсэнгүй — ${failed}`);
  console.log(`  ✓ Vercel  ${name}`);
}

setEnvFile(
  LOCAL_ENV,
  {
    BONUM_API_BASE_URL: PRODUCTION,
    BONUM_CALLBACK_URL: CALLBACK,
    BONUM_TERMINAL_ID: terminalId,
    BONUM_APP_SECRET: appSecret,
    BONUM_MERCHANT_CHECKSUM_KEY: checksumKey,
  },
  { drop: ["BONUM_MOCK"], heading: "# Bonum — written by `pnpm bonum:keys`" },
);
console.log("  ✓ localhost  apps/web/.env.local");

console.log(
  "\n  Бүгд бичигдлээ. Production шинэ утгуудыг дараагийн deploy-оос авна —\n" +
    "  Claude-д «болсон» гэж хэлэхэд redeploy хийнэ. Localhost шууд шинэчлэгдэнэ.\n" +
    "  Анхаар: одоо localhost дээрх худалдан авалт ч жинхэнэ мөнгө авна.\n",
);
