"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import {
  formatDateTime,
  formatMoney,
  isStalePending,
  paymentLabel,
  type Locale,
  type Strings,
} from "@jarvis/core";
import { settlePayment } from "@/lib/actions/admin";
import { buttonClass } from "@/components/ui/button";
import type { AdminPayment } from "@/lib/queries/admin";

/** A status wears the same colour here as in the dashboard's stacked bar. */
const COLOR: Record<string, string> = {
  paid: "var(--ok)",
  pending: "var(--warn)",
  failed: "var(--bad)",
  expired: "var(--ink-3)",
};

export function PaymentTable({
  payments,
  locale,
  t,
}: {
  payments: AdminPayment[];
  locale: Locale;
  t: Strings;
}) {
  if (payments.length === 0) {
    return (
      <p className="panel border-dashed px-4 py-10 text-center text-sm text-ink-3">
        {t.admin.payments.empty}
      </p>
    );
  }

  return (
    <div className="panel overflow-x-auto">
      <table className="w-full min-w-3xl text-sm">
        <thead>
          <tr className="border-b border-line text-left">
            <Th>{t.admin.payments.date}</Th>
            <Th>{t.admin.payments.student}</Th>
            <Th>{t.admin.payments.course}</Th>
            <Th className="text-right">{t.admin.payments.amount}</Th>
            <Th>{t.admin.payments.status}</Th>
            <Th>{t.admin.payments.invoice}</Th>
            <Th />
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {payments.map((payment) => {
            const stale = isStalePending(payment.status, payment.created);
            return (
              <tr key={payment.id}>
                <Td className="whitespace-nowrap text-ink-3 tabular">
                  {formatDateTime(payment.created, locale)}
                </Td>
                <Td className="max-w-40 truncate">{payment.student ?? "—"}</Td>
                <Td className="max-w-48 truncate text-ink-2">{payment.course ?? "—"}</Td>
                <Td className="text-right tabular">{formatMoney(payment.amount, locale)}</Td>
                <Td>
                  <span style={{ color: COLOR[payment.status] ?? "var(--ink-3)" }}>
                    {paymentLabel(payment.status, locale)}
                  </span>
                  {stale ? (
                    <span className="block text-xs text-ink-3">{t.admin.payments.stale}</span>
                  ) : null}
                </Td>
                <Td className="max-w-32 truncate font-mono text-xs text-ink-3">
                  {payment.invoice ?? "—"}
                </Td>
                <Td>
                  {payment.status !== "paid" ? (
                    <SettleButton id={payment.id} label={t.admin.payments.settle} />
                  ) : null}
                </Td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function SettleButton({ id, label }: { id: string; label: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await settlePayment(id);
          router.refresh();
        })
      }
      className={buttonClass("secondary", "sm", "whitespace-nowrap")}
    >
      {pending ? <Loader2 className="size-3.5 animate-spin" /> : null}
      {label}
    </button>
  );
}

function Th({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <th className={`px-4 py-2.5 text-xs font-medium text-ink-3 ${className ?? ""}`}>{children}</th>;
}

function Td({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 ${className ?? ""}`}>{children}</td>;
}
