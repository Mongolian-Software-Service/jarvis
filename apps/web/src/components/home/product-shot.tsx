import { BookOpen, Check, MessageSquareQuote, PlayCircle, Sparkles } from "lucide-react";
import { SITE_URL, type Strings } from "@jarvis/core";
import { cn } from "@/lib/cn";

/**
 * The framed product shot under the hero.
 *
 * The reference puts a screenshot of its own app here. This draws the lesson
 * screen instead — same markup, same tokens — so it cannot drift from the
 * product the way a screenshot does, it costs no image bytes, it is sharp on
 * every display, and it needs no second file.
 *
 * It used to show a syntax-highlighted CSS rule, which was the front page
 * promising the one thing this school does not teach (§1: directing, not
 * typing). What it shows now is a prompt and the reply's checklist — the
 * actual shape of a lesson here, and the same `>` quote the bodies use.
 *
 * Entirely decorative: `aria-hidden`, nothing focusable, no link. Everything it
 * depicts is reachable through the real navigation above it.
 */
export function ProductShot({ t }: { t: Strings }) {
  const rail = [
    { title: "Код гэж юу вэ", icon: PlayCircle, done: true },
    { title: "Код хэрхэн ажилладаг вэ", icon: BookOpen, done: true },
    { title: t.marketing.showcase.lessonTitle, icon: Sparkles, done: false, current: true },
    { title: "Сервер гэж юу вэ", icon: BookOpen, done: false },
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

      <div className="border-line bg-panel shadow-lift relative overflow-hidden rounded-xl border">
        {/* Window chrome */}
        <div className="border-line flex items-center gap-2 border-b px-4 py-2.5">
          <span className="bg-panel-3 size-2.5 rounded-full" />
          <span className="bg-panel-3 size-2.5 rounded-full" />
          <span className="bg-panel-3 size-2.5 rounded-full" />
          {/*
           * Derived from `SITE_URL`, never typed out. It read `jarvis.mn` for
           * days after the rename — on the front page, in the one picture that
           * says what the product is. A brand that lives in a string literal is
           * a brand that goes stale somewhere nobody is looking.
           */}
          <span className="text-ink-3 ml-3 truncate font-mono text-[11px]">
            {SITE_URL.replace(/^https?:\/\//, "")}/mn/learn/tanilcuulga/claude-ashiglah
          </span>
        </div>

        <div className="grid sm:grid-cols-[13rem_1fr]">
          {/* The syllabus rail */}
          <div className="border-line hidden border-r p-3 sm:block">
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
                    <Check className="text-ok size-3.5 shrink-0" />
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
            <p className="text-ink-3 mt-2 max-w-md text-[13px] leading-relaxed">
              {t.marketing.showcase.lessonBody}
            </p>

            {/* The prompt, drawn the way a lesson body draws a `>` quote. */}
            <figure className="border-accent bg-panel-2 mt-4 rounded-r-md border-l-2 py-2.5 pr-3 pl-3.5">
              <figcaption className="kicker text-accent mb-1 flex items-center gap-1.5">
                <MessageSquareQuote className="size-3" />
                {t.marketing.showcase.promptLabel}
              </figcaption>
              <p className="text-ink-2 max-w-md text-[12.5px] leading-relaxed">
                {t.marketing.showcase.promptText}
              </p>
            </figure>

            {/* What came back — the part the lesson teaches you to check. */}
            <ul className="mt-3 space-y-1.5">
              {t.marketing.showcase.replySteps.map((step) => (
                <li key={step} className="text-ink-3 flex items-center gap-2 text-[12px]">
                  <Check className="text-ok size-3.5 shrink-0" />
                  <span className="truncate">{step}</span>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex items-center gap-2">
              <span className="bg-solid text-solid-ink inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-[12px] font-medium">
                <Check className="size-3.5" />
                {t.marketing.showcase.done}
              </span>
              <span className="border-line text-ink-3 inline-flex h-7 items-center rounded-full border px-3 text-[12px]">
                {t.learn.player.nextLesson}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* The frame fades into the page rather than ending on a line. */}
      <div className="to-bg pointer-events-none absolute inset-x-0 -bottom-px h-24 bg-gradient-to-b from-transparent" />
    </div>
  );
}
