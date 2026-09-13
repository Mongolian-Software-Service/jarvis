import { formatDuration, groupDigits, percent, type Locale, type Strings } from "@jarvis/core";

/** Four numbers about this student, and the helper that draws one. */
export function HelloStats({
  courseCount,
  lessons,
  minutes,
  completed,
  locale,
  t,
}: {
  courseCount: number;
  lessons: number;
  minutes: number;
  completed: number;
  locale: Locale;
  t: Strings;
}) {
  return (
      <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Stat label={t.guide.stats.courses} value={groupDigits(courseCount)} />
        <Stat label={t.guide.stats.lessons} value={groupDigits(lessons)} />
        <Stat label={t.guide.stats.hours} value={formatDuration(minutes, locale)} />
        <Stat
          label={t.guide.stats.progress}
          value={`${percent(completed, lessons)}%`}
          tone={completed > 0 ? "ok" : "muted"}
        />
      </section>
  );
}

/** One number, said plainly. Four of them make the row. */
function Stat({
  label,
  value,
  tone = "ink",
}: {
  label: string;
  value: string;
  tone?: "ink" | "ok" | "muted";
}) {
  return (
    <div className="panel p-4 sm:p-5">
      <p className="kicker">{label}</p>
      <p
        className="font-display tabular mt-1.5 text-[22px] leading-none sm:text-[26px]"
        style={{
          color: tone === "ok" ? "var(--ok)" : tone === "muted" ? "var(--ink-3)" : undefined,
        }}
      >
        {value}
      </p>
    </div>
  );
}
