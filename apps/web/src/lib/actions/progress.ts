"use server";

import { revalidatePath } from "next/cache";
import { mn, progressSchema } from "@jarvis/core";
import { createServerSupabase, getUserId } from "@/lib/supabase/server";
import { fail, type ActionResult } from "./guard";

/**
 * Mark a lesson done, or record where the video got to.
 *
 * One action for both, because they are one row. The database decides whether
 * the write is allowed: the policy on `lesson_progress` requires the row to be
 * the caller's own *and* the caller to hold the course, so a crafted request
 * cannot seed progress through a course nobody paid for.
 */
export async function setLessonProgress(input: {
  /*
   * Sent even though `progress_sync_course` fills it from the lesson anyway.
   *
   * The column is NOT NULL with no default — the trigger satisfies it, but the
   * generated types cannot know that, and a cast to silence them would be a lie
   * that outlives the trigger. Every caller already knows the course.
   */
  courseId: string;
  lessonId: string;
  completed: boolean;
  secondsWatched?: number;
  quizScore?: number | null;
  /** For revalidation — the player is a server-rendered page. */
  path?: string;
}): Promise<ActionResult> {
  const parsed = progressSchema.safeParse({
    lesson_id: input.lessonId,
    completed: input.completed,
    seconds_watched: input.secondsWatched,
    quiz_score: input.quizScore,
  });
  if (!parsed.success) return fail(mn.admin.errors.saveFailed);

  const userId = await getUserId();
  if (!userId) return fail(mn.admin.errors.notSignedIn);

  const supabase = createServerSupabase();
  const { error } = await supabase.from("lesson_progress").upsert(
    {
      user_id: userId,
      course_id: input.courseId,
      lesson_id: parsed.data.lesson_id,
      completed_at: parsed.data.completed ? new Date().toISOString() : null,
      seconds_watched: parsed.data.seconds_watched ?? 0,
      quiz_score: parsed.data.quiz_score ?? null,
    },
    { onConflict: "user_id,lesson_id" },
  );

  if (error) return fail(mn.admin.errors.saveFailed);

  if (input.path) revalidatePath(input.path);
  return { ok: true };
}
