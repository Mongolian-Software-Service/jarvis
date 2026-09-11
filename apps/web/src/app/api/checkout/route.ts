import { COURSE_REMARK_MN, checkoutSchema, coursePath, localized, toLocale } from "@jarvis/core";
import { createServerSupabase, createServiceSupabase, getUserId } from "@/lib/supabase/server";
import { createInvoice, isMockMode } from "@/lib/bonum";

/**
 * Start a purchase.
 *
 * The order matters and is the whole security of this route:
 *
 *   1. the buyer is the signed-in user, never an id from the request body;
 *   2. the price is read from the course row, never from what the client sent;
 *   3. the `payments` row is written **as the buyer**, so the policy checks it
 *      (their own id, status pending) instead of this code promising to;
 *   4. only then does anything leave for the gateway.
 *
 * Returns JSON rather than redirecting, because the button that called it wants
 * to show its own error without losing the page underneath.
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

  const { data: course } = await supabase
    .from("courses")
    .select("id, slug, title_mn, title_en, price_mnt, is_published")
    .eq("id", parsed.data.course_id)
    .maybeSingle();

  if (!course || !course.is_published) {
    return Response.json({ ok: false, error: "not-found" }, { status: 404 });
  }

  // A free course is an enrolment, not a payment. The caller should have used
  // the free path; answering clearly beats minting a 0₮ invoice.
  if (course.price_mnt <= 0) {
    return Response.json({ ok: false, error: "free-course" }, { status: 400 });
  }

  const { data: existing } = await supabase
    .from("enrollments")
    .select("id")
    .eq("user_id", userId)
    .eq("course_id", course.id)
    .maybeSingle();

  if (existing) {
    return Response.json({ ok: true, alreadyEnrolled: true, url: coursePath(locale, course.slug) });
  }

  const { data: payment, error: paymentError } = await supabase
    .from("payments")
    .insert({
      user_id: userId,
      course_id: course.id,
      amount_mnt: course.price_mnt,
      provider: "bonum",
      status: "pending",
    })
    .select("id")
    .single();

  if (paymentError || !payment) {
    return Response.json({ ok: false, error: "payment-create-failed" }, { status: 500 });
  }

  const title = localized(locale, course.title_mn, course.title_en);
  const returnTo = `${locale}:${course.slug}`;

  /*
   * Mock mode settles the invoice here and now.
   *
   * This is the one place the service client appears outside the webhook, and
   * it is reachable only when `isMockMode()` is true — which requires
   * NODE_ENV !== production. In production this branch does not exist.
   */
  if (isMockMode()) {
    const service = createServiceSupabase();
    const { error } = await service.rpc("settle_payment", {
      p_invoice_id: `mock-${payment.id}`,
      p_status: "paid",
      p_raw: { mock: true, amount: course.price_mnt },
      p_provider: "bonum",
    });

    // The invoice id has to exist before settle_payment can find it.
    if (error) {
      await service.from("payments").update({ invoice_id: `mock-${payment.id}` }).eq("id", payment.id);
      const retry = await service.rpc("settle_payment", {
        p_invoice_id: `mock-${payment.id}`,
        p_status: "paid",
        p_raw: { mock: true, amount: course.price_mnt },
        p_provider: "bonum",
      });
      if (retry.error) {
        return Response.json({ ok: false, error: "mock-settle-failed" }, { status: 500 });
      }
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
      amountMnt: course.price_mnt,
      returnTo,
      items: [
        {
          title,
          amount: course.price_mnt,
          count: 1,
          remark: COURSE_REMARK_MN,
        },
      ],
    });

    await supabase.from("payments").update({ invoice_id: invoice.invoiceId }).eq("id", payment.id);

    return Response.json({ ok: true, url: invoice.followUpLink });
  } catch (error) {
    console.error("[checkout] bonum invoice failed", error);
    await supabase.from("payments").update({ status: "failed" }).eq("id", payment.id);
    return Response.json({ ok: false, error: "gateway-unreachable" }, { status: 502 });
  }
}
