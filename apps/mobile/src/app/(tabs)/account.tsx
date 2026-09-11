import { View } from "react-native";
import { router } from "expo-router";
import { LOCALES, LOCALE_NAMES, SITE_NAME, space, type Locale } from "@jarvis/core";
import { useSettings } from "@/lib/settings";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { Button, Card, Divider, Screen, Txt } from "@/components/ui";

/**
 * Settings, and the one preference this product has.
 *
 * Changing the language writes it to the profile as well as to the keychain, so
 * the web agrees on the next visit — one product, one preference, whichever
 * screen it was set on. There is no theme row: the app is dark, like the site
 * (CLAUDE.md §4).
 */
export default function AccountScreen() {
  const { locale, t, setLocale } = useSettings();
  const { profile, userId, signOut } = useAuth();

  async function chooseLocale(next: Locale) {
    setLocale(next);
    if (userId) await supabase.from("profiles").update({ locale: next }).eq("id", userId);
  }

  return (
    <Screen>
      <Txt variant="display">{t.auth.account.title}</Txt>

      {userId ? (
        <Card>
          <Txt variant="small" tone="dim">
            {t.auth.account.name}
          </Txt>
          <Txt variant="heading">{profile?.fullName ?? "—"}</Txt>
          <Divider />
          <Txt variant="small" tone="dim">
            {t.auth.account.email}
          </Txt>
          <Txt variant="body">{profile?.email ?? "—"}</Txt>
        </Card>
      ) : (
        <Card>
          <Txt variant="body">{t.auth.errors.signedOut}</Txt>
          <View style={{ flexDirection: "row", gap: space.sm, marginTop: space.sm }}>
            <Button label={t.nav.signIn} onPress={() => router.push("/sign-in")} />
            <Button
              label={t.nav.signUp}
              variant="secondary"
              onPress={() => router.push("/sign-up")}
            />
          </View>
        </Card>
      )}

      <Card>
        <Txt variant="small" tone="dim">
          {t.language.label}
        </Txt>
        <View style={{ flexDirection: "row", gap: space.sm }}>
          {LOCALES.map((code) => (
            <Button
              key={code}
              label={LOCALE_NAMES[code]}
              variant={code === locale ? "primary" : "secondary"}
              onPress={() => void chooseLocale(code)}
            />
          ))}
        </View>
      </Card>

      {userId ? (
        <Button label={t.auth.account.signOut} variant="secondary" onPress={() => void signOut()} />
      ) : null}

      <Txt variant="micro" tone="dim">
        {SITE_NAME} · 0.1.0
      </Txt>
    </Screen>
  );
}
