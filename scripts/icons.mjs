#!/usr/bin/env node
/**
 * The raster icons, rendered from `apps/web/src/app/icon.svg`.
 *
 *   pnpm icons
 *
 * The SVG is the icon. Three raster copies exist because three readers will not
 * take one, and each sat on a wrong answer until 2026-10-06:
 *
 * - **`favicon.ico`** (16, 32 and 48 px in one file). Browsers and crawlers ask
 *   for `/favicon.ico` before they have read any HTML. With no such file the
 *   request fell through to `app/[locale]` with "favicon.ico" as the locale,
 *   and the front page came back — 208 KB of HTML, status 200, where an icon
 *   should have been.
 * - **`icon1.png`** (192 px). Google's results draw a site's favicon from the
 *   home page's `<link rel="icon">` and ask for "a multiple of 48px square"; an
 *   SVG-only site showed Google's grey globe instead. 192 is 48 × 4.
 * - **`apple-icon.png`** (180 px). An iPhone's home screen. Full-bleed, with
 *   the SVG's rounded corners squared off: iOS rounds the corners itself, and
 *   the transparent corners of a pre-rounded tile come out black.
 *
 * Next.js serves all three from `app/` by file convention and writes the
 * `<link>` tags — nothing else needs to change when they are regenerated.
 *
 * `sharp` is not a dependency of this repository; it is the one Next.js already
 * installs for image optimisation, resolved from Next's own package so that the
 * version that renders here is the version that would render there.
 */
import { createRequire } from "node:module";
import { readFileSync, realpathSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { REPO_ROOT } from "./env.mjs";

const APP = join(REPO_ROOT, "apps/web/src/app");
/*
 * The *real* path of Next's package: `apps/web/node_modules/next` is a pnpm
 * symlink, and resolving from the link looks for `sharp` beside the link,
 * where it is not. From the store path it is a sibling, where pnpm put it.
 */
const fromNext = createRequire(
  realpathSync(join(REPO_ROOT, "apps/web/node_modules/next/package.json")),
);
const sharp = fromNext("sharp");

const svg = readFileSync(join(APP, "icon.svg"), "utf8");

/*
 * Refuse a comment XML would refuse.
 *
 * Two hyphens in a row are not allowed inside `<!-- … -->`, and librsvg — what
 * renders here — forgives them while strict parsers do not. The SVG's own
 * comment once named the accent token with its leading hyphens, every strict
 * reader rejected the file, and Google showed a grey globe for the site. So the
 * check is here, where rendering would otherwise succeed and say nothing.
 */
for (const [, body] of svg.matchAll(/<!--([\s\S]*?)-->/g)) {
  if (body.includes("--")) {
    console.error(
      "\n  ✗ icon.svg: a comment contains two hyphens in a row, which XML forbids.\n" +
        "    Strict parsers (and Google's favicon pipeline) reject the whole file.\n",
    );
    process.exit(1);
  }
}

/**
 * One square PNG at `size` px.
 *
 * Rendered at twice the size and scaled down, so the strokes are antialiased
 * the way a browser would draw the SVG rather than snapped to whole pixels.
 * `density` is the DPI librsvg rasterises at; the viewBox is 32 units wide.
 */
function png(source, size) {
  const density = Math.ceil(((72 * size) / 32) * 2);
  return sharp(Buffer.from(source), { density })
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toBuffer();
}

/**
 * An `.ico` holding PNG images, one per size.
 *
 * The format is a 6-byte header, a 16-byte entry per image (width, height,
 * colour count, planes, bits per pixel, byte length, offset) and then the
 * images. PNG payloads inside an ICO are valid since Windows Vista and are read
 * by every browser in use.
 */
function ico(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // 1 = icon
  header.writeUInt16LE(images.length, 4);

  let offset = 6 + 16 * images.length;
  const entries = images.map(({ size, data }) => {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt16LE(1, 4); // colour planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += data.length;
    return entry;
  });

  return Buffer.concat([header, ...entries, ...images.map((image) => image.data)]);
}

const sizes = [16, 32, 48];
const favicon = ico(
  await Promise.all(sizes.map(async (size) => ({ size, data: await png(svg, size) }))),
);
writeFileSync(join(APP, "favicon.ico"), favicon);

writeFileSync(join(APP, "icon1.png"), await png(svg, 192));

// Square corners for iOS, which masks the icon with its own rounded rectangle.
const fullBleed = svg.replace(/(<rect\b[^>]*?)\s+rx="[^"]*"/, "$1");
writeFileSync(join(APP, "apple-icon.png"), await png(fullBleed, 180));

console.log(
  `\n  apps/web/src/app/favicon.ico     ${sizes.join("/")} px, ${favicon.length} B` +
    "\n  apps/web/src/app/icon1.png       192 px" +
    "\n  apps/web/src/app/apple-icon.png  180 px\n",
);
