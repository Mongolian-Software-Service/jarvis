import { Lock } from "lucide-react";
import type { Locale, Strings } from "@jarvis/core";
import { BundleButton } from "@/components/course/bundle-button";

/** Widths of the ghost room's lines — uneven, the way a conversation is. */
const GHOST = [
  ["34%", "62%"],
  ["22%", "41%"],
  ["28%", "74%"],
  ["18%", "36%"],
  ["30%", "55%"],
] as const;

/**
 * The room, closed — what somebody who has not paid sees in its place.
 *
 * Same box, same height as the open room, so the page does not change shape
 * on the day they pay. Behind the notice is the room's outline with nothing in
 * it: enough to say "people talk here", and not one word of what they said —
 * the policy keeps the messages from this reader anyway (20261004000100), so
 * there is nothing real to blur.
 *
 * The way in is the bundle's own button, the one checkout there is (§1).
 */
export function ChatLocked({ locale, t }: { locale: Locale; t: Strings }) {
  const copy = t.ask.locked;

  return (
    <section aria-label={t.ask.title} className="panel relative min-h-0 overflow-hidden">
      <ol aria-hidden="true" className="space-y-5 px-5 py-6 opacity-50">
        {GHOST.map(([name, line], index) => (
          <li key={index} className="flex items-start gap-3">
            <span className="bg-panel-3 size-8 shrink-0 rounded-full" />
            <span className="flex-1 space-y-2 pt-1">
              <span className="bg-panel-3 block h-2.5 rounded-full" style={{ width: name }} />
              <span className="bg-panel-2 block h-2.5 rounded-full" style={{ width: line }} />
            </span>
          </li>
        ))}
      </ol>

      <div
        className="absolute inset-0 grid place-items-center overflow-y-auto p-5"
        style={{
          background:
            "linear-gradient(180deg, color-mix(in srgb, var(--panel) 55%, transparent), var(--panel) 55%)",
        }}
      >
        <div className="flex max-w-[30rem] flex-col items-center text-center">
          <span className="border-line bg-panel-2 text-ink-2 grid size-12 place-items-center rounded-full border">
            <Lock className="size-5" aria-hidden="true" />
          </span>
          <h2 className="font-display mt-5 text-[20px] leading-[1.2] sm:text-[22px]">
            {copy.title}
          </h2>
          <p className="text-ink-2 mt-3 text-[14.5px] leading-[1.7]">{copy.body}</p>
          <div className="mt-6">
            <BundleButton
              locale={locale}
              owned={false}
              signedIn
              labels={{
                buy: t.learn.bundle.buy,
                buying: t.learn.bundle.buying,
                owned: t.learn.bundle.owned,
                signIn: t.learn.bundle.signIn,
                error: t.states.error,
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
