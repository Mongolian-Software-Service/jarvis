"use client";

import { useActionState, useCallback, useState } from "react";
import { ArrowUpRight, Loader2, Pencil, Trash2 } from "lucide-react";
import { fmt, formatDate, topicTint, type Locale, type Strings } from "@jarvis/core";
import { removeProject } from "@/lib/actions/projects";
import type { ActionResult } from "@/lib/actions/guard";
import type { StudentProject } from "@/lib/queries/learn";
import { buttonClass } from "@/components/ui/button";
import { ProjectForm } from "./project-form";

/**
 * One saved project, as a card: the link, what they called it, and the two
 * things a student does to it later — point it somewhere new, or take it down.
 *
 * It was a full-width row, which on a laptop put the name at one edge of the
 * screen and «Засах» 1,300 pixels away at the other, with nothing between them
 * (§3, "a page spends the width it is given"). A card keeps the name, the
 * words and the buttons inside one glance, and two of them fill the row.
 *
 * The tile is the label's first letter on a tint hashed from the host, so a
 * shelf of projects is told apart at a glance instead of being five identical
 * globes. `topicTint` is the catalogue's own hash, so the palette is the one
 * the topic chips already use.
 *
 * The title's anchor is stretched over the card (`.card-link`), and the two
 * buttons sit above it, so the whole card opens the site except where a button
 * is. It opens in a new tab with `noopener noreferrer`: it is the student's own
 * site, and this page is where they will want to come back to.
 *
 * Editing turns the card into the form and widens it across both columns — a
 * form squeezed into half a row is three fields nobody can read.
 */
export function ProjectItem({
  project,
  locale,
  t,
}: {
  project: StudentProject;
  locale: Locale;
  t: Strings;
}) {
  const copy = t.learn.projects;
  const [editing, setEditing] = useState(false);
  const close = useCallback(() => setEditing(false), []);
  const [removed, remove, removing] = useActionState<ActionResult | null, FormData>(
    removeProject,
    null,
  );

  if (editing) {
    return (
      <div className="panel-raised p-4 sm:col-span-2 sm:p-5">
        <ProjectForm
          t={t}
          initial={{
            id: project.id,
            url: project.url,
            title: project.title,
            description: project.description,
          }}
          onDone={close}
        />
      </div>
    );
  }

  const tint = topicTint(project.host);
  const initial = Array.from(project.label)[0]?.toUpperCase() ?? "";

  return (
    <article className="panel hover:border-line-strong relative flex flex-col p-4 transition-colors">
      {/* `flex-1` here and not `mt-auto` on the footer: the footer's dates then
          line up along a row of cards whose descriptions differ in length,
          and the gap above it cannot collapse to nothing. */}
      <div className="flex-1">
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="font-display grid size-10 shrink-0 place-items-center rounded-lg text-[17px]"
            style={{ background: `var(--tint-${tint})`, color: `var(--tint-${tint}-ink)` }}
          >
            {initial}
          </span>

          <div className="min-w-0 flex-1">
            <h3 className="text-[15px] leading-snug">
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={fmt(copy.open, { host: project.host })}
                className="card-link hover:text-accent flex min-w-0 items-center gap-1 transition-colors"
              >
                <span className="truncate">{project.label}</span>
                <ArrowUpRight className="text-ink-3 size-3.5 shrink-0" aria-hidden="true" />
              </a>
            </h3>
            <p className="text-ink-3 mt-0.5 truncate text-[12.5px]">{project.host}</p>
          </div>
        </div>

        {project.description ? (
          <p className="text-ink-2 mt-3 line-clamp-3 text-[13px] leading-relaxed break-words">
            {project.description}
          </p>
        ) : null}

        {removed && !removed.ok ? (
          <p className="text-bad mt-2 text-[12px]">{removed.error}</p>
        ) : null}
      </div>

      <div className="border-line mt-4 flex items-center justify-between gap-2 border-t pt-3">
        <p className="text-ink-3 truncate text-[12px]">
          {fmt(copy.added, { date: formatDate(project.updatedAt, locale) })}
        </p>

        {/* Above the stretched link, or neither button could be pressed. */}
        <div className="relative z-10 flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className={buttonClass("ghost", "sm")}
          >
            <Pencil className="size-3" aria-hidden="true" />
            {copy.edit}
          </button>
          <form action={remove}>
            <input type="hidden" name="id" value={project.id} />
            <button
              type="submit"
              disabled={removing}
              aria-label={copy.remove}
              title={copy.remove}
              className={buttonClass("ghost", "sm", "hover:text-bad w-7 px-0")}
            >
              {removing ? (
                <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
              ) : (
                <Trash2 className="size-3.5" aria-hidden="true" />
              )}
            </button>
          </form>
        </div>
      </div>
    </article>
  );
}
