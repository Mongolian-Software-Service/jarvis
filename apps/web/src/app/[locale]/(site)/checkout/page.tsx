import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { coursePlayerPath, formatMoney, learnPath, paymentState } from "@jarvis/core";
import { getIntl } from "@/lib/locale";
import { createServerSupabase, getUserId } from "@/lib/supabase/server";
import { isMockMode } from "@/lib/bonum";
import { buttonClass } from "@/components/ui/button";
import { PaymentPoller } from "@/components/course/payment-poller";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getIntl();
  return { title: t.learn.checkout.pendingTitle, robots: { index: false } };
}

/**
 * Where a buyer lands after paying.
 *
 * The page reads the payment row rather than anything in the URL: the gateway
 * sends the browser back with no proof of anything, and the only authority on
 * whether money moved is the webhook that already wrote this row.
 */
export default async function CheckoutPage({ searchParams }: PageProps<"/[locale]/checkout">) {
  const { locale, t } = await getIntl();
  const { payment: paymentId } = await searchParams;

  const userId = await getUserId();
  const supabase = createServerSupabase();

  const { data: payment } =
    userId && typeof paymentId === "string"
      ? await supabase
          .from("payments")
          .select("id, status, amount_mnt, course_id, courses!inner(slug, title_mn, title_en)")
          .eq("id", paymentId)
          .maybeSingle()
      : { data: null };

  const state = payment ? paymentState(payment.status) : "pending";
  const course = payment?.courses;

  const copy = {
    paid: { title: t.learn.checkout.paidTitle, body: t.learn.checkout.paidBody, Icon: CheckCircle2 },
    pending: {
      title: t.learn.checkout.pendingTitle,
      body: t.learn.checkout.pendingBody,
      Icon: Clock,
    },
    failed: {
      title: t.learn.checkout.failedTitle,
      body: t.learn.checkout.failedBody,
      Icon: XCircle,
    },
  }[state];

  const tone =
    state === "paid" ? "text-ok" : state === "pending" ? "text-warn" : "text-bad";

  return (
    <div className="shell max-w-lg py-20">
      <div className="panel-raised space-y-4 p-8 text-center">
        <copy.Icon className={`mx-auto size-10 ${tone}`} />
        <h1 className="font-display text-2xl font-medium">{copy.title}</h1>
        <p className="text-sm text-ink-2">{copy.body}</p>

        {payment ? (
          <p className="font-display text-xl font-medium tabular">
            {formatMoney(payment.amount_mnt, locale)}
          </p>
        ) : null}

        {isMockMode() ? (
          <p className="rounded-md border border-warn/30 bg-warn-soft px-3 py-2 text-xs text-warn">
            {t.learn.checkout.mockNotice}
          </p>
        ) : null}

        <div className="flex justify-center gap-3 pt-2">
          {state === "paid" && course ? (
            <Link
              href={coursePlayerPath(locale, course.slug)}
              className={buttonClass("primary", "md")}
            >
              {t.learn.course.continue}
            </Link>
          ) : (
            <Link href={learnPath(locale)} className={buttonClass("secondary", "md")}>
              {t.learn.dashboard.title}
            </Link>
          )}
        </div>
      </div>

      {/* A pending payment is waiting on a callback from another machine, so
          the page has to ask again rather than wait to be told. */}
      {state === "pending" && payment ? <PaymentPoller /> : null}
    </div>
  );
}
