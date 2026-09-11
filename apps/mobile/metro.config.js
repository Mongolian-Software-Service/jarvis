/* eslint-env node */
const { getDefaultConfig } = require("expo/metro-config");
const path = require("node:path");

/**
 * Metro, taught about the workspace.
 *
 * Three lines, each fixing a different failure:
 *
 * - `watchFolders` — without the repo root, an edit to `packages/core` does not
 *   trigger a reload, and the bundler serves yesterday's copy of the shared code.
 * - `nodeModulesPaths` — pnpm installs a package's dependencies beside it, so a
 *   module required from `packages/core` is not under `apps/mobile/node_modules`.
 * `disableHierarchicalLookup` is deliberately **left off**, and that is the
 * pnpm-specific part. Every guide that turns it on is written for yarn or npm,
 * where walking up the tree finds the wrong copy of a package. pnpm's layout is
 * the opposite: a package's own dependencies live beside it under `.pnpm`, and
 * walking up from the importer is the only way to reach them. Turning it on
 * builds fine and then fails on a transitive import — `whatwg-fetch` from
 * `@expo/metro-runtime` was the first one to notice.
 */
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

module.exports = config;
