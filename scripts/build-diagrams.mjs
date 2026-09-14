#!/usr/bin/env node
/**
 * The system map, drawn once and revealed in five steps.
 *
 * Output is plain SVG that Figma imports as editable layers: real `<text>`
 * nodes (not paths), Inter — which Figma ships — and geometry described with
 * presentation attributes rather than a stylesheet, because Figma's importer
 * reads attributes reliably and CSS classes less so. Every box is wrapped in a
 * `<g id="…">`, and that id becomes the layer's name once imported.
 *
 * Five files rather than one, because the picture is for explaining: show the
 * laptop, then add GitHub, then the deploy, then the database, then the whole
 * thing. A finished map put on screen all at once is a wall.
 *
 * One layout, five frames — the coordinates live here exactly once, so the
 * boxes cannot drift between steps.
 *
 *   pnpm diagrams
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { FAINT, H, INK, W, text } from "./diagrams/canvas.mjs";
import { FRAMES } from "./diagrams/system.mjs";
import { SMALL, SMALL_H, SMALL_W } from "./diagrams/concepts.mjs";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const OUT = join(root, "docs/handbook/figma");

mkdirSync(OUT, { recursive: true });

for (const { file, heading, sub, body } of SMALL) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SMALL_W}" height="${SMALL_H + (file.endsWith("butets.svg") ? 30 : 0)}" viewBox="0 0 ${SMALL_W} ${SMALL_H + (file.endsWith("butets.svg") ? 30 : 0)}" fill="none">
  <rect width="${SMALL_W}" height="${SMALL_H + 30}" fill="#ffffff"/>
  <g id="garchig">
    ${text(80, 56, heading, { size: 28, weight: 600, fill: INK })}
    ${text(80, 84, sub, { size: 17, fill: FAINT })}
  </g>
${body.join("\n")}
</svg>
`;
  writeFileSync(join(OUT, file), svg);
  console.log(`  ${file}`);
}

for (const { file, parts } of FRAMES) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" fill="none">
  <rect width="${W}" height="${H}" fill="#ffffff"/>
${parts.join("\n")}
</svg>
`;
  writeFileSync(join(OUT, file), svg);
  console.log(`  ${file}`);
}

console.log(
  `✓ ${SMALL.length + FRAMES.length} SVG in docs/handbook/figma/ — drag them into Figma`,
);
