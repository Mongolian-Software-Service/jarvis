/**
 * What a database row becomes, and the one place it becomes it.
 *
 * The catalogue, a course page, the dashboard, the trail and the admin console
 * all ask for the same columns, and all have to end up holding the same object
 * — including the locale fallback, which is the rule most easily got wrong
 * several times in several different ways.
 *
 * So the column lists and the mappers live here and the query supplies only the
 * client. A screen never holds a `title_mn`.
 */

export * from "./columns";
export * from "./types";
export * from "./course";
export * from "./lesson";
