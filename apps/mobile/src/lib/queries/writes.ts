import { feedbackSchema } from "@jarvis/core";
import { supabase } from "../supabase";

/**
 * The three things the phone may write.
 *
 * A free course enrols in-app; a paid one never does — Apple's 3.1.1 requires
 * in-app purchase for digital content sold inside an iOS app, and Bonum is not
 * that (decision #009). `enrollFree` leans on the free-enrolment policy rather
 * than checking `is_free` itself: the database is what refuses.
 */

// ── Writes ───────────────────────────────────────────────────────────────────

export async function setProgress(input: {
  userId: string;
  /*
   * Sent even though `progress_sync_course` fills it from the lesson anyway.
   *
   * The column is NOT NULL with no default — the trigger satisfies it, but the
   * generated types cannot know that, and a cast to silence them would be a
   * lie that outlives the trigger. The caller has the course; passing it costs
   * nothing and the trigger still has the last word.
   */
  courseId: string;
  lessonId: string;
  completed: boolean;
  secondsWatched?: number;
  quizScore?: number | null;
}): Promise<boolean> {
  const { error } = await supabase.from("lesson_progress").upsert(
    {
      user_id: input.userId,
      course_id: input.courseId,
      lesson_id: input.lessonId,
      completed_at: input.completed ? new Date().toISOString() : null,
      seconds_watched: input.secondsWatched ?? 0,
      quiz_score: input.quizScore ?? null,
    },
    { onConflict: "user_id,lesson_id" },
  );
  return !error;
}

/**
 * Take a free course.
 *
 * Everything that makes this safe is in the policy: you may only enrol
 * yourself, only in a published course that costs nothing, and the row must say
 * `free`. The price is never read here and then trusted.
 */
export async function enrollFree(userId: string, courseId: string): Promise<boolean> {
  const { error } = await supabase
    .from("enrollments")
    .insert({ user_id: userId, course_id: courseId, source: "free" });
  // Already enrolled is not a failure — somebody tapped twice.
  return !error || error.code === "23505";
}

/**
 * A student's message to the team.
 *
 * Validated with `feedbackSchema` from core — the same object the web action
 * parses, so the phone cannot accept a message the browser would refuse, and
 * neither can send one the table's own check constraint would reject.
 *
 * `user_id` is sent because the column has no session default — and sending it
 * proves nothing on its own: the insert policy checks the row against
 * `auth.uid()`, so a phone that named somebody else would simply be refused.
 */
export async function sendFeedback(
  userId: string,
  body: string,
  copy: { tooShort: string; tooLong: string },
): Promise<{ ok: true } | { ok: false; error: string }> {
  const parsed = feedbackSchema(copy).safeParse({ body });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? copy.tooShort };
  }

  const { error } = await supabase
    .from("feedback")
    .insert({ user_id: userId, body: parsed.data.body });
  return error ? { ok: false, error: error.message } : { ok: true };
}
