import { useState } from "react";
import { useVideoPlayer } from "expo-video";
import { useIntl } from "@/lib/settings";
import { getLesson, setProgress } from "@/lib/queries";
import { LessonContent } from "./lesson-content";
import { LessonActions } from "./lesson-actions";

/** The lesson, once it has loaded: its own progress state and one video player. */
export function LessonBody({
  view,
  userId,
  courseSlug,
  onProgress,
}: {
  view: NonNullable<Awaited<ReturnType<typeof getLesson>>>;
  userId: string | null;
  courseSlug: string;
  onProgress: () => void;
}) {
  const { locale, t } = useIntl();
  const [complete, setComplete] = useState(view.progress.completed);
  const [showSolution, setShowSolution] = useState(false);
  const item = view.lesson!;

  /*
   * One player, created once per source.
   *
   * `useVideoPlayer` keeps the native player alive across re-renders; creating
   * it inside the render would restart the video every time the "done" button
   * flips a piece of state.
   */
  const player = useVideoPlayer(item.videoUrl ?? null, (instance) => {
    instance.loop = false;
    if (view.progress.secondsWatched > 0) instance.currentTime = view.progress.secondsWatched;
  });

  async function mark(next: boolean) {
    setComplete(next);
    if (!userId) return;
    const ok = await setProgress({
      userId,
      courseId: view.course.id,
      lessonId: item.id,
      completed: next,
    });
    if (!ok) setComplete(!next);
    else onProgress();
  }

  return (
    <>
      <LessonContent
        item={item}
        view={view}
        locale={locale}
        t={t}
        player={player}
        showSolution={showSolution}
        setShowSolution={setShowSolution}
        userId={userId}
        setComplete={setComplete}
        onProgress={onProgress}
      />

      <LessonActions
        t={t}
        complete={complete}
        mark={(value) => void mark(value)}
        next={view.next}
        courseSlug={courseSlug}
      />
    </>
  );
}
