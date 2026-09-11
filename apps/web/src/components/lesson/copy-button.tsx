"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/cn";

/** The one interactive part of a code block, kept as small as it can be. */
export function CopyButton({ value, labels }: { value: string; labels: { copy: string; copied: string } }) {
  const [done, setDone] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setDone(true);
      setTimeout(() => setDone(false), 1600);
    } catch {
      // A browser that refuses clipboard access (no permission, no secure
      // context) leaves the code on screen to select by hand. Nothing to say.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={cn(
        "flex items-center gap-1.5 rounded-sm px-2 py-1 text-xs",
        "text-ink-3 transition-colors hover:bg-panel-2 hover:text-ink-2",
      )}
    >
      {done ? <Check className="size-3.5 text-ok" /> : <Copy className="size-3.5" />}
      {done ? labels.copied : labels.copy}
    </button>
  );
}
