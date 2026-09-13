import { Check, Sparkles } from "lucide-react";
import type { Strings } from "@jarvis/core";
import { Frame } from "./chrome";

export function AiVisual({ t }: { t: Strings }) {
  const demo = t.marketing.tracks.demo;

  return (
    <Frame className="p-4">
      <div className="flex items-start gap-2 rounded-md border border-line bg-panel-2 px-3 py-2">
        <Sparkles className="mt-0.5 size-3.5 shrink-0 text-accent" aria-hidden="true" />
        <p className="text-[12px] leading-relaxed text-ink-2">{demo.aiPrompt}</p>
      </div>

      <ol className="mt-3 space-y-2">
        {demo.aiSteps.map((step, index) => (
          <li key={step} className="flex items-center gap-2.5 text-[13px] text-ink-2">
            <span className="grid size-5 shrink-0 place-items-center rounded-full border border-line text-[10px] tabular text-ink-3">
              {index + 1}
            </span>
            <span className="min-w-0 flex-1 truncate">{step}</span>
            <Check className="size-3.5 shrink-0 text-ok" aria-hidden="true" />
          </li>
        ))}
      </ol>

      <p className="mt-3 border-t border-line pt-3">
        <span className="rounded-full bg-ok-soft px-2 py-0.5 text-[11px] font-medium text-ok">
          {demo.free}
        </span>
      </p>
    </Frame>
  );
}
