import type { Enums } from "@jarvis/types";

export type Role = Enums<"user_role">;

export function isAdmin(role: Role | null | undefined): boolean {
  return role === "admin";
}

/**
 * Hiding a link is not authorisation.
 *
 * This helper decides what to *draw*. What an account may *do* is decided by
 * RLS in the database and re-checked in every server action — see
 * `lib/actions/guard.ts`. If those two ever disagree, the database wins and the
 * interface has a bug.
 */
export function canSeeAdmin(role: Role | null | undefined): boolean {
  return isAdmin(role);
}
