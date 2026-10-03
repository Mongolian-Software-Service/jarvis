import type { Metadata } from "next";
import { getIntl } from "@/lib/locale";
import { listChat } from "@/lib/queries/learn";
import { getViewer } from "@/lib/queries/viewer";
import { ChatRoom } from "@/components/ask/chat-room";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getIntl();
  return { title: t.ask.title, robots: { index: false } };
}

/**
 * «Мэдэхгүй зүйлээ асуу» — the room.
 *
 * The page is exactly one screen tall and the conversation scrolls inside it,
 * so the composer is always where the thumb is. The height is the viewport
 * less the top bar (3.5rem), and on a phone less `main`'s `pb-24` as well,
 * which is the room the fixed tab bar sits in (§3).
 *
 * Beside the room on a laptop: three lines on asking well. A 78rem chat would
 * be lines too long to read; the aside is what earns the rest of the width.
 */
export default async function AskPage() {
  const { t } = await getIntl();
  const [messages, viewer] = await Promise.all([listChat(), getViewer()]);
  const copy = t.ask;

  return (
    <div className="shell grid h-[calc(100dvh-9.5rem)] grid-rows-[auto_minmax(0,1fr)] gap-4 py-4 sm:py-6 lg:h-[calc(100dvh-3.5rem)] lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-x-8">
      <header className="lg:col-span-2">
        <h1 className="font-display text-[24px] leading-[1.1] sm:text-[28px]">{copy.title}</h1>
        <p className="text-ink-3 mt-1.5 text-[14px]">{copy.deck}</p>
      </header>

      <ChatRoom initial={messages} canModerate={viewer?.role === "admin"} t={t} />

      <aside className="hidden lg:block">
        <div className="panel-raised p-5">
          <p className="font-display text-[16px]">{copy.tips.title}</p>
          <ol className="mt-4 space-y-3.5">
            {[copy.tips.one, copy.tips.two, copy.tips.three].map((tip, index) => (
              <li key={tip} className="flex gap-3">
                <span className="bg-panel-2 text-ink-3 tabular mt-0.5 grid size-6 shrink-0 place-items-center rounded-full text-[12px]">
                  {index + 1}
                </span>
                <span className="text-ink-2 text-[13px] leading-[1.65]">{tip}</span>
              </li>
            ))}
          </ol>
        </div>
      </aside>
    </div>
  );
}
