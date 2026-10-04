import { Check, Sparkles } from "lucide-react";
import type { Strings } from "@jarvis/core";
import { Frame } from "./chrome";

export function AiVisual({ t }: { t: Strings }) {
  const demo = t.marketing.tracks.demo;

  return (
    <Frame className="p-4">
      <div className="border-line bg-panel-2 flex items-start gap-2 rounded-md border px-3 py-2">
        <Sparkles className="text-accent mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
        <p className="text-ink-2 text-[12px] leading-relaxed">{demo.aiPrompt}</p>
      </div>

      <ol className="mt-3 space-y-2">
        {demo.aiSteps.map((step, index) => (
          <li key={step} className="text-ink-2 flex items-center gap-2.5 text-[13px]">
            <span className="border-line tabular text-ink-3 grid size-5 shrink-0 place-items-center rounded-full border text-[10px]">
              {index + 1}
            </span>
            <span className="min-w-0 flex-1 truncate">{step}</span>
            <Check className="text-ok size-3.5 shrink-0" aria-hidden="true" />
          </li>
        ))}
      </ol>

      <p className="border-line mt-3 border-t pt-3">
        <span className="bg-ok-soft text-ok rounded-full px-2 py-0.5 text-[11px] font-medium">
          {demo.included}
        </span>
      </p>
    </Frame>
  );
}
