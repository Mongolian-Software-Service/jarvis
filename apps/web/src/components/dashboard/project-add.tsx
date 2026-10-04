import { Plus } from "lucide-react";
import { fmt, PROJECT_LIMIT, type Strings } from "@jarvis/core";
import { ProjectForm } from "./project-form";

/**
 * «Төсөл нэмэх», as a card of its own.
 *
 * Split out of `ProjectsPanel` so the page can put it where it is always in
 * reach: in the column beside the projects on a laptop, sticky as the list
 * scrolls, and after them on a phone.
 *
 * At the limit the form gives way to a line saying so — the database would
 * refuse the eleventh anyway, and a form that can only fail is worse than no
 * form.
 */
export function ProjectAdd({ count, t }: { count: number; t: Strings }) {
  const copy = t.learn.projects;
  const full = count >= PROJECT_LIMIT;

  return (
    <section className="panel-raised p-4 sm:p-5">
      <h2 className="flex items-center gap-2 text-[15px] font-medium">
        <span className="bg-panel-2 text-ink-2 grid size-6 place-items-center rounded-md">
          <Plus className="size-3.5" aria-hidden="true" />
        </span>
        {copy.add}
      </h2>

      <div className="mt-4">
        {full ? (
          <p className="text-ink-3 text-[13px] leading-relaxed">
            {fmt(copy.limit, { count: PROJECT_LIMIT })}
          </p>
        ) : (
          // Keyed by how many there are: after a save the list grows by one,
          // and the form starts again clean.
          <ProjectForm key={count} t={t} />
        )}
      </div>
    </section>
  );
}
