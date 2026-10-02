"use client";

import { useEffect, useRef } from "react";
import { setLessonProgress } from "@/lib/actions/progress";

/**
 * The player.
 *
 * A plain `<video>` element pointed at a whole URL, which is what keeps
 * Cloudflare R2 out of this app entirely (decision #014): no client, no signing,
 * no base to configure, and nothing about where the file lives in a browser
 * bundle. A video library would be a dependency, a bundle and a second set of
 * keyboard shortcuts to teach.
 *
 * What that costs is adaptive bitrate — one encode is served to everybody, so
 * the encode is the place that decision is paid for (SETUP.md §11 has the
 * ffmpeg line and the reason `+faststart` is in it). Should the school ever
 * need a bitrate ladder, this element plays HLS natively on the phones most
 * students use and the `src` is the only thing that changes.
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
    <div className="border-line overflow-hidden rounded-lg border bg-black">
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
