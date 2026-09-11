import { notFound, redirect } from "next/navigation";
import { coursePath, lessonPath } from "@jarvis/core";
import { getLocale } from "@/lib/locale";
import { resumeLessonSlug } from "@/lib/queries/learn";
import { getCourseBySlug } from "@/lib/queries/courses";

/**
 * "Continue" has no screen of its own — it is a decision about where to send
 * somebody, so this route makes that decision and redirects.
 *
 * A course with no lessons yet falls back to its public page, which at least
 * says what the course is. Sending a student to an empty player would not.
 */
export default async function CourseResumePage({ params }: PageProps<"/[locale]/learn/[course]">) {
  const { course } = await params;
  const locale = await getLocale();

  const detail = await getCourseBySlug(course, locale);
  if (!detail) notFound();

  const slug = await resumeLessonSlug(course, locale);
  if (!slug) redirect(coursePath(locale, course));

  redirect(lessonPath(locale, course, slug));
}
