import { ArrowUpRight } from "lucide-react";
import { formatAgo, type Locale, type Strings } from "@jarvis/core";
import type { ShowcaseProject } from "@/lib/queries/learn";
import { StudentAvatar } from "@/components/ui/student-avatar";
import { Badge } from "@/components/ui/badge";

/**
 * One project in the feed: who made it and when, what it is called, where it
 * lives, and what they said about it.
 *
 * The whole card is one tab stop (§4.4): the title's anchor is stretched over
 * it with `.card-link`, so the focus ring lands on the name of the thing
 * rather than on a picture of a person. It opens in a new tab with
 * `noopener noreferrer nofollow ugc` — a student's address, a stranger's site,
 * and nothing this page should vouch for to a search engine.
 *
 * Everything a student typed is rendered as text and nothing else. The
 * description keeps its line breaks (`whitespace-pre-line`) because a list of
 * "what I used" is how people write one, and loses nothing else.
 */
export function ShowcaseCard({
  project,
  locale,
  t,
}: {
  project: ShowcaseProject;
  locale: Locale;
  t: Strings;
}) {
  const copy = t.guide.showcase;
  const named = project.label !== project.displayUrl;

  return (
    <article className="panel hover:border-line-strong relative p-4 transition-colors sm:p-5">
      <header className="flex items-center gap-3">
        <StudentAvatar id={project.id} />
        <div className="min-w-0 flex-1">
          <p className="flex min-w-0 items-center gap-2 text-[14px] font-medium">
            <span className="truncate">{project.author ?? copy.anonymous}</span>
            {project.isMine ? <Badge tone="accent">{copy.mine}</Badge> : null}
          </p>
          {project.createdAt ? (
            <p className="text-ink-3 mt-0.5 truncate text-[12.5px]">
              {formatAgo(project.createdAt, locale)}
            </p>
          ) : null}
        </div>
      </header>

      {/* Indented to the name's column from `sm` up, so the eye runs down one
          edge; on a phone the 52px would come out of a 280px line. */}
      <div className="mt-4 sm:pl-[3.25rem]">
        <h3 className="font-display text-[17px] leading-[1.3] break-words">
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer nofollow ugc"
            className="card-link hover:text-accent transition-colors"
          >
            {project.label}
          </a>
        </h3>

        {named ? (
          <p className="text-accent mt-1 flex min-w-0 items-center gap-1 text-[13px]">
            <span className="truncate">{project.displayUrl}</span>
            <ArrowUpRight className="size-3.5 shrink-0" aria-hidden="true" />
          </p>
        ) : null}

        {project.description ? (
          <p className="text-ink-2 measure mt-3 text-[14px] leading-[1.7] break-words whitespace-pre-line">
            {project.description}
          </p>
        ) : null}
      </div>
    </article>
  );
}
