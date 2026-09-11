/**
 * Everything both platforms share.
 *
 * The rule that keeps this package worth having: **no business logic in a
 * component.** If the web and the phone would each need their own copy of a
 * decision — what "finished" means, what a lesson body parses to, which tint a
 * topic wears — it belongs here, where there is one copy of it.
 *
 * Nothing in here may import from `apps/*`, and nothing may touch `window`,
 * `document`, `next/*` or a React Native module: this code runs in a browser, in
 * a Node server, and on a phone.
 */
export * from "./locale";
export * from "./constants";
export * from "./roles";
export * from "./format";
export * from "./courses";
export * from "./shapes";
export * from "./theme";
export * from "./progress";
export * from "./payments";
export * from "./slug";
export * from "./markdown";
export * from "./code";
export * from "./schemas";
export * from "./strings";
