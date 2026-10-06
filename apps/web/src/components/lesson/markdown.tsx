import type { ReactNode } from "react";
import Link from "next/link";
import { TriangleAlert } from "lucide-react";
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
        <p className="text-ink-2 text-[15px] leading-[1.75]">
          <Inline parts={block.content} />
        </p>
      );

    case "list": {
      const items = block.items.map((item, index) => (
        <li key={index} className="text-ink-2 pl-1.5 text-[15px] leading-[1.75]">
          <Inline parts={item} />
        </li>
      ));
      return block.ordered ? (
        <ol className="marker:text-ink-3 ml-5 list-decimal space-y-2">{items}</ol>
      ) : (
        <ul className="marker:text-ink-3 ml-5 list-disc space-y-2">{items}</ul>
      );
    }

    case "code":
      return <CodeBlock code={block.code} language={block.language} copyLabels={copyLabels} />;

    case "quote":
      return (
        <blockquote className="border-accent bg-accent-soft/40 text-ink-2 border-l-2 py-3 pl-4 text-[15px] leading-relaxed">
          <Inline parts={block.content} />
        </blockquote>
      );

    // Amber, not the accent: purple already marks every prompt on the page, and
    // the warning has to be the one block that looks like nothing else.
    case "notice":
      return (
        <div
          role="note"
          className="border-warn/40 bg-warn-soft text-ink flex gap-3 rounded-xl border px-4 py-3.5 text-[15px] leading-[1.75]"
        >
          <TriangleAlert aria-hidden className="text-warn mt-1 size-[18px] shrink-0" />
          <p>
            <Inline parts={block.content} />
          </p>
        </div>
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
              <strong key={index} className="text-ink font-semibold">
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
                className="bg-panel-2 text-ink rounded-[4px] px-1.5 py-0.5 font-mono text-[0.875em]"
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
                className="text-accent hover:text-accent-hover underline underline-offset-2"
              >
                {part.value}
              </a>
            ) : (
              <Link
                key={index}
                href={part.href}
                className="text-accent hover:text-accent-hover underline underline-offset-2"
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
