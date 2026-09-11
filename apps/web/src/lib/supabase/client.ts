"use client";
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@jarvis/types";

/**
 * The browser client, bound to the same cookies the server reads — so both
 * sides always agree on who is signed in.
 *
 * `createBrowserClient` returns the same instance for the same key on repeat
 * calls, so calling this from render is safe: a fresh client per render would
 * also mean a fresh auth listener per render.
 */
export function browserSupabase() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
  );
}
