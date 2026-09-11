"use client";

import { useActionState, useState } from "react";
import { Loader2, Wand2 } from "lucide-react";
import { COURSE_LEVELS, levelLabel, slugify, type Locale, type Strings } from "@jarvis/core";
import { saveCourse } from "@/lib/actions/admin";
import { Field, Input, Select, Textarea, CodeInput } from "@/components/ui/field";
import { buttonClass } from "@/components/ui/button";
import type { ActionResult } from "@/lib/actions/guard";
import type { AdminCourse } from "@/lib/queries/admin";

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
  const f = t.admin.courseForm;

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
          <div className="panel space-y-5 p-5">
            <p className="kicker">{f.basics}</p>

            <Field label={f.titleMn} htmlFor="title_mn" error={fields.title_mn}>
              <Input
                id="title_mn"
                name="title_mn"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
              />
            </Field>

            <Field label={f.titleEn} htmlFor="title_en" hint={f.englishNote}>
              <Input id="title_en" name="title_en" defaultValue={course?.title_en ?? ""} />
            </Field>

            <Field label={f.summaryMn} htmlFor="summary_mn" error={fields.summary_mn}>
              <Textarea
                id="summary_mn"
                name="summary_mn"
                defaultValue={course?.summary_mn ?? ""}
                required
              />
            </Field>

            <Field label={f.summaryEn} htmlFor="summary_en">
              <Textarea id="summary_en" name="summary_en" defaultValue={course?.summary_en ?? ""} />
            </Field>
          </div>

          <div className="panel space-y-5 p-5">
            <p className="kicker">{f.content}</p>

            <Field label={f.descriptionMn} htmlFor="description_mn" hint={t.admin.lessons.bodyHint}>
              <Textarea
                id="description_mn"
                name="description_mn"
                defaultValue={course?.description_mn ?? ""}
                className="min-h-48"
              />
            </Field>

            <Field label={f.descriptionEn} htmlFor="description_en">
              <Textarea
                id="description_en"
                name="description_en"
                defaultValue={course?.description_en ?? ""}
                className="min-h-32"
              />
            </Field>
          </div>
        </div>

        <div className="panel space-y-5 p-5 lg:sticky lg:top-20">
          <p className="kicker">{f.settings}</p>

          <Field label={f.slug} htmlFor="slug" hint={f.slugHint} error={fields.slug}>
            <div className="flex gap-2">
              <CodeInput
                id="slug"
                name="slug"
                value={slug}
                onChange={(event) => setSlug(event.target.value)}
                required
              />
              {/* A starting point the writer edits — never applied silently.
                  Two Mongolian titles can transliterate to the same string. */}
              <button
                type="button"
                onClick={() => setSlug(slugify(title))}
                className={buttonClass("secondary", "md", "shrink-0")}
                title={f.generate}
              >
                <Wand2 className="size-4" />
              </button>
            </div>
          </Field>

          <Field label={f.level} htmlFor="level">
            <Select id="level" name="level" defaultValue={course?.level ?? "beginner"}>
              {COURSE_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {levelLabel(level, locale)}
                </option>
              ))}
            </Select>
          </Field>

          <Field label={f.topic} htmlFor="topic" hint={f.topicHint} error={fields.topic}>
            <CodeInput id="topic" name="topic" defaultValue={course?.topic ?? "general"} required />
          </Field>

          <Field label={f.price} htmlFor="price_mnt" hint={f.priceHint} error={fields.price_mnt}>
            <Input
              id="price_mnt"
              name="price_mnt"
              type="number"
              min={0}
              step={1000}
              defaultValue={course?.price_mnt ?? 0}
              className="tabular"
            />
          </Field>

          <Field label={f.cover} htmlFor="cover_url" error={fields.cover_url}>
            <CodeInput id="cover_url" name="cover_url" defaultValue={course?.cover_url ?? ""} />
          </Field>

          <Field label={f.rank} htmlFor="rank">
            <Input
              id="rank"
              name="rank"
              type="number"
              min={0}
              defaultValue={course?.rank ?? 0}
              className="tabular"
            />
          </Field>

          <label className="flex items-center gap-2.5 text-sm">
            <input
              type="checkbox"
              name="is_published"
              defaultChecked={course?.is_published ?? false}
              className="size-4 accent-[var(--accent)]"
            />
            {f.publish}
          </label>
        </div>
      </div>
    </form>
  );
}
