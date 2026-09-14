import { View } from "react-native";
import { router } from "expo-router";
import { SITE_NAME, space } from "@jarvis/core";
import { useSettings } from "@/lib/settings";
import { useAuth } from "@/lib/auth";
import { Button, Card, Divider, Screen, Txt } from "@/components/ui";

/**
 * Settings.
 *
 * No language row: the product speaks one language (CLAUDE.md §1). No theme
 * row either: it is dark, like the site (§4). What is left is who you are and
 * the way out.
 */
export default function AccountScreen() {
  const { t } = useSettings();
  const { profile, userId, signOut } = useAuth();

  return (
    <Screen>
      <Txt variant="display">{t.auth.account.title}</Txt>

      {userId ? (
        <Card>
          <Txt variant="small" tone="dim">
            {t.auth.account.firstName}
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

      {userId ? (
        <Button label={t.auth.account.signOut} variant="secondary" onPress={() => void signOut()} />
      ) : null}

      <Txt variant="micro" tone="dim">
        {SITE_NAME} · 0.1.0
      </Txt>
    </Screen>
  );
}
