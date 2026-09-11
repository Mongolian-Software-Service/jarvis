import type { Metadata } from "next";
import { getIntl } from "@/lib/locale";
import { CourseForm } from "@/components/admin/course-form";

export const metadata: Metadata = { robots: { index: false } };

export default async function NewCoursePage() {
  const { locale, t } = await getIntl();
  return <CourseForm t={t} locale={locale} />;
}
