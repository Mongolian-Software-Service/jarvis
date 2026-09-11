"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { GripVertical, Loader2, Plus } from "lucide-react";
import { adminPath, formatDuration, kindLabel, type Locale, type Strings } from "@jarvis/core";
import { deleteLesson, deleteModule, saveModule } from "@/lib/actions/admin";
import { Input } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { buttonClass } from "@/components/ui/button";
import { DeleteButton } from "./delete-button";
import type { ActionResult } from "@/lib/actions/guard";
import type { AdminCourse } from "@/lib/queries/admin";

/**
 * The syllabus, edited in place.
 *
 * Ordering is a number in a field rather than a drag handle. Dragging is nicer
 * and is a week of work to do properly on touch; a `rank` column that anyone
 * can type into ships today and never fights a screen reader. The handle icon
 * is there to say "this has an order", not to promise it can be dragged.
 */
export function ModuleManager({
  course,
  locale,
  t,
}: {
  course: AdminCourse;
  locale: Locale;
  t: Strings;
}) {
  const [state, submit, pending] = useActionState<ActionResult | null, FormData>(saveModule, null);
  const [adding, setAdding] = useState(false);

  const labels = {
    delete: t.actions.delete,
    confirm: t.actions.confirmDelete,
    cancel: t.actions.cancel,
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-[15px] font-semibold">{t.admin.modules.title}</h2>
        <button
          type="button"
          onClick={() => setAdding((value) => !value)}
          className={buttonClass("secondary", "sm")}
        >
          <Plus className="size-4" />
          {t.admin.modules.add}
        </button>
      </div>

      {adding ? (
        <form action={submit} className="panel flex flex-wrap items-end gap-3 p-4">
          <input type="hidden" name="course_id" value={course.id} />
          <input type="hidden" name="rank" value={course.modules.length + 1} />
          <div className="min-w-48 flex-1">
            <label htmlFor="new-module" className="mb-1.5 block text-sm text-ink-2">
              {t.admin.modules.name}
            </label>
            <Input id="new-module" name="title_mn" required />
          </div>
          <Input name="title_en" placeholder="English" className="min-w-40 flex-1" />
          <button type="submit" disabled={pending} className={buttonClass("primary", "md")}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : null}
            {t.actions.save}
          </button>
        </form>
      ) : null}

      {state && !state.ok ? <p className="text-sm text-bad">{state.error}</p> : null}

      {course.modules.length === 0 ? (
        <p className="panel border-dashed px-4 py-8 text-center text-sm text-ink-3">
          {t.admin.modules.empty}
        </p>
      ) : (
        course.modules.map((section) => (
          <section key={section.id} className="panel overflow-hidden">
            <header className="flex items-center gap-3 border-b border-line px-4 py-3">
              <GripVertical className="size-4 text-ink-3" aria-hidden="true" />
              <h3 className="min-w-0 flex-1 truncate font-display text-[13px] font-semibold">
                {section.title_mn}
              </h3>
              <Link
                href={adminPath(locale, `/lessons/new?module=${section.id}`)}
                className={buttonClass("ghost", "sm")}
              >
                <Plus className="size-4" />
                {t.admin.lessons.add}
              </Link>
              <DeleteButton onDelete={() => deleteModule(section.id)} labels={labels} />
            </header>

            {section.lessons.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-ink-3">{t.admin.lessons.empty}</p>
            ) : (
              <ul className="divide-y divide-line">
                {section.lessons.map((lesson) => (
                  <li key={lesson.id} className="flex items-center gap-3 px-4 py-2.5">
                    <span className="w-6 text-xs text-ink-3 tabular">{lesson.rank}</span>
                    <Link
                      href={adminPath(locale, `/lessons/${lesson.id}`)}
                      className="min-w-0 flex-1 truncate text-sm hover:text-accent"
                    >
                      {lesson.title_mn}
                    </Link>
                    <span className="hidden shrink-0 text-xs text-ink-3 sm:inline">
                      {kindLabel(lesson.kind, locale)} ·{" "}
                      {formatDuration(lesson.duration_minutes, locale)}
                    </span>
                    {lesson.is_preview ? <Badge tone="ok">{t.admin.lessons.preview}</Badge> : null}
                    <DeleteButton onDelete={() => deleteLesson(lesson.id)} labels={labels} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))
      )}
    </div>
  );
}
