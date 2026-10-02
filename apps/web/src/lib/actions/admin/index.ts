/**
 * Everything the team can change.
 *
 * Every action in this directory does the same four things in the same order:
 * re-check admin on the server, zod-parse the input, write through the
 * *request-scoped* client so RLS still applies, then revalidate. The service
 * client appears nowhere here — an admin action that bypassed RLS would be a
 * second, weaker copy of the rules.
 */

export * from "./courses";
export * from "./lessons";
export * from "./people";
export * from "./access";
export * from "./projects";
