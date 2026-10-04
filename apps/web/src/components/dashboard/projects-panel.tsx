import { FolderOpen } from "lucide-react";
import { PROJECT_LIMIT, type Locale, type Strings } from "@jarvis/core";
import type { StudentProject } from "@/lib/queries/learn";
import { ProjectItem } from "./project-item";

/**
 * «Миний төслүүд» — where a student keeps the address of what they built.
 *
 * Every track ends in something that lives on the internet, and until now the
 * school had nowhere to put the link. It sits on the dashboard rather than in
 * settings because it is the student's work, not their account — and because
 * the dashboard is the screen they open the day they finish.
 *
 * No course to file it under (20261002000300): a student keeps up to
 * `PROJECT_LIMIT` of them, newest first, as a grid of cards. The form that adds
 * one is `ProjectAdd`, which the page puts beside this on a laptop and under it
 * on a phone — it used to sit at the foot of this list, where the fifth project
 * pushed it below the fold of the screen it exists on.
 */
export function ProjectsPanel({
  projects,
  locale,
  t,
}: {
  projects: StudentProject[];
  locale: Locale;
  t: Strings;
}) {
  const copy = t.learn.projects;

  return (
    <section id="projects" className="scroll-mt-20">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <h2 className="font-display text-[20px]">{copy.title}</h2>
          <p className="text-ink-3 measure mt-1 text-[13px]">{copy.deck}</p>
        </div>
        {/* How many of the ten — the add form disappears at the limit, and
            this is what says it is coming. */}
        <p className="text-ink-3 tabular shrink-0 text-[13px]">
          {projects.length} / {PROJECT_LIMIT}
        </p>
      </div>

      {projects.length === 0 ? (
        <div className="border-line text-ink-3 flex items-center gap-3 rounded-[var(--radius-lg)] border border-dashed px-4 py-6 text-[13px]">
          <FolderOpen className="size-5 shrink-0" aria-hidden="true" />
          <p>{copy.empty}</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {projects.map((project) => (
            <ProjectItem key={project.id} project={project} locale={locale} t={t} />
          ))}
        </div>
      )}
    </section>
  );
}
