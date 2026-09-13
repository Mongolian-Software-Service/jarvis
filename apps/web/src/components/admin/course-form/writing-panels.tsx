"use client";

import type { Strings } from "@jarvis/core";
import { Field, Input, Textarea } from "@/components/ui/field";
import type { AdminCourse } from "@/lib/queries/admin";

/** The wide column: the two languages side by side, and nothing that is a
 *  setting. */
export function WritingPanels({
  course,
  t,
  fields,
  title,
  setTitle,
}: {
  course?: AdminCourse;
  t: Strings;
  fields: Record<string, string>;
  title: string;
  setTitle: (value: string) => void;
}) {
  const f = t.admin.courseForm;

  return (
    <>
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
    </>
  );
}
