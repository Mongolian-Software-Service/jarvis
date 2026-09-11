import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { PALETTE_TO_CSS, palette, type Palette } from "../src/theme.ts";

/**
 * One palette, in two languages.
 *
 * The web's colours have to be CSS custom properties, and the phone's have to
 * be values, because React Native cannot read a CSS variable. So the same
 * palette exists twice, and the only thing keeping the two honest is this file.
 *
 * A test reaching into a sibling app is unusual and deliberate: the alternative
 * is two palettes that agree on the day they are written and never again.
 */
const CSS = readFileSync(
  fileURLToPath(new URL("../../../apps/web/src/app/globals.css", import.meta.url)),
  "utf8",
);

/** The custom properties declared in one selector's block. */
function block(selector: string): Map<string, string> {
  const start = CSS.indexOf(`${selector} {`);
  assert.notEqual(start, -1, `no ${selector} block in globals.css`);
  const end = CSS.indexOf("\n}", start);
  const body = CSS.slice(start, end);

  const values = new Map<string, string>();
  for (const line of body.split("\n")) {
    const match = /^\s*(--[a-z0-9-]+):\s*([^;]+);/.exec(line);
    if (match?.[1] && match[2]) values.set(match[1], match[2].trim());
  }
  return values;
}

test("theme: the palette matches globals.css", () => {
  const declared = block(":root");
  const drift: string[] = [];

  for (const [key, property] of Object.entries(PALETTE_TO_CSS) as [keyof Palette, string][]) {
    const css = declared.get(property);
    if (css === undefined) {
      drift.push(`${property} is missing from :root`);
    } else if (css !== palette[key]) {
      drift.push(`${property}: css has ${css}, theme.ts has ${palette[key]}`);
    }
  }

  assert.deepEqual(drift, []);
});

test("theme: every palette key is mapped to a custom property", () => {
  assert.deepEqual(Object.keys(PALETTE_TO_CSS).sort(), Object.keys(palette).sort());
});

/**
 * There is one theme (CLAUDE.md §4). A second block of tokens creeping back in
 * is exactly the drift this file exists to catch — and it would be invisible,
 * because nothing renders it until something sets the attribute.
 */
test("theme: globals.css declares no second theme", () => {
  assert.equal(CSS.includes("data-theme"), false, "globals.css mentions data-theme");
  assert.equal(CSS.includes("prefers-color-scheme"), false, "globals.css has a light branch");
});
