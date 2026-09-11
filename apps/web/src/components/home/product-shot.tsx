import { BookOpen, Check, Code2, PlayCircle } from "lucide-react";
import { highlight, type Strings, type TokenKind } from "@jarvis/core";
import { cn } from "@/lib/cn";

/**
 * The framed product shot under the hero.
 *
 * The reference puts a screenshot of its own app here. This draws the lesson
 * screen instead — same markup, same tokens, and the code inside it goes
 * through the real `highlight()` from `@jarvis/core`. So it cannot drift from
 * the product the way a screenshot does, it costs no image bytes, it is sharp
 * on every display, and it is correct in both themes without a second file.
 *
 * Entirely decorative: `aria-hidden`, nothing focusable, no link. Everything it
 * depicts is reachable through the real navigation above it.
 */

const TOKEN_CLASS: Record<TokenKind, string> = {
  plain: "",
  keyword: "text-[var(--tok-keyword)]",
  string: "text-[var(--tok-string)]",
  comment: "text-[var(--tok-comment)]",
  number: "text-[var(--tok-number)]",
  function: "text-[var(--tok-function)]",
  punct: "text-ink-3",
  tag: "text-[var(--tok-tag)]",
  attr: "text-[var(--tok-attr)]",
};

const SAMPLE = `.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}`;

export function ProductShot({ t }: { t: Strings }) {
  const lines = highlight(SAMPLE, "css");

  const rail = [
    { title: "Вэб хэрхэн ажилладаг вэ?", icon: PlayCircle, done: true },
    { title: "Эхний HTML файл", icon: BookOpen, done: true },
    { title: t.marketing.showcase.lessonTitle, icon: Code2, done: false, current: true },
    { title: "Хувийн танилцуулга хуудас", icon: Code2, done: false },
  ];

  return (
    <div aria-hidden="true" className="relative mx-auto mt-16 max-w-5xl px-5 sm:px-8">
      {/* The glow the frame sits in. Behind it, and not on it: a shadow on a
          near-black ground reads as dirt. */}
      <div
        className="pointer-events-none absolute inset-x-8 -top-6 bottom-8 blur-3xl"
        style={{
          background:
            "radial-gradient(40rem 16rem at 50% 0%, var(--accent-soft), transparent 70%)",
        }}
      />

      <div className="relative overflow-hidden rounded-xl border border-line bg-panel shadow-lift">
        {/* Window chrome */}
        <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
          <span className="size-2.5 rounded-full bg-panel-3" />
          <span className="size-2.5 rounded-full bg-panel-3" />
          <span className="size-2.5 rounded-full bg-panel-3" />
          <span className="ml-3 truncate font-mono text-[11px] text-ink-3">
            jarvis.mn/mn/learn/web-undes/flexbox
          </span>
        </div>

        <div className="grid sm:grid-cols-[13rem_1fr]">
          {/* The syllabus rail */}
          <div className="hidden border-r border-line p-3 sm:block">
            <p className="kicker mb-2.5 px-2">{t.learn.player.lessons}</p>
            <ul className="space-y-0.5">
              {rail.map((lesson) => (
                <li
                  key={lesson.title}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-2 py-1.5 text-[12px]",
                    lesson.current ? "bg-panel-2 text-ink" : "text-ink-3",
                  )}
                >
                  {lesson.done ? (
                    <Check className="size-3.5 shrink-0 text-ok" />
                  ) : (
                    <lesson.icon className="size-3.5 shrink-0" />
                  )}
                  <span className="truncate">{lesson.title}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* The lesson */}
          <div className="min-w-0 p-5 sm:p-6">
            <p className="kicker">{t.marketing.showcase.lessonKicker}</p>
            <h3 className="font-display mt-2 text-[20px] leading-tight">
              {t.marketing.showcase.lessonTitle}
            </h3>
            <p className="mt-2 max-w-md text-[13px] leading-relaxed text-ink-3">
              {t.marketing.showcase.lessonBody}
            </p>

            <div className="mt-4 overflow-hidden rounded-md border border-code-line bg-code-bg">
              <div className="border-b border-code-line px-3 py-1.5">
                <span className="font-mono text-[10px] tracking-wide text-ink-3">css</span>
              </div>
              <pre className="overflow-x-auto p-3 font-mono text-[12px] leading-relaxed">
                <code>
                  {lines.map((tokens, index) => (
                    <span key={index} className="block">
                      <span className="mr-3 inline-block w-3 text-right text-ink-3/50 select-none tabular">
                        {index + 1}
                      </span>
                      {tokens.map((token, position) => (
                        <span key={position} className={TOKEN_CLASS[token.kind]}>
                          {token.text}
                        </span>
                      ))}
                    </span>
                  ))}
                </code>
              </pre>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <span className="inline-flex h-7 items-center gap-1.5 rounded-full bg-solid px-3 text-[12px] font-medium text-solid-ink">
                <Check className="size-3.5" />
                {t.marketing.showcase.done}
              </span>
              <span className="inline-flex h-7 items-center rounded-full border border-line px-3 text-[12px] text-ink-3">
                {t.learn.player.nextLesson}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* The frame fades into the page rather than ending on a line. */}
      <div className="pointer-events-none absolute inset-x-0 -bottom-px h-24 bg-gradient-to-b from-transparent to-bg" />
    </div>
  );
}
