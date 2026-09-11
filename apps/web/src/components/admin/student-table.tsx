"use client";

import { useActionState, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search, ShieldCheck, User } from "lucide-react";
import { formatDate, type Locale, type Strings } from "@jarvis/core";
import { grantCourse, setRole } from "@/lib/actions/admin";
import { Field, Input, Select } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { buttonClass } from "@/components/ui/button";
import type { ActionResult } from "@/lib/actions/guard";
import type { AdminStudent } from "@/lib/queries/admin";

export function StudentTable({
  students,
  courses,
  locale,
  t,
}: {
  students: AdminStudent[];
  courses: { id: string; title: string }[];
  locale: Locale;
  t: Strings;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  const rows = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return students;
    return students.filter((student) =>
      [student.name ?? "", student.email ?? ""].some((value) =>
        value.toLowerCase().includes(term),
      ),
    );
  }, [students, query]);

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-3" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t.admin.students.search}
          className="pl-9"
          aria-label={t.admin.students.search}
        />
      </div>

      {rows.length === 0 ? (
        <p className="panel border-dashed px-4 py-10 text-center text-sm text-ink-3">
          {t.admin.students.empty}
        </p>
      ) : (
        <div className="panel divide-y divide-line overflow-hidden">
          {rows.map((student) => (
            <div key={student.id} className="px-4 py-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-panel-2 text-ink-3">
                  {student.role === "admin" ? (
                    <ShieldCheck className="size-4 text-accent" />
                  ) : (
                    <User className="size-4" />
                  )}
                </span>

                <div className="min-w-40 flex-1">
                  <p className="truncate text-sm font-medium">{student.name ?? "—"}</p>
                  <p className="truncate text-xs text-ink-3">{student.email}</p>
                </div>

                <span className="hidden text-xs text-ink-3 tabular sm:block">
                  {formatDate(student.joined, locale)}
                </span>
                <span className="text-xs text-ink-3 tabular">
                  {student.courses} {t.admin.nav.courses.toLowerCase()}
                </span>

                {student.role === "admin" ? <Badge tone="accent">admin</Badge> : null}

                <RoleButton student={student} t={t} />

                <button
                  type="button"
                  onClick={() => setOpen(open === student.id ? null : student.id)}
                  className={buttonClass("secondary", "sm")}
                >
                  {t.admin.students.grant}
                </button>
              </div>

              {open === student.id ? (
                <GrantForm studentId={student.id} courses={courses} t={t} />
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RoleButton({ student, t }: { student: AdminStudent; t: Strings }) {
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
      className={buttonClass("ghost", "sm")}
    >
      {pending ? <Loader2 className="size-3.5 animate-spin" /> : null}
      {next === "admin" ? t.admin.students.makeAdmin : t.admin.students.makeStudent}
    </button>
  );
}

/**
 * Open a course for somebody by hand.
 *
 * The expiry is optional and empty means for good — the common case is a
 * student who paid some other way, and putting a date on that by default would
 * quietly close a course they own.
 */
function GrantForm({
  studentId,
  courses,
  t,
}: {
  studentId: string;
  courses: { id: string; title: string }[];
  t: Strings;
}) {
  const [state, submit, pending] = useActionState<ActionResult | null, FormData>(grantCourse, null);

  return (
    <form action={submit} className="mt-3 flex flex-wrap items-end gap-3 rounded-md bg-panel-2 p-3">
      <input type="hidden" name="user_id" value={studentId} />

      <Field label={t.admin.nav.courses} htmlFor={`course-${studentId}`} className="min-w-48 flex-1">
        <Select id={`course-${studentId}`} name="course_id" required>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.title}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Дуусах" htmlFor={`expires-${studentId}`}>
        <Input id={`expires-${studentId}`} name="expires_at" type="date" />
      </Field>

      <button type="submit" disabled={pending} className={buttonClass("primary", "md")}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : null}
        {t.admin.students.grant}
      </button>

      {state?.ok ? <span className="text-sm text-ok">{t.admin.students.granted}</span> : null}
      {state && !state.ok ? <span className="text-sm text-bad">{state.error}</span> : null}
    </form>
  );
}
