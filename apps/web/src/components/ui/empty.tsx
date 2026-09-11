import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** The state a list is in more often than anyone plans for. */
export function Empty({
  title,
  body,
  action,
  className,
}: {
  title: string;
  body?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "panel flex flex-col items-center gap-3 px-6 py-14 text-center",
        "border-dashed",
        className,
      )}
    >
      <p className="font-display text-[15px] font-semibold text-ink">{title}</p>
      {body ? <p className="text-[13px] text-ink-3 max-w-sm">{body}</p> : null}
      {action}
    </div>
  );
}
