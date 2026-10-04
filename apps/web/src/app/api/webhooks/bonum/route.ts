import { headers } from "next/headers";
import { checkoutPath, learnPath, toLocale, toPaymentStatus } from "@jarvis/core";
import type { Json } from "@jarvis/types";
import { verifyChecksum, type BonumWebhook } from "@/lib/bonum";
import { createServiceSupabase } from "@/lib/supabase/server";

/**
 * The Bonum callback.
 *
 * This route is the **only** legitimate user of the service key: it writes for
 * a buyer who is not in the request, and it is the only authority in the system
 * on whether money moved. Nothing else, anywhere, opens a course because it
 * thinks a payment succeeded.
 *
 * The effect itself is one function in the database — `settle_payment()` marks
 * the invoice and creates the enrolment in one transaction — so this route only
 * authenticates the call and forwards it. Half of that pair would be worse than
 * neither: money taken and nothing unlocked is a support call, and a serverless
 * function killed between two statements is how it happens.
 */

/**
 * The payer's own trip back.
 *
 * Bonum reuses the callback URL to return the browser after payment, and a
 * signed webhook is always a POST — so a GET here is a person, and a person
 * must not be answered with a bare 405. `?to=` was set when the invoice was
 * created and carries `locale:paymentId`.
 *
 * They go to the checkout page for that payment, which polls until the POST
 * has settled it and then sends them into their courses. It used to carry
 * `locale:slug` from the days of one course per payment; the bundle sent
 * `mn:/mn/learn`, which this read as a slug and turned into
 * `/mn/courses//mn/learn` — a 404 for everybody who had just paid.
 *
 * Without a payment id (the merchant-level webhook URL carries no `to`), the
 * dashboard is the right place: the courses appear there once settled.
 */
const PAYMENT_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const app = (process.env.NEXT_PUBLIC_APP_URL ?? url.origin).replace(/\/$/, "");
  const marker = url.searchParams.get("to") ?? "";
  const cut = marker.indexOf(":");
  const locale = toLocale(cut > 0 ? marker.slice(0, cut) : null);
  const paymentId = cut > 0 ? marker.slice(cut + 1) : "";
  const destination = PAYMENT_ID.test(paymentId)
    ? checkoutPath(locale, paymentId)
    : learnPath(locale);
  return Response.redirect(`${app}${destination}`, 303);
}

export async function POST(request: Request): Promise<Response> {
  // The raw text, not the parsed body: the checksum is over the bytes that
  // arrived, and `JSON.parse` followed by `JSON.stringify` is not those bytes.
  const raw = await request.text();
  const checksum = (await headers()).get("x-checksum-v2");

  if (!verifyChecksum(raw, checksum)) {
    console.error("[bonum] webhook rejected: bad checksum");
    return new Response("Invalid checksum", { status: 400 });
  }

  let event: BonumWebhook;
  try {
    event = JSON.parse(raw) as BonumWebhook;
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  // Card tokenisation events share this endpoint. We do not store cards.
  if (event.type !== "PAYMENT") return Response.json({ ok: true, ignored: event.type });

  const transactionId = event.body?.transactionId;
  if (!transactionId) return new Response("Missing transactionId", { status: 400 });

  const supabase = createServiceSupabase();

  /*
   * The invoice id is what `settle_payment` looks up, and the gateway may not
   * echo one on a failure — so it is written here from the transaction we
   * started with. `transactionId` is our own `payments.id`.
   */
  const invoiceId = event.body?.invoiceId ?? `bonum-${transactionId}`;
  const { data: payment } = await supabase
    .from("payments")
    .select("id, invoice_id")
    .eq("id", transactionId)
    .maybeSingle();

  if (!payment) {
    // Not ours, or already cleaned up. 200, so the gateway stops retrying a
    // delivery that will never succeed.
    console.error("[bonum] webhook for unknown transaction", transactionId);
    return Response.json({ ok: true, unknown: true });
  }

  if (!payment.invoice_id) {
    await supabase.from("payments").update({ invoice_id: invoiceId }).eq("id", payment.id);
  }

  const status =
    event.status === "SUCCESS"
      ? "paid"
      : toPaymentStatus(event.body?.invoiceStatus ?? event.status ?? "failed");

  const { error } = await supabase.rpc("settle_payment", {
    p_invoice_id: payment.invoice_id ?? invoiceId,
    p_status: status,
    // The gateway's own words, kept verbatim for the console and the support
    // call six months from now. Cast because `Json` is a structural type and
    // the webhook shape is a named one — the value is the parsed body either way.
    p_raw: event as unknown as Json,
    p_provider: "bonum",
  });

  if (error) {
    console.error("[bonum] settle_payment failed", error.message);
    return new Response("Settle failed", { status: 500 });
  }

  return Response.json({ ok: true });
}
