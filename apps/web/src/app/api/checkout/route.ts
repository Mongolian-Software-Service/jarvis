import { BUNDLE_PRICE_MNT, COURSE_REMARK_MN, checkoutSchema, learnPath, toLocale } from "@jarvis/core";
import type { Json } from "@jarvis/types";
import { createServerSupabase, createServiceSupabase, getUserId } from "@/lib/supabase/server";
import { createInvoice, isMockMode } from "@/lib/bonum";

/**
 * Start a purchase. There is one thing to buy: every published course, once.
 *
 * The order matters and is the whole security of this route:
 *
 *   1. the buyer is the signed-in user, never an id from the request body;
 *   2. the amount is `BUNDLE_PRICE_MNT`, read here — never from what the
 *      client sent, and no longer from a course row, because a course has no
 *      price of its own (§1);
 *   3. the `payments` row is written **as the buyer**, so the policy checks it
 *      (their own id, status pending) instead of this code promising to;
 *   4. only then does anything leave for the gateway.
 *
 * The payment carries `course_id = null`, and `settle_payment()` reads that as
 * "enrol them in everything published" — in one statement, inside the same
 * transaction that marks the invoice paid. It stays a nullable column rather
 * than none at all: payments taken for a single course before this existed are
 * still in the table, and a receipt should keep saying what it bought.
 */
export async function POST(request: Request): Promise<Response> {
  const userId = await getUserId();
  if (!userId) return Response.json({ ok: false, error: "unauthorised" }, { status: 401 });

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ ok: false, error: "bad-request" }, { status: 400 });
  }

  const parsed = checkoutSchema.safeParse(payload);
  if (!parsed.success) return Response.json({ ok: false, error: "bad-request" }, { status: 400 });

  const locale = toLocale(new URL(request.url).searchParams.get("locale"));
  const supabase = createServerSupabase();

  // ── What is being bought ───────────────────────────────────────────────────
  //
  // Refuse to sell an empty school. A payment settled against nothing published
  // would take money and enrol the buyer in no courses at all.
  const { count } = await supabase
    .from("courses")
    .select("id", { count: "exact", head: true })
    .eq("is_published", true);

  if (!count) return Response.json({ ok: false, error: "nothing-to-sell" }, { status: 400 });

  const amount = BUNDLE_PRICE_MNT;
  const title = "Бүх сургалт";
  const returnPath = learnPath(locale);

  // ── The pending row, written as the buyer ──────────────────────────────────
  const { data: payment, error: paymentError } = await supabase
    .from("payments")
    .insert({
      user_id: userId,
      course_id: null,
      amount_mnt: amount,
      provider: "bonum",
      status: "pending",
    })
    .select("id")
    .single();

  if (paymentError || !payment) {
    return Response.json({ ok: false, error: "payment-create-failed" }, { status: 500 });
  }

  /*
   * Mock mode settles the invoice here and now.
   *
   * The one place the service client appears outside the webhook, and reachable
   * only when `isMockMode()` is true — which requires NODE_ENV !== production.
   * In production this branch does not exist.
   */
  if (isMockMode()) {
    const service = createServiceSupabase();
    const invoiceId = `mock-${payment.id}`;

    await service.from("payments").update({ invoice_id: invoiceId }).eq("id", payment.id);
    const { error } = await service.rpc("settle_payment", {
      p_invoice_id: invoiceId,
      p_status: "paid",
      p_raw: { mock: true, amount } as unknown as Json,
      p_provider: "bonum",
    });

    if (error) {
      console.error("[checkout] mock settle failed", error.message);
      return Response.json({ ok: false, error: "mock-settle-failed" }, { status: 500 });
    }

    return Response.json({
      ok: true,
      mock: true,
      url: `/${locale}/checkout?payment=${payment.id}`,
    });
  }

  try {
    const invoice = await createInvoice({
      transactionId: payment.id,
      amountMnt: amount,
      returnTo: `${locale}:${returnPath}`,
      items: [{ title, amount, count: 1, remark: COURSE_REMARK_MN }],
    });

    await supabase.from("payments").update({ invoice_id: invoice.invoiceId }).eq("id", payment.id);
    return Response.json({ ok: true, url: invoice.followUpLink });
  } catch (error) {
    console.error("[checkout] bonum invoice failed", error);
    await supabase.from("payments").update({ status: "failed" }).eq("id", payment.id);
    return Response.json({ ok: false, error: "gateway-unreachable" }, { status: 502 });
  }
}
