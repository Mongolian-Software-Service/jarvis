/**
 * The phone's reads.
 *
 * Same database, same policies, same columns as `apps/web/src/lib/queries` —
 * and the same row→shape mappers, imported from `@jarvis/core`, so a course
 * card is assembled once for both platforms. What differs is only the client:
 * the web's carries a cookie session and a React cache, this one carries a
 * keychain session and no cache.
 *
 * Nothing here decides what may be read. RLS does that, and the phone holds a
 * publishable key exactly like a browser does.
 */

export * from "./catalogue";
export * from "./mine";
export * from "./overview";
export * from "./lesson";
export * from "./writes";
