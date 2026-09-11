export type { Database, Json } from "./database";

import type { Database } from "./database";

/** A table's row type: `Tables<"courses">`. */
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

/** What an insert accepts: `TablesInsert<"lessons">`. */
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

/** What an update accepts. */
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

/** A view's row type: `Views<"lesson_outline">`. */
export type Views<T extends keyof Database["public"]["Views"]> =
  Database["public"]["Views"][T]["Row"];

/** A database enum: `Enums<"lesson_kind">`. */
export type Enums<T extends keyof Database["public"]["Enums"]> = Database["public"]["Enums"][T];
