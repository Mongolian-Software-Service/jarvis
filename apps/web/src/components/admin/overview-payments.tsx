import { formatMoney, paymentLabel, type Locale, type Strings } from "@jarvis/core";
import type { AdminOverview } from "@/lib/queries/admin";
import { Panel, StackedBar } from "./charts";

/**
 * The dashboard's «Төлбөр» panel: every invoice by status, then the latest few.
 *
 * Its own file so the dashboard page stays the arrangement of panels rather
 * than the drawing of each (§3.1). Nothing here reads data.
 */

/** A status keeps the same colour here and in the payments list. */
const STATUS_COLOR: Record<string, string> = {
  paid: "var(--ok)",
  pending: "var(--warn)",
  failed: "var(--bad)",
  expired: "var(--ink-3)",
};

export function OverviewPayments({
  statuses,
  payments,
  locale,
  t,
}: {
  statuses: AdminOverview["statuses"];
  payments: AdminOverview["recentPayments"];
  locale: Locale;
  t: Strings;
}) {
  return (
    <Panel title={t.admin.payments.title}>
      <StackedBar
        segments={statuses.map((row) => ({
          id: row.status,
          label: paymentLabel(row.status, locale),
          value: row.count,
          color: STATUS_COLOR[row.status] ?? "var(--viz-1)",
        }))}
        empty={t.admin.payments.empty}
      />

      <ul className="mt-5 space-y-2.5">
        {payments.map((payment) => (
          <li key={payment.id} className="flex items-center justify-between gap-3 text-sm">
            <span className="text-ink-2 min-w-0 flex-1 truncate">
              {payment.student ?? "—"}
              <span className="text-ink-3"> · {payment.course ?? "—"}</span>
            </span>
            <span className="tabular shrink-0">{formatMoney(payment.amount, locale)}</span>
            <span
              className="shrink-0 text-xs"
              style={{ color: STATUS_COLOR[payment.status] ?? "var(--ink-3)" }}
            >
              {paymentLabel(payment.status, locale)}
            </span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
