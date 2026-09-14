/**
 * What a database row becomes, and the one place it becomes it.
 *
 * The web reads through `@supabase/ssr` on a server and the phone reads through
 * `@supabase/supabase-js` on a device, but they ask for the same columns and
 * must produce the same objects — including the locale fallback, which is the
 * rule most easily got wrong twice in two different ways.
 *
 * So the column lists and the mappers live here, and each platform supplies
 * only its own client. A screen never holds a `title_mn`.
 */

export * from "./columns";
export * from "./types";
export * from "./course";
export * from "./lesson";
