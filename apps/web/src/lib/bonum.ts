import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Bonum PSP client. Server only — the app secret, the terminal id and the
 * checksum key must never reach a bundle.
 *
 *   test        https://testapi.bonum.mn
 *   production  https://apis.bonum.mn
 *
 * Money stays integer tögrög throughout: Bonum's `amount` is a plain number and
 * MNT has no minor unit to divide by.
 */

const BASE_URL = process.env.BONUM_API_BASE_URL ?? "https://testapi.bonum.mn";

/** Thirty minutes to pay — long enough to fetch a card, short enough to expire. */
const DEFAULT_EXPIRES_IN = 1800;

/**
 * How long to wait for the gateway before giving up.
 *
 * `fetch` without a limit waits as long as the network will let it, which on an
 * unreachable host is minutes — and the button that started it stays in its
 * loading state for all of them. Fifteen seconds is past any answer worth
 * having; beyond it the caller says the payment system could not be reached,
 * which is both true and something a person can act on.
 */
const TIMEOUT_MS = 15_000;

/*
 * There is no mock mode (decision #015).
 *
 * `BONUM_MOCK=1` used to settle a purchase on the spot, without the gateway —
 * and it settled it in whatever database the machine was pointed at. This
 * project has one database, the live one, so every "test" purchase on a laptop
 * was a real enrolment in production, granted for nothing. The only way a
 * course opens now is a signed callback from Bonum.
 */

/** The three values without which no invoice can be made or verified. */
const CREDENTIALS = ["BONUM_APP_SECRET", "BONUM_TERMINAL_ID", "BONUM_MERCHANT_CHECKSUM_KEY"];

/**
 * Whether this deployment can take a payment at all.
 *
 * Asked **before** a `payments` row is written. Without it a laptop with no
 * keys wrote a pending row into the live table, failed inside `accessToken()`,
 * and left the admin console a «failed» payment for every click — none of them
 * anybody's money.
 */
export function paymentsConfigured(): boolean {
  return CREDENTIALS.every((name) => Boolean(process.env[name]));
}

/**
 * Say it out loud when a development machine is pointed at the live gateway.
 *
 * With the live keys and `BONUM_API_BASE_URL=https://apis.bonum.mn`, every
 * purchase on localhost mints a real invoice against the real terminal and
 * takes real money. It does work end to end — the callback goes to production,
 * which settles the row in the one database both share — which is exactly why
 * it should not happen quietly.
 */
let warned = false;
function warnIfLiveInDevelopment(): void {
  if (warned || process.env.NODE_ENV === "production") return;
  if (!/apis\.bonum\.mn/.test(BASE_URL)) return;
  warned = true;
  console.error(
    "[bonum] development is pointed at the LIVE gateway (%s). Purchases here take real money.",
    BASE_URL,
  );
}

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set — required to talk to Bonum.`);
  return value;
}

/**
 * Where Bonum POSTs the result.
 *
 * The same URL serves twice: as the signed webhook (POST, carries the
 * transaction) and as the payer's own trip back (GET, carries nothing). `to`
 * rides along so the GET knows which course to send them to; the POST ignores
 * it and reads the transaction from the body.
 */
export function callbackUrl(returnTo?: string): string {
  const base =
    process.env.BONUM_CALLBACK_URL ??
    `${(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001").replace(/\/$/, "")}/api/webhooks/bonum`;
  return returnTo
    ? `${base}${base.includes("?") ? "&" : "?"}to=${encodeURIComponent(returnTo)}`
    : base;
}

type TokenResponse = {
  tokenType: string;
  accessToken: string;
  expiresIn: number;
};

/** Tokens live minutes, not requests, so one is reused across checkouts. */
let cached: { token: string; expiresAt: number } | null = null;

async function accessToken(): Promise<string> {
  warnIfLiveInDevelopment();
  if (cached && cached.expiresAt > Date.now()) return cached.token;

  const res = await fetch(`${BASE_URL}/bonum-gateway/ecommerce/auth/create`, {
    method: "GET",
    headers: {
      Authorization: `AppSecret ${required("BONUM_APP_SECRET")}`,
      "X-TERMINAL-ID": required("BONUM_TERMINAL_ID"),
    },
    cache: "no-store",
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`Bonum auth failed (${res.status}): ${await res.text()}`);

  const data = (await res.json()) as TokenResponse;
  // Refreshed 30s early so a request cannot race the expiry.
  const ttl = Math.max(0, (data.expiresIn ?? 0) * 1000 - 30_000);
  cached = { token: data.accessToken, expiresAt: Date.now() + ttl };
  return data.accessToken;
}

/**
 * A line on the invoice.
 *
 * `remark` is **required**, whatever the documentation says — the live API
 * refuses an item without one, with a JSON parse error about a non-nullable
 * creator parameter. It is part of the type so the next caller cannot forget.
 */
export type InvoiceItem = { title: string; amount: number; count: number; remark: string };

export type Invoice = { invoiceId: string; followUpLink: string };

/**
 * Create an invoice and get the link to send the payer to.
 *
 * `transactionId` is our own `payments.id`. It comes back verbatim in the
 * webhook, and is how a payment is matched to what it paid for — the callback
 * itself does not say what was bought.
 */
export async function createInvoice(input: {
  transactionId: string;
  amountMnt: number;
  items?: InvoiceItem[];
  /**
   * Seconds the invoice stays payable. The documentation calls it optional; the
   * live API answers `500 Missing required creator property expiresIn` without
   * it, so it always goes out.
   */
  expiresIn?: number;
  returnTo?: string;
}): Promise<Invoice> {
  const res = await fetch(`${BASE_URL}/bonum-gateway/ecommerce/invoices`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${await accessToken()}`,
      "Accept-Language": "mn",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: input.amountMnt,
      callback: callbackUrl(input.returnTo),
      transactionId: input.transactionId,
      expiresIn: input.expiresIn ?? DEFAULT_EXPIRES_IN,
      ...(input.items ? { items: input.items.map(withRemark) } : {}),
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`Bonum invoice failed (${res.status}): ${await res.text()}`);

  const data = (await res.json()) as Invoice;
  if (!data.invoiceId || !data.followUpLink) {
    throw new Error("Bonum invoice response missing invoiceId/followUpLink");
  }
  return data;
}

function withRemark(item: InvoiceItem): InvoiceItem {
  return item.remark?.trim() ? item : { ...item, remark: item.title };
}

/**
 * Verify the `x-checksum-v2` header: hex HMAC-SHA256 of the **raw** body with
 * the merchant checksum key.
 *
 * Compared in constant time — a plain `===` on a signature leaks how far it
 * matched, one byte at a time, to anybody willing to send enough callbacks.
 */
export function verifyChecksum(rawBody: string, header: string | null): boolean {
  if (!header) return false;
  const expected = createHmac("sha256", required("BONUM_MERCHANT_CHECKSUM_KEY"))
    .update(rawBody, "utf8")
    .digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(header.trim().toLowerCase(), "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

/** The shape Bonum POSTs to `callbackUrl()`. */
export type BonumWebhook = {
  type: "PAYMENT" | "CARD-TOKEN" | string;
  status: "SUCCESS" | "FAILED" | string;
  message?: string;
  body?: {
    transactionId?: string;
    invoiceId?: string;
    amount?: number;
    currency?: string;
    status?: string;
    invoiceStatus?: string;
    completedAt?: string;
  };
};
