"use client";

import { useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { buttonClass } from "@/components/ui/button";
import type { ActionResult } from "@/lib/actions/guard";

/**
 * Two-step, in place — not `window.confirm`.
 *
 * The browser dialog steals focus, cannot be styled, reads the site's domain
 * aloud to a screen reader, and on iOS can be suppressed entirely. A second
 * button that appears where the first one was is both clearer and undoable by
 * doing nothing.
 *
 * Named for its first job; the chat console asks the same two steps of a block
 * and an unblock, with their own `icon`. `tone="neutral"` is for the step that
 * takes nothing away (an unblock), which should not wear the danger colour.
 */
export function DeleteButton({
  onDelete,
  labels,
  redirectTo,
  icon = <Trash2 className="size-4" />,
  tone = "danger",
}: {
  onDelete: () => Promise<ActionResult>;
  labels: { delete: string; confirm: string; cancel: string };
  redirectTo?: string;
  icon?: ReactNode;
  tone?: "danger" | "neutral";
}) {
  const [armed, setArmed] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  if (!armed) {
    return (
      <button
        type="button"
        onClick={() => setArmed(true)}
        className={buttonClass(
          "ghost",
          "sm",
          tone === "danger" ? "text-bad hover:bg-bad-soft" : "",
        )}
      >
        {icon}
        {labels.delete}
      </button>
    );
  }

  return (
    <span className="flex items-center gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await onDelete();
            if (!result.ok) {
              setError(result.error);
              setArmed(false);
              return;
            }
            if (redirectTo) router.push(redirectTo);
            else router.refresh();
          })
        }
        className={buttonClass(tone === "danger" ? "danger" : "secondary", "sm")}
      >
        {pending ? <Loader2 className="size-3.5 animate-spin" /> : null}
        {labels.confirm}
      </button>
      <button type="button" onClick={() => setArmed(false)} className={buttonClass("ghost", "sm")}>
        {labels.cancel}
      </button>
      {error ? <span className="text-bad text-xs">{error}</span> : null}
    </span>
  );
}
