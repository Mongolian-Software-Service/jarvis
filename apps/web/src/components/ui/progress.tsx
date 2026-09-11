import { cn } from "@/lib/cn";

/**
 * A progress bar that says what it means.
 *
 * `role="progressbar"` with the three aria values, because the number beside it
 * is often the only thing telling somebody how much of a course is left, and a
 * bare div tells a screen reader nothing at all.
 */
export function Progress({
  value,
  label,
  className,
  tone = "accent",
}: {
  value: number;
  label?: string;
  className?: string;
  tone?: "accent" | "ok";
}) {
  const clamped = Math.min(100, Math.max(0, Math.round(value)));
  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={cn("h-1.5 w-full overflow-hidden rounded-sm bg-panel-3", className)}
    >
      <div
        className={cn(
          "h-full rounded-sm transition-[width] duration-500",
          tone === "ok" ? "bg-ok" : "bg-accent",
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
