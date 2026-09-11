"use client";

import { useState, useTransition } from "react";
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
 */
export function DeleteButton({
  onDelete,
  labels,
  redirectTo,
}: {
  onDelete: () => Promise<ActionResult>;
  labels: { delete: string; confirm: string; cancel: string };
  redirectTo?: string;
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
        className={buttonClass("ghost", "sm", "text-bad hover:bg-bad-soft")}
      >
        <Trash2 className="size-4" />
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
        className={buttonClass("danger", "sm")}
      >
        {pending ? <Loader2 className="size-3.5 animate-spin" /> : null}
        {labels.confirm}
      </button>
      <button type="button" onClick={() => setArmed(false)} className={buttonClass("ghost", "sm")}>
        {labels.cancel}
      </button>
      {error ? <span className="text-xs text-bad">{error}</span> : null}
    </span>
  );
}
