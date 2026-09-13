"use client";

import { useActionState, useState } from "react";
import { Loader2 } from "lucide-react";
import type { Locale, Strings } from "@jarvis/core";
import { saveCourse } from "@/lib/actions/admin";
import { buttonClass } from "@/components/ui/button";
import type { ActionResult } from "@/lib/actions/guard";
import type { AdminCourse } from "@/lib/queries/admin";
import { WritingPanels } from "./course-form/writing-panels";
import { SettingsRail } from "./course-form/settings-rail";

/**
 * The course editor: a writing column and a settings rail.
 *
 * Everything that is a *setting* — status, price, section, order — lives in the
 * rail, so the wide column holds only the two languages side by side. The save
 * bar is pinned to the top from `lg` up: the form is taller than a screen, and
 * a button at its foot is a scroll away from whatever is being edited.
 */
export function CourseForm({
  course,
  t,
  locale,
}: {
  course?: AdminCourse;
  t: Strings;
  locale: Locale;
}) {
  const [state, submit, pending] = useActionState<ActionResult | null, FormData>(saveCourse, null);
  const [title, setTitle] = useState(course?.title_mn ?? "");
  const [slug, setSlug] = useState(course?.slug ?? "");
  const [dirty, setDirty] = useState(false);

  const fields = state && !state.ok ? (state.fields ?? {}) : {};

  return (
    <form action={submit} onChange={() => setDirty(true)} className="space-y-6">
      {course ? <input type="hidden" name="id" value={course.id} /> : null}

      <div className="sticky top-0 z-20 -mx-5 flex items-center gap-4 border-b border-line bg-bg/90 px-5 py-3 backdrop-blur lg:-mx-8 lg:px-8">
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-[13px] font-semibold">
            {title || t.admin.courses.create}
          </p>
          {dirty && !state?.ok ? (
            <p className="text-xs text-warn">•</p>
          ) : state?.ok ? (
            <p className="text-xs text-ok">{t.admin.courses.saved}</p>
          ) : null}
        </div>
        <button type="submit" disabled={pending} className={buttonClass("primary", "md")}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : null}
          {pending ? t.actions.saving : t.actions.save}
        </button>
      </div>

      {state && !state.ok && !Object.keys(fields).length ? (
        <p className="rounded-md border border-bad/30 bg-bad-soft px-3 py-2 text-sm text-bad">
          {state.error}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_21rem] lg:items-start">
        <div className="space-y-5">
          <WritingPanels
            course={course}
            t={t}
            fields={fields}
            title={title}
            setTitle={setTitle}
          />
        </div>

        <SettingsRail
          course={course}
          locale={locale}
          t={t}
          fields={fields}
          title={title}
          slug={slug}
          setSlug={setSlug}
        />
      </div>
    </form>
  );
}
