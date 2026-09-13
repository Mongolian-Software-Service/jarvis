"use client";

import { useActionState, useState } from "react";
import { Loader2 } from "lucide-react";
import type { Strings } from "@jarvis/core";
import { saveLesson } from "@/lib/actions/admin";
import { buttonClass } from "@/components/ui/button";
import type { ActionResult } from "@/lib/actions/guard";
import type { AdminLesson } from "@/lib/queries/admin";
import { BodyPanel } from "./lesson-form/body-panel";
import { CodePanel } from "./lesson-form/code-panel";
import { SettingsPanel } from "./lesson-form/settings-panel";

/**
 * The lesson editor.
 *
 * The body field has a preview, because Markdown that is only ever seen as
 * source is Markdown with broken code fences in it. The preview renders through
 * the same component the lesson page uses — not a second renderer that agrees
 * with it today.
 */
export function LessonForm({
  lesson,
  moduleId,
  modules,
  t,
}: {
  lesson?: AdminLesson;
  moduleId?: string;
  modules: { id: string; title_mn: string }[];
  t: Strings;
}) {
  const [state, submit, pending] = useActionState<ActionResult | null, FormData>(saveLesson, null);
  const [title, setTitle] = useState(lesson?.title_mn ?? "");
  const [slug, setSlug] = useState(lesson?.slug ?? "");
  const [kind, setKind] = useState<string>(lesson?.kind ?? "video");
  const [body, setBody] = useState(lesson?.body_mn ?? "");
  const [preview, setPreview] = useState(false);

  const fields = state && !state.ok ? (state.fields ?? {}) : {};
  const l = t.admin.lessons;

  return (
    <form action={submit} className="space-y-6">
      {lesson ? <input type="hidden" name="id" value={lesson.id} /> : null}

      <div className="sticky top-0 z-20 -mx-5 flex items-center gap-4 border-b border-line bg-bg/90 px-5 py-3 backdrop-blur lg:-mx-8 lg:px-8">
        <p className="min-w-0 flex-1 truncate font-display text-[13px] font-semibold">
          {title || l.add}
        </p>
        {state?.ok ? <span className="text-xs text-ok">{t.states.saved}</span> : null}
        <button type="submit" disabled={pending} className={buttonClass("primary", "md")}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : null}
          {pending ? t.actions.saving : t.actions.save}
        </button>
      </div>

      {state && !state.ok ? (
        <p className="rounded-md border border-bad/30 bg-bad-soft px-3 py-2 text-sm text-bad">
          {Object.values(fields)[0] ?? state.error}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_21rem] lg:items-start">
        <div className="space-y-5">
          <BodyPanel
            lesson={lesson}
            t={t}
            fields={fields}
            title={title}
            setTitle={setTitle}
            body={body}
            setBody={setBody}
            preview={preview}
            setPreview={setPreview}
          />

          <CodePanel lesson={lesson} t={t} fields={fields} kind={kind} />
        </div>

        <SettingsPanel
          lesson={lesson}
          moduleId={moduleId}
          modules={modules}
          t={t}
          fields={fields}
          title={title}
          slug={slug}
          setSlug={setSlug}
          kind={kind}
          setKind={setKind}
        />
      </div>
    </form>
  );
}
