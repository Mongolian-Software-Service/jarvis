/**
 * The pictures beside the four rows on the front page.
 *
 * Three of the four are drawn rather than photographed — a small honest sketch
 * of what that track ends in. Drawn so they cannot go stale behind a redesign,
 * and so the page costs no image bytes.
 *
 * The games row is the exception and carries a real picture. It is the one
 * track whose appeal is the *look* of the thing, and a hairline sketch of a
 * game undersells it. It sits well below the fold, it is never `priority`, and
 * `sizes` keeps a phone off the desktop-sized variant — so it stays out of the
 * LCP measurement the ship checklist cares about (CLAUDE.md §7).
 *
 * The mock content is deliberately language-neutral wherever it can be — bars,
 * URLs, numerals, `iOS`, `2D` — so the same sketch reads correctly in both
 * editions. The few words that cannot be avoided come from
 * `marketing.tracks.demo`, which exists for exactly this and is translated.
 */

export { WebsiteVisual } from "./visuals/website";
export { MobileVisual } from "./visuals/mobile";
export { GameVisual } from "./visuals/game";
export { MeetVisual } from "./visuals/meet";
