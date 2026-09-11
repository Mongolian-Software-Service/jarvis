import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getIntl } from "@/lib/locale";
import { createServerSupabase } from "@/lib/supabase/server";
import { LessonForm } from "@/components/admin/lesson-form";

export const metadata: Metadata = { robots: { index: false } };

/**
 * A new lesson always arrives with a module — the link that opens this page
 * comes from that module's own row. Without one there is nothing to attach it
 * to, and guessing is worse than a 404.
 */
export default async function NewLessonPage({ searchParams }: PageProps<"/[locale]/admin/lessons/new">) {
  const { t } = await getIntl();
  const { module: moduleId } = await searchParams;
  if (typeof moduleId !== "string") notFound();

  const supabase = createServerSupabase();
  const { data: current } = await supabase
    .from("modules")
    .select("id, course_id")
    .eq("id", moduleId)
    .maybeSingle();

  if (!current) notFound();

  const { data: modules } = await supabase
    .from("modules")
    .select("id, title_mn")
    .eq("course_id", current.course_id)
    .order("rank", { ascending: true });

  return <LessonForm moduleId={moduleId} modules={modules ?? []} t={t} />;
}
