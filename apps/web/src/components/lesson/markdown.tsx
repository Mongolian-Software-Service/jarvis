import type { ReactNode } from "react";
import Link from "next/link";
import { parseMarkdown, type MdBlock, type MdInline } from "@jarvis/core";
import { cn } from "@/lib/cn";
import { CodeBlock } from "./code-block";
import { Diagram } from "./diagram";

/**
 * A lesson body, rendered from the shared parser's blocks.
 *
 * Deliberately not `dangerouslySetInnerHTML`. The parser hands back a small
 * typed tree, every node of which is rendered by a case below — so a body can
 * contain no markup this file does not already know how to draw. A lesson is
 * content our own editor wrote; that is still not a reason to hand it to the
 * browser as HTML.
 */
export function Markdown({
  source,
  copyLabels,
  className,
  lang,
}: {
  source: string;
  copyLabels: { copy: string; copied: string };
  className?: string;
  /** `lang="mn"` when Mongolian is shown inside the English edition. */
  lang?: string;
}) {
  const blocks = parseMarkdown(source);

  return (
    <div lang={lang} className={cn("space-y-5", className)}>
      {blocks.map((block, index) => (
        <Block key={index} block={block} copyLabels={copyLabels} />
      ))}
    </div>
  );
}

function Block({
  block,
  copyLabels,
}: {
  block: MdBlock;
  copyLabels: { copy: string; copied: string };
}): ReactNode {
  switch (block.type) {
    case "heading": {
      const content = <Inline parts={block.content} />;
      if (block.level === 1) {
        return <h2 className="font-display mt-8 text-2xl font-medium">{content}</h2>;
      }
      if (block.level === 2) {
        return <h3 className="font-display mt-8 text-xl font-medium">{content}</h3>;
      }
      return <h4 className="font-display mt-6 text-base font-medium">{content}</h4>;
    }

    case "diagram":
      return <Diagram steps={block.steps} />;

    case "paragraph":
      return (
        <p className="text-[15px] leading-[1.75] text-ink-2">
          <Inline parts={block.content} />
        </p>
      );

    case "list": {
      const items = block.items.map((item, index) => (
        <li key={index} className="pl-1.5 text-[15px] leading-[1.75] text-ink-2">
          <Inline parts={item} />
        </li>
      ));
      return block.ordered ? (
        <ol className="ml-5 list-decimal space-y-2 marker:text-ink-3">{items}</ol>
      ) : (
        <ul className="ml-5 list-disc space-y-2 marker:text-ink-3">{items}</ul>
      );
    }

    case "code":
      return <CodeBlock code={block.code} language={block.language} copyLabels={copyLabels} />;

    case "quote":
      return (
        <blockquote className="border-l-2 border-accent bg-accent-soft/40 py-3 pl-4 text-[15px] leading-relaxed text-ink-2">
          <Inline parts={block.content} />
        </blockquote>
      );

    case "rule":
      return <hr className="border-line" />;
  }
}

function Inline({ parts }: { parts: MdInline[] }): ReactNode {
  return (
    <>
      {parts.map((part, index) => {
        switch (part.type) {
          case "strong":
            return (
              <strong key={index} className="font-semibold text-ink">
                {part.value}
              </strong>
            );
          case "em":
            return (
              <em key={index} className="italic">
                {part.value}
              </em>
            );
          case "code":
            return (
              <code
                key={index}
                className="rounded-[4px] bg-panel-2 px-1.5 py-0.5 font-mono text-[0.875em] text-ink"
              >
                {part.value}
              </code>
            );
          case "link": {
            const external = /^https?:/i.test(part.href);
            return external ? (
              <a
                key={index}
                href={part.href}
                target="_blank"
                rel="noreferrer noopener"
                className="text-accent underline underline-offset-2 hover:text-accent-hover"
              >
                {part.value}
              </a>
            ) : (
              <Link
                key={index}
                href={part.href}
                className="text-accent underline underline-offset-2 hover:text-accent-hover"
              >
                {part.value}
              </Link>
            );
          }
          default:
            return <span key={index}>{part.value}</span>;
        }
      })}
    </>
  );
}
