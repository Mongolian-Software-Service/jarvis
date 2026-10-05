import { Mic, MonitorUp, PhoneOff, Video } from "lucide-react";
import type { Strings } from "@jarvis/core";
import { Bar, Frame } from "./chrome";

/**
 * A call with an engineer, over the student's own project.
 *
 * The screen being shared is the student's site — the same bars the website
 * sketch is drawn from — because the promise is help with *their* build, not
 * a lecture. Meet's own logo is not drawn: it is Google's mark, and the one
 * place this codebase prints a brand's colours as literals is the sign-in
 * button (§6.6). The name in the title bar is enough.
 */
export function MeetVisual({ t }: { t: Strings }) {
  const demo = t.marketing.tracks.demo;

  return (
    <Frame>
      <div className="border-line flex items-center gap-2 border-b px-3 py-2">
        <Video className="text-accent size-3.5 shrink-0" aria-hidden="true" />
        <span className="text-ink-2 flex-1 truncate text-[12px]">Google Meet</span>
        <span className="tabular text-ink-3 shrink-0 font-mono text-[10px]">19:30</span>
      </div>

      <div className="p-3">
        {/* The shared screen: the student's page, mid-fix. */}
        <div className="border-line bg-panel-2 relative rounded-md border p-3">
          <div className="space-y-2">
            <Bar className="bg-ink-3/45 h-2 w-2/3" />
            <Bar className="bg-ink-3/25 h-2 w-1/3" />
          </div>
          <div className="mt-3 space-y-1.5">
            <div className="border-line bg-panel h-5 rounded border" />
            <div className="border-accent/60 bg-panel h-5 rounded border" />
          </div>
          <p className="border-line bg-panel text-ink-2 mt-3 inline-flex rounded-full border px-2 py-0.5 text-[11px]">
            {demo.meetNote}
          </p>
        </div>

        <div className="mt-2 grid grid-cols-2 gap-2">
          {[demo.meetEngineer, demo.meetYou].map((name, index) => (
            <div
              key={name}
              className="border-line bg-panel-2 flex items-center gap-2 rounded-md border px-2.5 py-2"
            >
              <span
                aria-hidden="true"
                className={
                  index === 0
                    ? "bg-accent-soft text-accent grid size-5 shrink-0 place-items-center rounded-full text-[10px]"
                    : "bg-panel-3 text-ink-2 grid size-5 shrink-0 place-items-center rounded-full text-[10px]"
                }
              >
                {name.slice(0, 1)}
              </span>
              <span className="text-ink-2 truncate text-[12px]">{name}</span>
            </div>
          ))}
        </div>

        <div className="mt-3 flex justify-center gap-2" aria-hidden="true">
          {[Mic, Video, MonitorUp].map((Icon, index) => (
            <span
              key={index}
              className="border-line bg-panel-2 text-ink-2 grid size-7 place-items-center rounded-full border"
            >
              <Icon className="size-3.5" />
            </span>
          ))}
          <span className="bg-bad-soft text-bad grid size-7 place-items-center rounded-full">
            <PhoneOff className="size-3.5" />
          </span>
        </div>
      </div>
    </Frame>
  );
}
