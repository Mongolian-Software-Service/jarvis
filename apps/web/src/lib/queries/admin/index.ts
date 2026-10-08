import "server-only";

/**
 * The console's reads.
 *
 * Every one of these runs as the signed-in admin, so the policies are still
 * what decides what comes back — the service client appears nowhere in this
 * file. An admin who was demoted a second ago gets a demoted admin's answers.
 *
 * The aggregates are computed in JS off one read per table rather than in five
 * round trips. This is a small school; when it is not, these become a view.
 */

export * from "./overview";
export * from "./courses";
export * from "./lessons";
export * from "./people";
export * from "./payments";
export * from "./access";
export * from "./feedback";
export * from "./projects";
export * from "./chat";
