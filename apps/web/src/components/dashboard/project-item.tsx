"use client";

import { useActionState, useCallback, useState } from "react";
import { ArrowUpRight, Globe, Loader2, Trash2 } from "lucide-react";
import { fmt, formatDate, type Locale, type Strings } from "@jarvis/core";
import { removeProject } from "@/lib/actions/projects";
import type { ActionResult } from "@/lib/actions/guard";
import type { StudentProject } from "@/lib/queries/learn";
import { buttonClass } from "@/components/ui/button";
import { ProjectForm } from "./project-form";

/**
 * One saved project: the link, what they called it, and the two things a
 * student does to it later — point it somewhere new, or take it down.
 *
 * The link opens in a new tab with `noopener noreferrer`. It is the student's
 * own site, and the dashboard is where they will want to come back to.
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
      <div className="px-4 py-4">
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

  return (
    <div className="flex items-start gap-3 px-4 py-3.5">
      <span className="bg-panel-2 text-ink-3 mt-0.5 grid size-8 shrink-0 place-items-center rounded-md">
        <Globe className="size-4" aria-hidden="true" />
      </span>

      <div className="min-w-0 flex-1">
        <a
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={fmt(copy.open, { host: project.host })}
          className="hover:text-accent flex min-w-0 items-center gap-1 text-[14px] transition-colors"
        >
          <span className="truncate">{project.label}</span>
          <ArrowUpRight className="size-3.5 shrink-0" aria-hidden="true" />
        </a>
        <p className="text-ink-3 mt-0.5 truncate text-[12px]">
          {project.title ? `${project.host} · ` : ""}
          {fmt(copy.added, { date: formatDate(project.updatedAt, locale) })}
        </p>
        {project.description ? (
          <p className="text-ink-2 mt-1.5 line-clamp-2 text-[13px] break-words">
            {project.description}
          </p>
        ) : null}
        {removed && !removed.ok ? (
          <p className="text-bad mt-1.5 text-[12px]">{removed.error}</p>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className={buttonClass("ghost", "md")}
        >
          {copy.edit}
        </button>
        <form action={remove}>
          <input type="hidden" name="id" value={project.id} />
          <button
            type="submit"
            disabled={removing}
            aria-label={copy.remove}
            title={copy.remove}
            className={buttonClass("ghost", "md", "hover:text-bad w-8 px-0")}
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
  );
}
