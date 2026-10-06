import type { Metadata } from "next";
import { fmt } from "@jarvis/core";
import { getIntl } from "@/lib/locale";
import { pageMetadata } from "@/lib/seo";
import { getViewer } from "@/lib/queries/viewer";
import { hasEveryCourse, listCourses } from "@/lib/queries/courses";
import { getBundleOffer } from "@/lib/queries/pricing";
import { CourseCard } from "@/components/course/course-card";
import { BundlePanel } from "@/components/course/bundle-panel";
import { Empty } from "@/components/ui/empty";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getIntl();
  // Through `pageMetadata` like every other public page, for the canonical URL
  // and the social tags this one was the only page without.
  return pageMetadata({
    locale,
    title: t.learn.catalogue.title,
    description: t.learn.catalogue.deck,
    path: "/courses",
  });
}

/**
 * The catalogue, which is really the offer.
 *
 * There is no level filter. Five courses is a list you read, not one you
 * search, and a row of filters over it implies a choice to make — which is the
 * opposite of what the bundle above it says. Filtering came from a catalogue
 * that was going to grow; if it does, this is where it comes back.
 */
export default async function CoursesPage() {
  const { locale, t } = await getIntl();

  const [courses, viewer, owned, offer] = await Promise.all([
    listCourses(locale),
    getViewer(),
    hasEveryCourse(),
    getBundleOffer(),
  ]);

  return (
    <div className="shell py-12">
      {/* The offer first. The cards below are what it contains, not a menu to
          choose from — see BundlePanel. */}
      {courses.length > 1 ? (
        <div className="mb-12">
          <BundlePanel
            courses={courses}
            locale={locale}
            t={t}
            owned={owned}
            signedIn={Boolean(viewer)}
            offer={offer}
          />
        </div>
      ) : null}

      <header className="mb-8">
        <h1 className="font-display text-[32px] leading-[1.1] sm:text-[40px]">
          {t.learn.bundle.includes}
        </h1>
        <p className="text-ink-3 mt-2 text-[15px]">{t.learn.catalogue.deck}</p>
      </header>

      {courses.length === 0 ? (
        <Empty title={t.learn.catalogue.empty} />
      ) : (
        <>
          <p className="kicker mb-4">{fmt(t.learn.catalogue.count, { count: courses.length })}</p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course, index) => (
              <CourseCard
                key={course.id}
                course={course}
                locale={locale}
                t={t}
                priority={index === 0}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
