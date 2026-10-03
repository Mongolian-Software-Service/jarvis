/**
 * Everything that is not a screen.
 *
 * The rule that keeps this package worth having: **no business logic in a
 * component.** What "finished" means, what a lesson body parses to, which tint
 * a topic wears — each is one decision, and it belongs here rather than inside
 * whichever component happened to need it first.
 *
 * This package began as the seam between the web and an Expo app. The app is
 * gone and the seam is still worth keeping: nothing in here may import from
 * `apps/*` or touch `window`, `document` or `next/*`, so the same code runs in
 * a browser, in a Node server, and in the plain-Node test runner that checks it
 * (`packages/core/test`). A rule that survived losing its original reason
 * usually had a second one.
 */
export * from "./locale";
export * from "./constants";
export * from "./roles";
export * from "./format";
export * from "./google-mark";
export * from "./courses";
export * from "./shapes";
export * from "./progress";
export * from "./payments";
export * from "./projects";
export * from "./chat";
export * from "./slug";
export * from "./markdown";
export * from "./code";
export * from "./schemas";
export * from "./strings";
