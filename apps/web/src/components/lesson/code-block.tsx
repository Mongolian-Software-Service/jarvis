import { highlight, type TokenKind } from "@jarvis/core";
import { cn } from "@/lib/cn";
import { CopyButton } from "./copy-button";

/**
 * A code block, highlighted on the server.
 *
 * `highlight()` comes from `@jarvis/core` and returns **tokens**, not HTML — so
 * the phone can draw the same snippet with `<Text>` runs later. Here each token
 * becomes a span with one class; the colours are the `--tok-*` variables, which
 * have a second copy of the highlighter.
 *
 * No client JavaScript reaches the browser for this, except the copy button.
 */

const TOKEN_CLASS: Record<TokenKind, string> = {
  plain: "",
  keyword: "text-[var(--tok-keyword)]",
  string: "text-[var(--tok-string)]",
  comment: "text-[var(--tok-comment)] italic",
  number: "text-[var(--tok-number)]",
  function: "text-[var(--tok-function)]",
  punct: "text-ink-3",
  tag: "text-[var(--tok-tag)]",
  attr: "text-[var(--tok-attr)]",
};

export function CodeBlock({
  code,
  language,
  title,
  copyLabels,
  className,
  showLineNumbers = true,
}: {
  code: string;
  language?: string | null;
  title?: string;
  copyLabels: { copy: string; copied: string };
  className?: string;
  showLineNumbers?: boolean;
}) {
  const lines = highlight(code.replace(/\n+$/, ""), language);

  return (
    <figure
      className={cn(
        "overflow-hidden rounded-md border border-code-line bg-code-bg",
        className,
      )}
    >
      <figcaption className="flex items-center justify-between border-b border-code-line px-3 py-1.5">
        <span className="font-mono text-[11px] tracking-wide text-ink-3">
          {title ?? language ?? "code"}
        </span>
        <CopyButton value={code} labels={copyLabels} />
      </figcaption>

      {/* The block scrolls inside itself. The page never scrolls sideways —
          a 360px phone is the floor, and long lines are normal in code. */}
      <div className="overflow-x-auto">
        <pre className="min-w-full p-4 font-mono text-[13px] leading-relaxed">
          <code>
            {lines.map((tokens, index) => (
              <span key={index} className="block">
                {showLineNumbers ? (
                  <span
                    aria-hidden="true"
                    className="mr-4 inline-block w-6 text-right text-ink-3/60 select-none tabular"
                  >
                    {index + 1}
                  </span>
                ) : null}
                {tokens.length === 0 ? (
                  "\n"
                ) : (
                  tokens.map((token, position) => (
                    <span key={position} className={TOKEN_CLASS[token.kind]}>
                      {token.text}
                    </span>
                  ))
                )}
              </span>
            ))}
          </code>
        </pre>
      </div>
    </figure>
  );
}
