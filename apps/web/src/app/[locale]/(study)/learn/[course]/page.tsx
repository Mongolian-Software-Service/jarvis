import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { coursePath, lessonPath } from "@jarvis/core";
import { getIntl } from "@/lib/locale";
import { resumeLessonSlug } from "@/lib/queries/learn";
import { getCourseBySlug, hasCourseAccess } from "@/lib/queries/courses";

export const metadata: Metadata = { robots: { index: false } };

/**
 * The course, for somebody who holds it — a doorway, not a room.
 *
 * It drew the whole syllabus for a while, on the argument that resuming into
 * the middle of a course with no sense of the order is disorienting. That
 * argument was right, and the lesson screen answered it: the syllabus lives
 * down its left column now, on every lesson, with the finished ones marked.
 *
 * Which left this page showing a reader a list, asking them to press a button,
 * and landing them on a page showing the same list. A step that adds nothing
 * is a step that only costs a tap, so it redirects.
 *
 * The route stays rather than being deleted, because four things point at it —
 * «Үргэлжлүүлэх» on the course page, the free-enrolment button, `hello`'s next
 * step and the trail — and because `/mn/learn/<course>` is the URL somebody
 * would type or have bookmarked. It should arrive somewhere, not 404.
 */
export default async function CoursePlayerPage({ params }: PageProps<"/[locale]/learn/[course]">) {
  const { course } = await params;
  const { locale } = await getIntl();

  const detail = await getCourseBySlug(course, locale);
  if (!detail) notFound();

  const [access, resume] = await Promise.all([
    hasCourseAccess(detail.id),
    resumeLessonSlug(course, locale),
  ]);

  /*
   * No access, or nothing to play: the public course page is the honest place
   * for both. It says what the course is and how to get it.
   */
  if (!access || !resume) redirect(coursePath(locale, course));

  redirect(lessonPath(locale, course, resume));
}
