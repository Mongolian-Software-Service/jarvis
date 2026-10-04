"use client";

import { startTransition, useActionState, useEffect, useId, useRef, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import {
  PROJECT_DESCRIPTION_MAX,
  PROJECT_TITLE_MAX,
  PROJECT_URL_MAX,
  type Strings,
} from "@jarvis/core";
import { saveProject } from "@/lib/actions/projects";
import type { ActionResult } from "@/lib/actions/guard";
import { Field, Input, Textarea } from "@/components/ui/field";
import { buttonClass } from "@/components/ui/button";

/**
 * Adding a project, and changing one — the same three fields.
 *
 * The address and a name side by side, and the description under them at
 * full width, because it is what a classmate reads on the showcase. There is
 * no course to pick: a project is the student's, not a track's.
 *
 * With `initial` it is the edit form for that project, and its id travels as a
 * hidden field. Without it, the form adds a new one.
 *
 * Submitted through `onSubmit` rather than `<form action>`. React resets a
 * form after its action finishes **whether or not it worked**, so a mistyped
 * address came back as an empty box under a message about what was wrong
 * with it. Here the fields are kept until a save succeeds, and only then
 * cleared.
 */
export function ProjectForm({
  t,
  initial,
  onDone,
}: {
  t: Strings;
  initial?: { id: string; url: string; title: string | null; description: string | null };
  onDone?: () => void;
}) {
  const copy = t.learn.projects;
  const id = useId();
  const form = useRef<HTMLFormElement>(null);
  const [state, submit, pending] = useActionState<ActionResult | null, FormData>(saveProject, null);

  useEffect(() => {
    if (!state?.ok) return;
    form.current?.reset();
    onDone?.();
  }, [state, onDone]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    startTransition(() => submit(data));
  }

  const fields = state && !state.ok ? (state.fields ?? {}) : {};

  return (
    <form ref={form} onSubmit={onSubmit} className="@container space-y-3" noValidate>
      {initial ? <input type="hidden" name="id" value={initial.id} /> : null}

      {/* Side by side when *the form* is wide, not when the window is: the
          add form lives in a 20rem column on a laptop, and the edit form in a
          card two columns across. `sm:` would split the narrow one in two. */}
      <div className="grid gap-3 @md:grid-cols-2">
        <Field label={copy.url} hint={copy.urlHint} htmlFor={`${id}-url`} error={fields.url}>
          {/* Text, not `type="url"`: the browser would refuse the bare host the
              schema is happy to complete with https. */}
          <Input
            id={`${id}-url`}
            name="url"
            inputMode="url"
            autoComplete="url"
            autoCapitalize="none"
            spellCheck={false}
            maxLength={PROJECT_URL_MAX}
            placeholder={copy.urlPlaceholder}
            defaultValue={initial?.url}
            aria-invalid={fields.url ? true : undefined}
            aria-describedby={fields.url ? `${id}-url-error` : undefined}
          />
        </Field>

        <Field label={copy.name} htmlFor={`${id}-title`} error={fields.title}>
          <Input
            id={`${id}-title`}
            name="title"
            maxLength={PROJECT_TITLE_MAX}
            placeholder={copy.namePlaceholder}
            defaultValue={initial?.title ?? ""}
            aria-invalid={fields.title ? true : undefined}
            aria-describedby={fields.title ? `${id}-title-error` : undefined}
          />
        </Field>
      </div>

      <Field label={copy.description} htmlFor={`${id}-description`} error={fields.description}>
        <Textarea
          id={`${id}-description`}
          name="description"
          maxLength={PROJECT_DESCRIPTION_MAX}
          placeholder={copy.descriptionPlaceholder}
          defaultValue={initial?.description ?? ""}
          className="min-h-24"
          aria-invalid={fields.description ? true : undefined}
          aria-describedby={fields.description ? `${id}-description-error` : undefined}
        />
      </Field>

      {/* Said before the button rather than discovered afterwards: what is
          typed here is shown to every other student on «Сайн уу». */}
      <p className="text-ink-3 text-[12px]">{copy.publicNote}</p>

      {state && !state.ok && !Object.keys(fields).length ? (
        <p className="border-bad/30 bg-bad-soft text-bad rounded-md border px-3 py-2 text-[13px]">
          {state.error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <button type="submit" disabled={pending} className={buttonClass("primary", "md")}>
          {pending ? <Loader2 className="size-3.5 animate-spin" /> : null}
          {pending ? copy.saving : copy.save}
        </button>
        {onDone ? (
          <button type="button" onClick={onDone} className={buttonClass("ghost", "md")}>
            {copy.cancel}
          </button>
        ) : null}
      </div>
    </form>
  );
}
