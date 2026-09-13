import type { Strings } from "@jarvis/core";
import { Bar, Frame } from "./chrome";

export function WebsiteVisual({ t }: { t: Strings }) {
  return (
    <Frame>
      <div className="flex items-center gap-2 border-b border-line px-3 py-2">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="size-2 rounded-full bg-panel-3" />
          <span className="size-2 rounded-full bg-panel-3" />
          <span className="size-2 rounded-full bg-panel-3" />
        </span>
        <span className="ml-1 flex-1 truncate rounded-full bg-panel-2 px-2.5 py-1 font-mono text-[10px] text-ink-3">
          ganbat.mn
        </span>
      </div>

      <div className="relative overflow-hidden p-4">
        {/* The same single soft source the real hero uses, one size down. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 -top-8 h-20"
          style={{
            background: "radial-gradient(16rem 5rem at 50% 100%, var(--accent-soft), transparent 70%)",
          }}
        />

        <div className="relative flex items-center gap-2">
          <span className="size-4 shrink-0 rounded bg-solid" aria-hidden="true" />
          <Bar className="h-1.5 w-8" />
          <Bar className="h-1.5 w-10" />
          <span className="ml-auto shrink-0 rounded-full bg-solid px-2 py-0.5 text-[9px] font-medium text-solid-ink">
            {t.nav.contact}
          </span>
        </div>

        <div className="relative mt-5 space-y-2">
          <Bar className="h-2.5 w-3/4 bg-ink-3/45" />
          <Bar className="h-2.5 w-1/2 bg-ink-3/25" />
        </div>

        <div className="relative mt-4 grid grid-cols-3 gap-2">
          {[0, 1, 2].map((slot) => (
            <div key={slot} className="h-12 rounded-md border border-line bg-panel-2" />
          ))}
        </div>
      </div>
    </Frame>
  );
}

/**
 * One app, both handsets.
 *
 * The two are meant to be told apart at a glance, so each carries the thing
 * that actually identifies it: the iPhone its Dynamic Island, its big corner
 * radius and the home indicator; the Samsung a centred punch-hole, squarer
 * corners and the three-button navigation many of them still run.
 *
 * Hardware cut-outs are drawn *lighter* than the screen rather than black.
 * On a real phone the island is black on a bright screen; on this near-black
 * ground black-on-black is nothing at all, so the camera glass catches a little
 * light instead — which is what a photograph of one looks like anyway.
 */
