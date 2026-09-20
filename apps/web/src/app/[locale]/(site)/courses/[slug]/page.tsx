import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { excerpt, handbookFor, lessonPath, type Locale } from "@jarvis/core";
import { getIntl, getLocale } from "@/lib/locale";
import { getCourseBySlug, hasCourseAccess } from "@/lib/queries/courses";
import { resumeLessonSlug } from "@/lib/queries/learn";
import { getViewer } from "@/lib/queries/viewer";
import { pageMetadata } from "@/lib/seo";
import { Syllabus } from "@/components/course/syllabus";
import { CourseHeader } from "@/components/course/course-header";
import { CourseAbout } from "@/components/course/course-about";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/courses/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const locale: Locale = await getLocale();
  const course = await getCourseBySlug(slug, locale);
  if (!course) return {};

  return pageMetadata({
    locale,
    title: course.title,
    description: course.summary || excerpt(course.description ?? ""),
    path: `/courses/${course.slug}`,
    image: course.coverUrl,
  });
}

export default async function CoursePage({ params }: PageProps<"/[locale]/courses/[slug]">) {
  const { slug } = await params;
  const { locale, t } = await getIntl();

  const course = await getCourseBySlug(slug, locale);
  if (!course) notFound();

  const [access, viewer] = await Promise.all([hasCourseAccess(course.id), getViewer()]);

  /*
   * Somebody who already holds this course is not shopping for it.
   *
   * This page argues: here is what the course is, here is what it costs, here
   * is how to get it. Every one of those sentences is answered for a student
   * who owns it, and they arrive here constantly — from the catalogue, from a
   * link, from the browser's own history. So they go where they were going.
   *
   * The page stays public and unchanged for a stranger, which is the whole
   * reason it lives in `(site)` (§3). Admins are exempt: previewing a course
   * is what the console's link on that course's row is for, and a preview that
   * redirects into a lesson previews nothing.
   */
  if (access && viewer?.role !== "admin") {
    const resume = await resumeLessonSlug(slug, locale);
    if (resume) redirect(lessonPath(locale, slug, resume));
  }

  const handbook = handbookFor(course.slug);
  const copy = { copy: t.actions.copy, copied: t.actions.copied };

  return (
    <article>
      <CourseHeader
        course={course}
        locale={locale}
        t={t}
        access={access}
        signedIn={Boolean(viewer)}
      />

      <div className="shell grid gap-12 py-12 lg:grid-cols-[1fr_22rem] lg:items-start">
        <CourseAbout course={course} locale={locale} t={t} copy={copy} handbook={handbook} />

        <section className="lg:sticky lg:top-24">
          <h2 className="font-display mb-4 text-[20px]">{t.learn.course.syllabus}</h2>
          <Syllabus
            modules={course.modules}
            courseSlug={course.slug}
            locale={locale}
            t={t}
            hasAccess={access}
          />
        </section>
      </div>
    </article>
  );
}
