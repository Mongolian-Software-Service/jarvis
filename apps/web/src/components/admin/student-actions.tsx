"use client";

import { useActionState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import type { Strings } from "@jarvis/core";
import { grantCourse, setRole } from "@/lib/actions/admin";
import { Field, Input, Select } from "@/components/ui/field";
import { buttonClass } from "@/components/ui/button";
import type { ActionResult } from "@/lib/actions/guard";
import type { AdminStudent } from "@/lib/queries/admin";

/**
 * The two things the team can do to a student, as their own module.
 *
 * They live beside the dialog rather than inside it because the dialog's job is
 * to *say who somebody is* — and the moment a screen both describes and writes,
 * the describing gets buried under the forms.
 */
export function RoleButton({ student, t }: { student: AdminStudent; t: Strings }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const next = student.role === "admin" ? "student" : "admin";

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await setRole(student.id, next);
          router.refresh();
        })
      }
      className={buttonClass("ghost", "md")}
    >
      {pending ? <Loader2 className="size-4 animate-spin" /> : null}
      {next === "admin" ? t.admin.students.makeAdmin : t.admin.students.makeStudent}
    </button>
  );
}

/**
 * Open one course by hand.
 *
 * The expiry is optional and empty means for good — the common case is a
 * student who paid some other way, and putting a date on that by default would
 * quietly close a course they own.
 */
export function GrantForm({
  studentId,
  courses,
  t,
}: {
  studentId: string;
  courses: { id: string; title: string }[];
  t: Strings;
}) {
  const [state, submit, pending] = useActionState<ActionResult | null, FormData>(grantCourse, null);
  const copy = t.admin.students;

  return (
    <form action={submit} className="bg-panel-2 flex flex-wrap items-end gap-3 rounded-md p-3">
      <input type="hidden" name="user_id" value={studentId} />

      <Field
        label={t.admin.nav.courses}
        htmlFor={`course-${studentId}`}
        className="min-w-44 flex-1"
      >
        <Select id={`course-${studentId}`} name="course_id" required>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.title}
            </option>
          ))}
        </Select>
      </Field>

      <Field label={copy.expires} htmlFor={`expires-${studentId}`}>
        <Input id={`expires-${studentId}`} name="expires_at" type="date" />
      </Field>

      <button type="submit" disabled={pending} className={buttonClass("primary", "md")}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : null}
        {copy.grant}
      </button>

      {state?.ok ? <span className="text-ok text-sm">{copy.granted}</span> : null}
      {state && !state.ok ? <span className="text-bad text-sm">{state.error}</span> : null}
    </form>
  );
}
