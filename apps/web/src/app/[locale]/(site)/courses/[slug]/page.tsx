import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { excerpt, handbookFor, type Locale } from "@jarvis/core";
import { getIntl, getLocale } from "@/lib/locale";
import { getCourseBySlug, hasCourseAccess } from "@/lib/queries/courses";
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
