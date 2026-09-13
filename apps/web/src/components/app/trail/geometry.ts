import { coursePath, coursePlayerPath, type Locale } from "@jarvis/core";

/**
 * Where every node sits, as arithmetic rather than measurement.
 *
 * Nodes sit at a percentage across and a fixed number of pixels down, so the
 * map lays out identically on the server and in the browser, needs no
 * JavaScript, and cannot jump on hydration.
 */

export type TrailStep = {
  id: string;
  slug: string;
  title: string;
  lessonCount: number;
  coverUrl: string | null;
  /** Can be opened now: enrolled in it, or it is the free track anybody may take. */
  open: boolean;
  /** Already enrolled, so the link goes to the player rather than the sales page. */
  enrolled: boolean;
  percent: number;
  finished: boolean;
  /** The one to do next. Exactly one step carries this. */
  current: boolean;
};

/**
 * Two sizes, because the two layouts have different room.
 *
 * The horizontal track spans a whole page and can afford a 96px circle; the
 * winding column has to fit a circle *and* a title beside the road inside about
 * 310px on a phone, and every pixel the circle gains, the road loses.
 */
export const COLUMN_NODE = 76;
export const TRACK_NODE = 96;
export const HALF = COLUMN_NODE / 2;

/** Vertical distance between two nodes on the phone layout, in pixels. */
export const ROW = 184;
export const TOP = 48;
export const BOTTOM = 92;
/**
 * Two columns, left and right, alternating.
 *
 * A three-position weave (left, centre, right) puts a node in the middle of the
 * column — and the title under a middle node sits exactly where the road to the
 * next one has to pass. Two columns keep every label out at the edges and leave
 * the centre free for the road.
 */
export const WEAVE = [-1, 1];
/** Dots drawn in each gap. Seven reads as a road; two reads as an accident. */
export const DOTS = 7;
/**
 * How far the road leaves a node sideways before it turns down, as a fraction
 * of the horizontal distance to the next one — and how far it holds its height
 * on the way, as a fraction of the row.
 *
 * These two keep the dots off the titles. Pull the handles vertical (the
 * obvious choice) and the road sets off straight down through the label under
 * its own node; sideways, it goes around. Checked at 360px, where the column is
 * narrowest and the clearance smallest.
 */
export const HANDLE_X = 0.8;
export const HANDLE_Y = 0.12;

/**
 * Horizontal position, in **swings** rather than in per cent.
 *
 * `--swing` is how far the trail leaves the centre, and it is smaller on a
 * phone than on a tablet — a node 27% out on a 280px column drags its title off
 * the edge. So every x is emitted as `calc(50% + var(--swing) * f)` with `f`
 * between -1 and 1, and one media query on the container moves the whole road,
 * dots and all.
 */
export function across(f: number): string {
  return `calc(50% + (var(--swing) * ${f.toFixed(4)}))`;
}

export function nodeF(index: number): number {
  return WEAVE[index % WEAVE.length] ?? 0;
}

export function nodeY(index: number): number {
  return TOP + index * ROW;
}

/** One coordinate of a cubic Bézier. */
export function bezier(a: number, b: number, ca: number, cb: number, t: number): number {
  const u = 1 - t;
  return u * u * u * a + 3 * u * u * t * ca + 3 * u * t * t * cb + t * t * t * b;
}

export function href(step: TrailStep, locale: Locale): string {
  return step.enrolled ? coursePlayerPath(locale, step.slug) : coursePath(locale, step.slug);
}
