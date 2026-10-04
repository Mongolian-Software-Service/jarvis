import {
  BUNDLE_PRICE_MNT,
  COURSE_REMARK_MN,
  checkoutSchema,
  strings,
  toLocale,
} from "@jarvis/core";
import { createServerSupabase, getUserId } from "@/lib/supabase/server";
import { createInvoice, paymentsConfigured } from "@/lib/bonum";

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

  /*
   * No keys, no payment row. A deployment that cannot reach Bonum says so in a
   * sentence the button can show, and writes nothing — rather than leaving a
   * «failed» payment in the live table for every click on a laptop.
   */
  if (!paymentsConfigured()) {
    return Response.json(
      {
        ok: false,
        error: "payments-unconfigured",
        message: strings(locale).learn.bundle.unconfigured,
      },
      { status: 503 },
    );
  }

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
   * There is no other branch. A mock mode used to settle the invoice right
   * here, with the service key, without the gateway — and since this project
   * has one database, every laptop "purchase" opened every course in
   * production for nothing (decision #015). A course opens on a signed Bonum
   * callback and in no other way.
   *
   * `returnTo` carries the payment's own id, so the payer comes back to the
   * page that waits for exactly this payment to settle (see the webhook's GET).
   */
  try {
    const invoice = await createInvoice({
      transactionId: payment.id,
      amountMnt: amount,
      returnTo: `${locale}:${payment.id}`,
      items: [{ title, amount, count: 1, remark: COURSE_REMARK_MN }],
    });

    /*
     * Nothing is written back here, and that is the policy, not an omission.
     * A buyer may insert their pending row and read it — never update it,
     * because a buyer who can write `payments` can write `status`. This used
     * to `update` the invoice id and, on failure, the status: both matched no
     * policy and changed nothing, silently. The webhook finds the row by
     * `transactionId` (our `payments.id`) and attaches the invoice id itself.
     */
    return Response.json({ ok: true, url: invoice.followUpLink });
  } catch (error) {
    // A failed attempt stays `pending` with no invoice: nothing can pay it, and
    // the console reads it as abandoned once INVOICE_LIFETIME_MS has passed.
    console.error("[checkout] bonum invoice failed", error);
    return Response.json(
      {
        ok: false,
        error: "gateway-unreachable",
        message: strings(locale).learn.bundle.gatewayFailed,
      },
      { status: 502 },
    );
  }
}
