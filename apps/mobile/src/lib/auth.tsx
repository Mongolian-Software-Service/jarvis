import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import type { Role } from "@jarvis/core";
import { supabase, supabaseConfigured } from "./supabase";

/**
 * Who is signed in, for the whole app.
 *
 * The session comes from the keychain on launch and from
 * `onAuthStateChange` after that — never from state this app keeps itself. The
 * profile row is fetched alongside it because every screen that greets somebody
 * wants their name, and the role decides nothing here: what an account may do
 * is decided by RLS, on the server, every time.
 */

export type Profile = {
  id: string;
  email: string | null;
  fullName: string | null;
  role: Role;
  locale: string;
};

type AuthValue = {
  /** False until the keychain has been read. Guards the first redirect. */
  ready: boolean;
  session: Session | null;
  userId: string | null;
  profile: Profile | null;
  signIn: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signUp: (
    fullName: string,
    email: string,
    password: string,
  ) => Promise<{ ok: boolean; error?: string; confirm?: boolean }>;
  signOut: () => Promise<void>;
  reloadProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(!supabaseConfigured());
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const loadProfile = useCallback(async (userId: string | null) => {
    if (!userId) {
      setProfile(null);
      return;
    }
    const { data } = await supabase
      .from("profiles")
      .select("id, email, full_name, role, locale")
      .eq("id", userId)
      .maybeSingle();

    setProfile(
      data
        ? {
            id: data.id,
            email: data.email,
            fullName: data.full_name,
            role: data.role,
            locale: data.locale,
          }
        : // A verified session whose profile row is missing is still a session.
          // Treated as a student rather than as signed out.
          { id: userId, email: null, fullName: null, role: "student", locale: "mn" },
    );
  }, []);

  useEffect(() => {
    if (!supabaseConfigured()) return;

    let cancelled = false;

    supabase.auth.getSession().then(async ({ data }) => {
      if (cancelled) return;
      setSession(data.session);
      await loadProfile(data.session?.user.id ?? null);
      setReady(true);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      void loadProfile(next?.user.id ?? null);
    });

    return () => {
      cancelled = true;
      subscription.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const value = useMemo<AuthValue>(
    () => ({
      ready,
      session,
      userId: session?.user.id ?? null,
      profile,
      async signIn(email, password) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return error ? { ok: false, error: error.message } : { ok: true };
      },
      async signUp(fullName, email, password) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          // The profiles trigger reads `full_name` from here. The **role** never
          // travels this way — a user can write their own metadata.
          options: { data: { full_name: fullName } },
        });
        if (error) return { ok: false, error: error.message };
        return { ok: true, confirm: !data.session };
      },
      async signOut() {
        await supabase.auth.signOut();
      },
      async reloadProfile() {
        await loadProfile(session?.user.id ?? null);
      },
    }),
    [ready, session, profile, loadProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside <AuthProvider>");
  return value;
}
