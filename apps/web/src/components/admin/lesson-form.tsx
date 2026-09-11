"use client";

import { useActionState, useState } from "react";
import { Eye, Loader2, Wand2 } from "lucide-react";
import { slugify, type Strings } from "@jarvis/core";
import { saveLesson } from "@/lib/actions/admin";
import { Field, Input, Select, Textarea, CodeInput, CodeArea } from "@/components/ui/field";
import { buttonClass } from "@/components/ui/button";
import { Markdown } from "@/components/lesson/markdown";
import type { ActionResult } from "@/lib/actions/guard";
import type { AdminLesson } from "@/lib/queries/admin";
import { cn } from "@/lib/cn";

const KINDS = ["video", "text", "code", "quiz"] as const;

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
          <div className="panel space-y-5 p-5">
            <Field label={t.admin.courseForm.titleMn} htmlFor="title_mn" error={fields.title_mn}>
              <Input
                id="title_mn"
                name="title_mn"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
              />
            </Field>
            <Field
              label={t.admin.courseForm.titleEn}
              htmlFor="title_en"
              hint={t.admin.courseForm.englishNote}
            >
              <Input id="title_en" name="title_en" defaultValue={lesson?.title_en ?? ""} />
            </Field>
          </div>

          <div className="panel space-y-5 p-5">
            <div className="flex items-center justify-between">
              <p className="kicker">{l.bodyMn}</p>
              <button
                type="button"
                onClick={() => setPreview((value) => !value)}
                className={cn(
                  "flex items-center gap-1.5 rounded-sm px-2 py-1 text-xs",
                  preview ? "bg-accent-soft text-accent" : "text-ink-3 hover:text-ink",
                )}
              >
                <Eye className="size-3.5" />
                {preview ? t.actions.edit : l.title}
              </button>
            </div>

            {preview ? (
              <div className="min-h-48 rounded-md border border-line bg-panel-2 p-4">
                <Markdown
                  source={body}
                  copyLabels={{ copy: t.actions.copy, copied: t.actions.copied }}
                />
              </div>
            ) : (
              <Field label={l.bodyMn} htmlFor="body_mn" hint={l.bodyHint} error={fields.body_mn}>
                <Textarea
                  id="body_mn"
                  name="body_mn"
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                  className="min-h-72 font-mono text-[13px]"
                />
              </Field>
            )}

            {/* Kept mounted while the preview is open: an unmounted field posts
                nothing, and the English body would be wiped on save. */}
            <div className={preview ? "hidden" : undefined}>
              <Field label={l.bodyEn} htmlFor="body_en">
                <Textarea
                  id="body_en"
                  name="body_en"
                  defaultValue={lesson?.body_en ?? ""}
                  className="min-h-40 font-mono text-[13px]"
                />
              </Field>
            </div>
          </div>

          {kind === "code" || lesson?.starter_code ? (
            <div className="panel space-y-5 p-5">
              <p className="kicker">{l.starter}</p>
              <Field label={l.codeLanguage} htmlFor="code_language">
                <CodeInput
                  id="code_language"
                  name="code_language"
                  defaultValue={lesson?.code_language ?? ""}
                  placeholder="ts, python, css…"
                />
              </Field>
              <Field label={l.starter} htmlFor="starter_code" error={fields.starter_code}>
                <CodeArea
                  id="starter_code"
                  name="starter_code"
                  defaultValue={lesson?.starter_code ?? ""}
                />
              </Field>
              <Field label={l.solution} htmlFor="solution_code">
                <CodeArea
                  id="solution_code"
                  name="solution_code"
                  defaultValue={lesson?.solution_code ?? ""}
                />
              </Field>
            </div>
          ) : null}
        </div>

        <div className="panel space-y-5 p-5 lg:sticky lg:top-20">
          <p className="kicker">{t.admin.courseForm.settings}</p>

          <Field label={t.admin.modules.title} htmlFor="module_id" error={fields.module_id}>
            <Select
              id="module_id"
              name="module_id"
              defaultValue={lesson?.module_id ?? moduleId ?? modules[0]?.id}
              required
            >
              {modules.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.title_mn}
                </option>
              ))}
            </Select>
          </Field>

          <Field
            label={t.admin.courseForm.slug}
            htmlFor="slug"
            hint={t.admin.courseForm.slugHint}
            error={fields.slug}
          >
            <div className="flex gap-2">
              <CodeInput
                id="slug"
                name="slug"
                value={slug}
                onChange={(event) => setSlug(event.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setSlug(slugify(title))}
                className={buttonClass("secondary", "md", "shrink-0")}
                title={t.admin.courseForm.generate}
              >
                <Wand2 className="size-4" />
              </button>
            </div>
          </Field>

          <Field label={l.kind} htmlFor="kind">
            <Select
              id="kind"
              name="kind"
              value={kind}
              onChange={(event) => setKind(event.target.value)}
            >
              {KINDS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </Field>

          <Field label={l.video} htmlFor="video_url" error={fields.video_url}>
            <CodeInput id="video_url" name="video_url" defaultValue={lesson?.video_url ?? ""} />
          </Field>

          <Field label={l.duration} htmlFor="duration_minutes">
            <Input
              id="duration_minutes"
              name="duration_minutes"
              type="number"
              min={0}
              defaultValue={lesson?.duration_minutes ?? 0}
              className="tabular"
            />
          </Field>

          <Field label={t.admin.courseForm.rank} htmlFor="rank">
            <Input
              id="rank"
              name="rank"
              type="number"
              min={0}
              defaultValue={lesson?.rank ?? 0}
              className="tabular"
            />
          </Field>

          <label className="flex items-start gap-2.5 text-sm">
            <input
              type="checkbox"
              name="is_preview"
              defaultChecked={lesson?.is_preview ?? false}
              className="mt-0.5 size-4 accent-[var(--accent)]"
            />
            <span>
              {l.preview}
              <span className="block text-xs text-ink-3">{l.previewHint}</span>
            </span>
          </label>
        </div>
      </div>
    </form>
  );
}
