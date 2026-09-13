"use client";

import { slugify, type Strings } from "@jarvis/core";
import { Wand2 } from "lucide-react";
import { Field, Input, Select, CodeInput } from "@/components/ui/field";
import { buttonClass } from "@/components/ui/button";
import type { AdminLesson } from "@/lib/queries/admin";

const KINDS = ["video", "text", "code", "quiz"] as const;

/** Everything that is not the lesson's content: where it sits, what kind it is,
 *  and whether a stranger may see it. */
export function SettingsPanel({
  lesson,
  moduleId,
  modules,
  t,
  fields,
  title,
  slug,
  setSlug,
  kind,
  setKind,
}: {
  lesson?: AdminLesson;
  moduleId?: string;
  modules: { id: string; title_mn: string }[];
  t: Strings;
  fields: Record<string, string>;
  title: string;
  slug: string;
  setSlug: (value: string) => void;
  kind: string;
  setKind: (value: string) => void;
}) {
  const l = t.admin.lessons;

  return (
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
  );
}
