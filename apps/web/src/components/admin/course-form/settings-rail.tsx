"use client";

import { Wand2 } from "lucide-react";
import { COURSE_LEVELS, levelLabel, slugify, type Locale, type Strings } from "@jarvis/core";
import { Field, Input, Select, CodeInput } from "@/components/ui/field";
import { buttonClass } from "@/components/ui/button";
import type { AdminCourse } from "@/lib/queries/admin";

/**
 * Status, section, order and whether the course is free.
 *
 * There is no price field, and that is the model rather than an omission: one
 * price buys everything (§1), so a course says only `is_free` — a checkbox,
 * not an amount.
 */
export function SettingsRail({
  course,
  locale,
  t,
  fields,
  title,
  slug,
  setSlug,
}: {
  course?: AdminCourse;
  locale: Locale;
  t: Strings;
  fields: Record<string, string>;
  title: string;
  slug: string;
  setSlug: (value: string) => void;
}) {
  const f = t.admin.courseForm;

  return (
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

          {/* Where a price used to be. A course is either outside the bundle
              and free to anyone, or inside it — there is no third answer and no
              amount to type (§1). */}
          <label className="flex items-start gap-2.5 text-sm">
            <input
              type="checkbox"
              name="is_free"
              defaultChecked={course?.is_free ?? false}
              className="mt-0.5 size-4 accent-[var(--accent)]"
            />
            <span>
              {f.free}
              <span className="block text-xs text-ink-3">{f.freeHint}</span>
            </span>
          </label>

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
  );
}
