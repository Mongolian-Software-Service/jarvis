import { useState } from "react";
import { View } from "react-native";
import { Link } from "expo-router";
import { fieldErrors, signInSchema, signUpSchema, space } from "@jarvis/core";
import { useIntl } from "@/lib/settings";
import { useAuth } from "@/lib/auth";
import { Button, Card, Field, Input, Txt } from "./ui";
import { GoogleButton, OrDivider } from "./google-button";

/**
 * One form for both doors.
 *
 * The schemas come from `@jarvis/core` — the same ones the web's server actions
 * parse with — so a password rule cannot be eight characters on one platform
 * and six on the other. The messages come from the string table for the same
 * reason.
 */
export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const { t } = useIntl();
  const { signIn, signUp } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);

  const copy = mode === "sign-in" ? t.auth.signIn : t.auth.signUp;

  async function submit() {
    setMessage(null);
    setErrors({});

    const parsed =
      mode === "sign-in"
        ? signInSchema(t.auth.validation).safeParse({ email, password })
        : signUpSchema(t.auth.validation).safeParse({ full_name: fullName, email, password });

    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }

    setBusy(true);
    const result =
      mode === "sign-in"
        ? await signIn(email.trim(), password)
        : await signUp(fullName.trim(), email.trim(), password);
    setBusy(false);

    if (!result.ok) {
      /*
       * Supabase answers "Invalid login credentials" for a wrong password and
       * for an address that never signed up — deliberately, so the form cannot
       * be used to discover which addresses exist. The copy keeps that.
       */
      const raw = (result.error ?? "").toLowerCase();
      setMessage(
        raw.includes("already")
          ? t.auth.errors.emailTaken
          : raw.includes("password") && mode === "sign-up"
            ? t.auth.errors.weakPassword
            : mode === "sign-in"
              ? t.auth.errors.invalidCredentials
              : t.auth.errors.unknown,
      );
      return;
    }

    // Sign-up with confirmation on returns a user and no session: the account
    // exists but cannot be used until the emailed link is followed.
    if (mode === "sign-up" && "confirm" in result && result.confirm) setConfirm(true);
  }

  if (confirm) {
    return (
      <Card style={{ gap: space.sm }}>
        <Txt variant="heading" center>
          {t.auth.signUp.checkEmail}
        </Txt>
        <Txt variant="small" tone="dim" center>
          {t.auth.signUp.checkEmailBody}
        </Txt>
      </Card>
    );
  }

  return (
    <View style={{ gap: space.lg }}>
      <View style={{ gap: space.xs }}>
        <Txt variant="title" center>
          {copy.title}
        </Txt>
        <Txt variant="small" tone="dim" center>
          {copy.deck}
        </Txt>
      </View>

      {/* Google first: one tap against three fields, and most people arriving
          here already have the account it would otherwise make. */}
      <View style={{ gap: space.lg }}>
        <GoogleButton />
        <OrDivider />
      </View>

      <Card style={{ gap: space.md }}>
        {mode === "sign-up" ? (
          <Field label={t.auth.signUp.firstName} error={errors.full_name}>
            <Input
              value={fullName}
              onChangeText={setFullName}
              placeholder={t.auth.signUp.firstNamePlaceholder}
              autoComplete="name"
              autoCapitalize="words"
            />
          </Field>
        ) : null}

        <Field label={copy.email} error={errors.email}>
          <Input
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            inputMode="email"
          />
        </Field>

        <Field
          label={copy.password}
          hint={mode === "sign-up" ? t.auth.signUp.passwordHint : undefined}
          error={errors.password}
        >
          <Input
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
          />
        </Field>

        {message ? (
          <Txt variant="small" tone="bad">
            {message}
          </Txt>
        ) : null}

        <Button label={busy ? copy.submitting : copy.submit} onPress={submit} busy={busy} full />
      </Card>

      <View style={{ flexDirection: "row", justifyContent: "center", gap: 6 }}>
        <Txt variant="small" tone="dim">
          {mode === "sign-in" ? t.auth.signIn.noAccount : t.auth.signUp.haveAccount}
        </Txt>
        <Link href={mode === "sign-in" ? "/sign-up" : "/sign-in"} replace>
          <Txt variant="small" tone="accent">
            {mode === "sign-in" ? t.auth.signIn.createOne : t.auth.signUp.signIn}
          </Txt>
        </Link>
      </View>
    </View>
  );
}
