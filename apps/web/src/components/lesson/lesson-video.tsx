"use client";

import { useEffect, useRef } from "react";
import { setLessonProgress } from "@/lib/actions/progress";

/**
 * The player.
 *
 * A plain `<video>` element: the seed's clips are MP4s and a real course will
 * serve HLS from Storage or Mux, both of which this element handles natively on
 * the phones most students use. A video library would be a dependency, a bundle
 * and a second set of keyboard shortcuts to teach.
 *
 * Position is saved every fifteen seconds, not on every `timeupdate` — that
 * event fires four times a second, and a server action per tick would be a
 * denial of service written by us.
 */
export function LessonVideo({
  src,
  courseId,
  lessonId,
  startAt,
  path,
  poster,
}: {
  src: string;
  courseId: string;
  lessonId: string;
  startAt: number;
  path: string;
  poster?: string | null;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const lastSaved = useRef(startAt);

  useEffect(() => {
    const element = video.current;
    if (!element || startAt <= 0) return;
    // Resume where they left off, once the browser knows how long the file is.
    const resume = () => {
      if (startAt < element.duration - 5) element.currentTime = startAt;
    };
    element.addEventListener("loadedmetadata", resume, { once: true });
    return () => element.removeEventListener("loadedmetadata", resume);
  }, [startAt]);

  function onTimeUpdate() {
    const element = video.current;
    if (!element) return;
    const seconds = Math.floor(element.currentTime);
    if (seconds - lastSaved.current < 15) return;
    lastSaved.current = seconds;
    void setLessonProgress({ courseId, lessonId, completed: false, secondsWatched: seconds });
  }

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-black">
      <video
        ref={video}
        src={src}
        poster={poster ?? undefined}
        controls
        preload="metadata"
        playsInline
        onTimeUpdate={onTimeUpdate}
        onEnded={() => {
          void setLessonProgress({ courseId, lessonId, completed: true, secondsWatched: 0, path });
        }}
        className="aspect-video w-full bg-black"
      />
    </div>
  );
}
