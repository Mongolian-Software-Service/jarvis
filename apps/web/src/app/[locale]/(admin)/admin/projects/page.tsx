import type { Metadata } from "next";
import { ArrowUpRight, Globe } from "lucide-react";
import { fmt, formatDate, groupDigits } from "@jarvis/core";
import { getIntl } from "@/lib/locale";
import { listProjects } from "@/lib/queries/admin";
import { deleteProject } from "@/lib/actions/admin";
import { DeleteButton } from "@/components/admin/delete-button";

export const metadata: Metadata = { robots: { index: false } };

/**
 * «Төслүүд» — what students built and by whom, and the one
 * place a link that should not be in the showcase can be taken down.
 *
 * A list rather than a table: the link is the thing worth reading, and a
 * table would squeeze it into one column of four on a phone. The link opens in
 * a new tab with `noreferrer` — the address is a student's to set, and the
 * console should not hand it a referrer or a window handle.
 *
 * The host is always printed, even under a name. A row called «Миний хуудас»
 * that opens a different domain from the one a reader expects is exactly what
 * a team member should be able to see before clicking — and, now that every
 * student sees the same row, before deciding whether to remove it.
 */
export default async function AdminProjectsPage() {
  const { locale, t } = await getIntl();
  const copy = t.admin.projects;
  const projects = await listProjects();

  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <h1 className="font-display text-[26px]">{copy.title}</h1>
        <p className="text-ink-3 measure text-[13.5px]">{copy.deck}</p>
        {projects.length > 0 ? (
          <p className="text-ink-3 tabular text-[12.5px]">
            {fmt(copy.count, { count: groupDigits(projects.length) })}
          </p>
        ) : null}
      </header>

      {projects.length === 0 ? (
        <p className="panel border-line text-ink-3 border-dashed px-4 py-10 text-center text-sm">
          {copy.empty}
        </p>
      ) : (
        <ul className="panel divide-line divide-y overflow-hidden">
          {projects.map((project) => (
            <li key={project.id} className="flex items-start gap-3 px-4 py-3.5">
              <span className="bg-panel-2 text-ink-3 mt-0.5 grid size-8 shrink-0 place-items-center rounded-md">
                <Globe className="size-4" aria-hidden="true" />
              </span>

              <div className="min-w-0 flex-1">
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer nofollow ugc"
                  className="hover:text-accent flex min-w-0 items-center gap-1 text-[14px] transition-colors"
                >
                  <span className="truncate">{project.title ?? project.host}</span>
                  <ArrowUpRight className="text-ink-3 size-3.5 shrink-0" aria-hidden="true" />
                </a>
                <p className="text-ink-3 mt-0.5 truncate text-[12.5px]">{project.host}</p>
                {project.description ? (
                  <p className="text-ink-2 mt-1.5 line-clamp-2 text-[13px] break-words">
                    {project.description}
                  </p>
                ) : null}
                <p className="text-ink-2 mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[12.5px]">
                  <span>{project.student.name ?? project.student.email ?? "—"}</span>
                  <span className="text-ink-3">{formatDate(project.updatedAt, locale)}</span>
                </p>
              </div>

              {/* A bound server action: the id travels with the reference,
                  so this page can stay a server component. */}
              <div className="shrink-0">
                <DeleteButton
                  onDelete={deleteProject.bind(null, project.id)}
                  labels={{
                    delete: t.actions.delete,
                    confirm: t.actions.confirmDelete,
                    cancel: t.actions.cancel,
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
