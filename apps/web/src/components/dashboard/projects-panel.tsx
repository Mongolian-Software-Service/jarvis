import { fmt, PROJECT_LIMIT, type Locale, type Strings } from "@jarvis/core";
import type { StudentProject } from "@/lib/queries/learn";
import { ProjectForm } from "./project-form";
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
 * `PROJECT_LIMIT` of them, newest first. At the limit the add form gives way to
 * a line saying so — the database would refuse the eleventh anyway, and a form
 * that can only fail is worse than no form.
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
  const full = projects.length >= PROJECT_LIMIT;

  return (
    <section id="projects" className="scroll-mt-20">
      <div className="mb-4">
        <h2 className="font-display text-[20px]">{copy.title}</h2>
        <p className="text-ink-3 measure mt-1 text-[13px]">{copy.deck}</p>
      </div>

      <div className="panel divide-line divide-y overflow-hidden">
        {projects.length === 0 ? (
          <p className="text-ink-3 px-4 py-4 text-[13px]">{copy.empty}</p>
        ) : (
          projects.map((project) => (
            <ProjectItem key={project.id} project={project} locale={locale} t={t} />
          ))
        )}

        {full ? (
          <p className="text-ink-3 px-4 py-3 text-[12.5px]">
            {fmt(copy.limit, { count: PROJECT_LIMIT })}
          </p>
        ) : (
          <div className="bg-panel-2/40 px-4 py-4">
            <p className="mb-3 text-[13px] font-medium">{copy.add}</p>
            {/* Keyed by how many there are: after a save the list grows by
                one, and the form starts again clean. */}
            <ProjectForm key={projects.length} t={t} />
          </div>
        )}
      </div>
    </section>
  );
}
