import Image from "next/image";
import gameShot from "@/assets/game-controller.jpg";
import { Frame } from "./chrome";

/**
 * The one row that carries a real picture.
 *
 * Games are the track whose appeal is the *look* of the thing, and a hairline
 * sketch undersells it. It sits well below the fold, is never `priority`, and
 * `sizes` keeps a phone off the desktop variant — so it stays out of the LCP
 * measurement the ship checklist cares about (§7).
 */

export function GameVisual() {
  return (
    <Frame>
      <Image
        src={gameShot}
        alt=""
        placeholder="blur"
        /* The visual column is half of a 78rem shell above `lg`, one column
           below it. Without this a phone downloads the 1677px variant. */
        sizes="(max-width: 1023px) 100vw, 560px"
        className="block h-auto w-full"
      />
    </Frame>
  );
}

/** One sentence in, three jobs done — and it costs nothing. */
