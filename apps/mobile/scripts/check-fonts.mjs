#!/usr/bin/env node
/**
 * Does the font this app ships actually contain Mongolian?
 *
 * CLAUDE.md §4.2 says to verify rather than assume, and on the phone the risk
 * is different from the web's: there is no fallback chain to rescue a missing
 * glyph, and a font package can change what it subsets between releases. A
 * bundle without U+04E8 renders every ө as a blank box, on every screen.
 *
 * Reads the TrueType `cmap` directly — no dependency, and it answers the exact
 * question rather than a proxy for it.
 */
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

/** Every code point a font's cmap maps, from format 4 or 12 subtables. */
function codepoints(file) {
  const b = readFileSync(file);
  const tables = b.readUInt16BE(4);

  let cmap = 0;
  for (let i = 0; i < tables; i++) {
    const offset = 12 + i * 16;
    if (b.toString("ascii", offset, offset + 4) === "cmap") cmap = b.readUInt32BE(offset + 8);
  }
  if (!cmap) throw new Error(`no cmap table in ${file}`);

  let best = 0;
  const count = b.readUInt16BE(cmap + 2);
  for (let i = 0; i < count; i++) {
    const record = cmap + 4 + i * 8;
    const platform = b.readUInt16BE(record);
    const encoding = b.readUInt16BE(record + 2);
    if ((platform === 3 && (encoding === 1 || encoding === 10)) || platform === 0) {
      best = cmap + b.readUInt32BE(record + 4);
    }
  }
  if (!best) throw new Error(`no unicode cmap subtable in ${file}`);

  const found = new Set();
  const format = b.readUInt16BE(best);

  if (format === 4) {
    const segX2 = b.readUInt16BE(best + 6);
    const ends = best + 14;
    const starts = ends + segX2 + 2;
    for (let s = 0; s < segX2 / 2; s++) {
      const end = b.readUInt16BE(ends + s * 2);
      const start = b.readUInt16BE(starts + s * 2);
      for (let c = start; c <= end && c !== 0xffff; c++) found.add(c);
    }
  } else if (format === 12) {
    const groups = b.readUInt32BE(best + 12);
    for (let g = 0; g < groups; g++) {
      const offset = best + 16 + g * 12;
      const start = b.readUInt32BE(offset);
      const end = b.readUInt32BE(offset + 4);
      for (let c = start; c <= end; c++) found.add(c);
    }
  } else {
    throw new Error(`unsupported cmap format ${format} in ${file}`);
  }

  return found;
}

/* The two vowels that sit outside Google's `cyrillic` subset, plus one from
   inside it as a control: if А is missing too, the font has no Cyrillic at all
   and the diagnosis is different. */
const REQUIRED = [
  ["Ө", 0x04e8],
  ["ө", 0x04e9],
  ["Ү", 0x04ae],
  ["ү", 0x04af],
  ["А", 0x0410],
  ["а", 0x0430],
];

const interRoot = require.resolve("@expo-google-fonts/inter/package.json").replace(/package\.json$/, "");
const faces = [
  ["Inter Regular", `${interRoot}400Regular/Inter_400Regular.ttf`],
  ["Inter Medium", `${interRoot}500Medium/Inter_500Medium.ttf`],
  ["Inter SemiBold", `${interRoot}600SemiBold/Inter_600SemiBold.ttf`],
];

let failed = false;
for (const [name, file] of faces) {
  const found = codepoints(file);
  const missing = REQUIRED.filter(([, cp]) => !found.has(cp)).map(([glyph]) => glyph);
  if (missing.length) {
    failed = true;
    console.error(`✗ ${name} is missing: ${missing.join(" ")}`);
  } else {
    console.log(`✓ ${name} — Ө ө Ү ү present (${found.size} glyphs)`);
  }
}

if (failed) {
  console.error(
    "\nA face without those glyphs renders Mongolian as blank boxes on the phone.\n" +
      "Pin the font package back, or ship a face that carries cyrillic-ext.",
  );
  process.exit(1);
}
