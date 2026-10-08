import { Ban } from "lucide-react";
import type { Strings } from "@jarvis/core";

/**
 * What a blocked reader sees where the composer was (20261008000100).
 *
 * In the composer's own place and roughly its height, so the room above does
 * not jump when it renders: the messages are still theirs to read, only the
 * box for writing is gone. Said plainly and without blame — who to ask, not
 * what they did — because the team's reason is not the page's to state.
 */
export function ChatBlocked({ t }: { t: Strings }) {
  const copy = t.ask.blocked;

  return (
    <div role="status" className="border-line border-t p-3">
      <div className="bg-panel-2 border-line flex items-start gap-3 rounded-xl border px-4 py-3">
        <Ban className="text-ink-3 mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <div className="min-w-0">
          <p className="text-ink text-[14px] font-medium">{copy.title}</p>
          <p className="text-ink-3 mt-0.5 text-[13px] leading-relaxed">{copy.body}</p>
        </div>
      </div>
    </div>
  );
}
