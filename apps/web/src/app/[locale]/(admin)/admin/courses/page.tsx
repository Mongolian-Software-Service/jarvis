import type { Metadata } from "next";
import { bundleOffer } from "@jarvis/core";
import { getIntl } from "@/lib/locale";
import { listAdminCourses } from "@/lib/queries/admin";
import { getBundlePricing } from "@/lib/queries/pricing";
import { CourseTable } from "@/components/admin/course-table";
import { PricingForm } from "@/components/admin/pricing-form";

export const metadata: Metadata = { robots: { index: false } };

export default async function AdminCoursesPage() {
  const { locale, t } = await getIntl();
  const [courses, pricing] = await Promise.all([listAdminCourses(), getBundlePricing()]);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-[26px]">{t.admin.courses.title}</h1>
      {/* The one price sits above the courses it buys (§1). */}
      {pricing ? (
        <PricingForm pricing={pricing} offer={bundleOffer(pricing)} locale={locale} t={t} />
      ) : (
        <p className="border-bad/30 bg-bad-soft text-bad rounded-md border px-3 py-2 text-sm">
          {t.admin.pricing.unavailable}
        </p>
      )}
      <CourseTable courses={courses} locale={locale} t={t} />
    </div>
  );
}
