/**
 * The drawing primitives every frame is made of.
 *
 * Plain SVG that Figma imports as editable layers: real `<text>` nodes (not
 * paths), Inter — which Figma ships — and geometry described with presentation
 * attributes rather than a stylesheet, because Figma's importer reads
 * attributes reliably and CSS classes less so. Every box is wrapped in a
 * `<g id="…">`, and that id becomes the layer's name once imported.
 *
 * The palette is the print palette, not the product's: these are drawn on
 * white because they end up in a handbook and on a wall (§1).
 */

export const W = 1600;
export const H = 840;

export const INK = "#0f1216";
export const MUTED = "#5b616e";
export const FAINT = "#9aa0a6";
export const LINE = "#dfe3ea";
export const WASH = "#f6f7f9";
export const ACCENT = "#5e6ad2";
export const ACCENT_SOFT = "#eef0fd";
export const OK = "#2f8f63";
export const OK_SOFT = "#e9f6ef";

/** Boxes, in one place, so every frame agrees about where things are. */
export const BOX = {
  vscode: { x: 100, y: 150, w: 440, h: 130 },
  terminal: { x: 100, y: 330, w: 210, h: 130 },
  localhost: { x: 330, y: 330, w: 210, h: 130 },
  github: { x: 720, y: 150, w: 320, h: 130 },
  vercel: { x: 720, y: 350, w: 320, h: 130 },
  users: { x: 720, y: 590, w: 320, h: 130 },
  supabase: { x: 1200, y: 150, w: 320, h: 330 },
};

export const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function text(x, y, value, { size = 18, weight = 400, fill = MUTED, anchor = "start" } = {}) {
  return `<text x="${x}" y="${y}" font-family="Inter" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}">${esc(value)}</text>`;
}

/** A card: rounded box, title, and up to three lines under it. */
export function card(id, box, title, lines, { tint = "white", border = LINE, accent = false } = {}) {
  const { x, y, w, h } = box;
  const body = lines
    .map((line, i) => text(x + 24, y + 82 + i * 26, line, { size: 16, fill: MUTED }))
    .join("\n    ");

  return `  <g id="${id}">
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16" fill="${tint}" stroke="${border}" stroke-width="2"/>
    ${text(x + 24, y + 48, title, { size: 22, weight: 600, fill: accent ? ACCENT : INK })}
    ${body}
  </g>`;
}

/** A straight arrow with a label above (or beside) it. */
export function arrow(
  id,
  from,
  to,
  label,
  {
    colour = FAINT,
    dashed = false,
    both = false,
    labelDx = 0,
    labelDy = -14,
    anchor = "middle",
  } = {},
) {
  const [x1, y1] = from;
  const [x2, y2] = to;
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const head = (px, py, a) =>
    `<path d="M${px} ${py} L${px - 14 * Math.cos(a - 0.4)} ${py - 14 * Math.sin(a - 0.4)} L${px - 14 * Math.cos(a + 0.4)} ${py - 14 * Math.sin(a + 0.4)} Z" fill="${colour}"/>`;

  return `  <g id="${id}">
    <path d="M${x1} ${y1} L${x2} ${y2}" stroke="${colour}" stroke-width="2.5"${dashed ? ' stroke-dasharray="8 7"' : ""}/>
    ${head(x2, y2, angle)}
    ${both ? head(x1, y1, angle + Math.PI) : ""}
    ${label ? text((x1 + x2) / 2 + labelDx, (y1 + y2) / 2 + labelDy, label, { size: 15, fill: colour === FAINT ? MUTED : colour, weight: 500, anchor }) : ""}
  </g>`;
}

/** An arrow that turns corners — used for the long way round to the database. */
export function elbow(
  id,
  points,
  label,
  { colour = FAINT, dashed = false, labelAt = 1, labelDy = -14 } = {},
) {
  const d = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x} ${y}`).join(" ");
  const [lx, ly] = points[points.length - 2];
  const [ex, ey] = points[points.length - 1];
  const angle = Math.atan2(ey - ly, ex - lx);
  const [tx, ty] = points[labelAt];

  return `  <g id="${id}">
    <path d="${d}" fill="none" stroke="${colour}" stroke-width="2.5"${dashed ? ' stroke-dasharray="8 7"' : ""} stroke-linejoin="round"/>
    <path d="M${ex} ${ey} L${ex - 14 * Math.cos(angle - 0.4)} ${ey - 14 * Math.sin(angle - 0.4)} L${ex - 14 * Math.cos(angle + 0.4)} ${ey - 14 * Math.sin(angle + 0.4)} Z" fill="${colour}"/>
    ${label ? text(tx + 20, ty + labelDy, label, { size: 15, fill: MUTED, weight: 500 }) : ""}
  </g>`;
}

/** A numbered bead, for the order things happen in. */
export function step(id, n, x, y) {
  return `  <g id="${id}">
    <circle cx="${x}" cy="${y}" r="17" fill="${ACCENT}"/>
    ${text(x, y + 6, String(n), { size: 17, weight: 600, fill: "#ffffff", anchor: "middle" })}
  </g>`;
}
