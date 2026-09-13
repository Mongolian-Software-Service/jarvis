"use client";

import { Eye } from "lucide-react";
import type { Strings } from "@jarvis/core";
import { Field, Input, Textarea } from "@/components/ui/field";
import { Markdown } from "@/components/lesson/markdown";
import type { AdminLesson } from "@/lib/queries/admin";
import { cn } from "@/lib/cn";

/**
 * Title, slug and the two bodies.
 *
 * The body has a preview, because Markdown only ever seen as source is
 * Markdown with broken code fences in it — and it renders through the same
 * component the lesson page uses, not a second renderer that agrees with it
 * today.
 */
export function BodyPanel({
  lesson,
  t,
  fields,
  title,
  setTitle,
  body,
  setBody,
  preview,
  setPreview,
}: {
  lesson?: AdminLesson;
  t: Strings;
  fields: Record<string, string>;
  title: string;
  setTitle: (value: string) => void;
  body: string;
  setBody: (value: string) => void;
  preview: boolean;
  setPreview: (update: (value: boolean) => boolean) => void;
}) {
  const l = t.admin.lessons;

  return (
    <>
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

    </>
  );
}
