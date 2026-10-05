import type { Metadata } from "next";
import Link from "next/link";
import {
  VISITOR_ANALYTICS_URL,
  adminPath,
  formatAgo,
  formatMoney,
  groupDigits,
  paymentLabel,
} from "@jarvis/core";
import { getIntl } from "@/lib/locale";
import { getAdminOverview } from "@/lib/queries/admin";
import { BarList, DailyColumns, Panel, StackedBar, StatTile } from "@/components/admin/charts";

export const metadata: Metadata = { robots: { index: false } };

/** A status keeps the same colour here and in the payments list. */
const STATUS_COLOR: Record<string, string> = {
  paid: "var(--ok)",
  pending: "var(--warn)",
  failed: "var(--bad)",
  expired: "var(--ink-3)",
};

export default async function AdminDashboard() {
  const { locale, t } = await getIntl();
  const data = await getAdminOverview();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="font-display text-[26px]">{t.admin.overview.title}</h1>
        {/* Visitors are counted by Vercel Web Analytics; the number lives there. */}
        <a
          href={VISITOR_ANALYTICS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent text-[13px] hover:underline"
        >
          {t.admin.overview.visitors} ↗
        </a>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label={t.admin.overview.students} value={groupDigits(data.students)} />
        <StatTile
          label={t.admin.overview.courses}
          value={groupDigits(data.courses)}
          note={`${data.published} ${t.admin.courses.published.toLowerCase()} · ${data.drafts} ${t.admin.courses.draft.toLowerCase()}`}
        />
        <StatTile
          label={t.admin.overview.enrollments}
          value={groupDigits(data.enrollments)}
          tone="accent"
        />
        <StatTile
          label={t.admin.overview.revenue}
          value={formatMoney(data.revenueMnt, locale)}
          tone="ok"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title={`${t.admin.overview.enrollments} · ${t.admin.overview.last30}`}>
          <DailyColumns
            data={data.daily}
            label={t.admin.overview.enrollments}
            empty={t.admin.overview.noData}
          />
        </Panel>

        <Panel
          title={t.admin.overview.topCourses}
          action={
            <Link
              href={adminPath(locale, "/courses")}
              className="text-xs text-accent hover:text-accent-hover"
            >
              {t.actions.seeAll}
            </Link>
          }
        >
          <BarList
            rows={data.topCourses.map((row) => ({
              id: row.id,
              label: row.title,
              value: row.count,
            }))}
            empty={t.admin.overview.noData}
          />
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title={t.admin.payments.title}>
          <StackedBar
            segments={data.statuses.map((row) => ({
              id: row.status,
              label: paymentLabel(row.status, locale),
              value: row.count,
              color: STATUS_COLOR[row.status] ?? "var(--viz-1)",
            }))}
            empty={t.admin.payments.empty}
          />

          <ul className="mt-5 space-y-2.5">
            {data.recentPayments.map((payment) => (
              <li key={payment.id} className="flex items-center justify-between gap-3 text-sm">
                <span className="min-w-0 flex-1 truncate text-ink-2">
                  {payment.student ?? "—"}
                  <span className="text-ink-3"> · {payment.course ?? "—"}</span>
                </span>
                <span className="shrink-0 tabular">{formatMoney(payment.amount, locale)}</span>
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

        <Panel
          title={t.admin.overview.recentSignups}
          action={
            <Link
              href={adminPath(locale, "/students")}
              className="text-xs text-accent hover:text-accent-hover"
            >
              {t.actions.seeAll}
            </Link>
          }
        >
          {data.recentStudents.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink-3">{t.admin.overview.noData}</p>
          ) : (
            <ul className="space-y-3">
              {data.recentStudents.map((student) => (
                <li key={student.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="min-w-0">
                    <span className="block truncate">{student.name ?? student.email ?? "—"}</span>
                    <span className="block truncate text-xs text-ink-3">{student.email}</span>
                  </span>
                  <span className="shrink-0 text-xs text-ink-3">
                    {formatAgo(student.joined, locale)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
