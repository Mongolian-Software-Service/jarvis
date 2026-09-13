"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Circle, Loader2 } from "lucide-react";
import { setLessonProgress } from "@/lib/actions/progress";
import { buttonClass } from "@/components/ui/button";

/**
 * Mark a lesson finished, or take the mark back.
 *
 * Optimistic in the plainest way: the local state flips first and the page
 * refresh that follows brings the sidebar's tick with it. A student pressing
 * this at the end of a lesson should not watch a spinner to be told what they
 * already know.
 */
export function CompleteButton({
  courseId,
  lessonId,
  path,
  done,
  labels,
}: {
  courseId: string;
  lessonId: string;
  path: string;
  done: boolean;
  labels: { mark: string; marked: string; unmark: string };
}) {
  const [complete, setComplete] = useState(done);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function toggle() {
    const next = !complete;
    setComplete(next);
    startTransition(async () => {
      const result = await setLessonProgress({ courseId, lessonId, completed: next, path });
      if (!result.ok) setComplete(!next);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      title={complete ? labels.unmark : labels.mark}
      className={buttonClass(complete ? "secondary" : "primary", "md")}
    >
      {pending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : complete ? (
        <Check className="size-4 text-ok" />
      ) : (
        <Circle className="size-4" />
      )}
      {complete ? labels.marked : labels.mark}
    </button>
  );
}
