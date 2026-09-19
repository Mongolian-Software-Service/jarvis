import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import type { Session } from "@supabase/supabase-js";
import type { Role } from "@jarvis/core";
import { supabase, supabaseConfigured } from "./supabase";

/*
 * Closes the in-app browser tab if one was left open by a previous attempt.
 * Harmless on native; required on web, where the auth window is a real popup.
 */
void WebBrowser.maybeCompleteAuthSession();

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
  signInWithGoogle: () => Promise<{ ok: boolean; cancelled?: boolean }>;
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
      /**
       * Google, through the system browser.
       *
       * Not a WebView. `openAuthSessionAsync` opens SFSafariViewController on
       * iOS and a Custom Tab on Android — which is what Google requires, and
       * also what lets somebody already signed in on the device finish in one
       * tap instead of typing a password into an app's embedded browser.
       *
       * `Linking.createURL` is what makes this work in Expo Go *and* in a
       * standalone build: it returns `exp://…/--/auth/callback` in one and
       * `tsstark://auth/callback` in the other. Both have to be in the Supabase
       * project's redirect allowlist — see SETUP.md.
       *
       * On a **physical** device in Expo Go this resolves to the LAN IP, and
       * Supabase refuses any redirect whose host is an IP address — no
       * allowlist entry fixes it. The refusal is silent: it redirects to
       * `site_url` instead, so the phone shows Safari failing to reach
       * localhost. Use `--tunnel`, or a development build.
       */
      async signInWithGoogle() {
        const redirectTo = Linking.createURL("/auth/callback");

        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          // The browser is opened below rather than by the SDK, so that the
          // result comes back here instead of leaving the app for good.
          options: { redirectTo, skipBrowserRedirect: true },
        });
        if (error || !data.url) return { ok: false };

        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
        if (result.type !== "success") return { ok: false, cancelled: true };

        // `Linking.parse` rather than `new URL`: the redirect is an `exp://` or
        // `tsstark://` URL, and URL parsing of non-http schemes is not reliable.
        const code = Linking.parse(result.url).queryParams?.code;
        if (typeof code !== "string") return { ok: false };

        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        // `onAuthStateChange` above picks the session up; nothing to set here.
        return { ok: !exchangeError };
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
