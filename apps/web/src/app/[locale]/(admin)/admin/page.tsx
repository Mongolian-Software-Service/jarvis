import type { Metadata } from "next";
import Link from "next/link";
import {
  VISITOR_ANALYTICS_URL,
  adminPath,
  formatAgo,
  formatMoney,
  groupDigits,
  type AccessKind,
} from "@jarvis/core";
import { getIntl } from "@/lib/locale";
import { getAdminOverview } from "@/lib/queries/admin";
import { BarList, DailyColumns, Donut, Panel, StatTile } from "@/components/admin/charts";
import { OverviewPayments } from "@/components/admin/overview-payments";

export const metadata: Metadata = { robots: { index: false } };

/**
 * How a student got in, one colour each. VIP and Бэлэг match their badges in
 * «Эрх олголт» (`grant-kind-badge.tsx`); a buyer is the green of money taken.
 */
const ACCESS_COLOR: Record<AccessKind, string> = {
  purchase: "var(--viz-2)",
  vip: "var(--viz-3)",
  gift: "var(--viz-1)",
  free: "var(--viz-4)",
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
          label={t.admin.overview.withAccess}
          value={groupDigits(data.withAccess)}
          tone="accent"
        />
        <StatTile
          label={t.admin.overview.revenue}
          value={formatMoney(data.revenueMnt, locale)}
          tone="ok"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Bought, VIP or Бэлэг — each student once, in one ring (20261016000100). */}
        <Panel title={t.admin.overview.accessMix}>
          <Donut
            segments={data.access.map((row) => ({
              id: row.kind,
              label: t.admin.overview.accessKinds[row.kind],
              value: row.count,
              color: ACCESS_COLOR[row.kind],
            }))}
            unit={t.admin.overview.studentsUnit}
            label={t.admin.overview.accessMix}
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

      <Panel title={`${t.admin.overview.accessDaily} · ${t.admin.overview.last30}`}>
        <DailyColumns
          data={data.daily}
          label={t.admin.overview.accessDaily}
          empty={t.admin.overview.noData}
        />
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <OverviewPayments
          statuses={data.statuses}
          payments={data.recentPayments}
          locale={locale}
          t={t}
        />

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
