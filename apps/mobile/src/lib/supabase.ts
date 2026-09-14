import { createClient } from "@supabase/supabase-js";
import type { Database } from "@jarvis/types";
import { secureStorage } from "./storage";

/**
 * The phone's one Supabase client.
 *
 * Only `EXPO_PUBLIC_*` names reach a bundle, and anything in a bundle is
 * readable by anyone holding the app — so the publishable key is here and the
 * secret key is **not, ever**. RLS is what protects the data; the phone gets
 * exactly what a browser gets.
 *
 * `detectSessionInUrl` is off because there is no URL to detect one in: the
 * session lives in the keychain (see `storage.ts`), not in a redirect.
 */
const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const publishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

/*
 * A checkout with no `.env` still has to open.
 *
 * `createClient("", "")` throws at import time, which on a phone is a white
 * screen and a stack trace before any of our code runs. The placeholders keep
 * the module loading; `supabaseConfigured()` is what every screen asks, and the
 * requests that would fail are never made.
 */
export const supabase = createClient<Database>(
  url || "https://placeholder.supabase.co",
  publishableKey || "placeholder-key",
  {
    auth: {
      storage: secureStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);

/** A checkout with no `.env` still has to open and say something sensible. */
export function supabaseConfigured(): boolean {
  return Boolean(url && publishableKey);
}

/** The API this app calls for anything the database cannot decide alone. */
export const apiUrl = (process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3001").replace(
  /\/$/,
  "",
);
