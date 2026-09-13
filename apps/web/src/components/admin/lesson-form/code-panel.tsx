"use client";

import type { Strings } from "@jarvis/core";
import { Field, CodeInput, CodeArea } from "@/components/ui/field";
import type { AdminLesson } from "@/lib/queries/admin";

/** The exercise fields, shown for a `code` lesson or one that already has a
 *  starter — a kind change must not hide a field that still holds content. */
export function CodePanel({
  lesson,
  t,
  fields,
  kind,
}: {
  lesson?: AdminLesson;
  t: Strings;
  fields: Record<string, string>;
  kind: string;
}) {
  const l = t.admin.lessons;

  return (
    <>
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
    </>
  );
}
