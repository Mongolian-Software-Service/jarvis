import { useCallback, useState } from "react";
import { View } from "react-native";
import { space } from "@jarvis/core";
import { useIntl } from "@/lib/settings";
import { useAuth } from "@/lib/auth";
import { sendFeedback } from "@/lib/queries";
import { Button, Card, Field, Input, Txt } from "@/components/ui";

/**
 * The message box, for a signed-in student only.
 *
 * A guest's message would arrive with nobody attached to it — the name, phone
 * and email come from the account, not from the form — so they get the channels
 * above instead. The web makes the same call for the same reason.
 */
export function FeedbackBox() {
  const { t } = useIntl();
  const { userId } = useAuth();
  const copy = t.marketing.contact.feedback;

  const [body, setBody] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(async () => {
    if (!userId) return;
    setState("sending");
    setError(null);
    const result = await sendFeedback(userId, body, copy);
    if (result.ok) {
      setBody("");
      setState("sent");
    } else {
      setError(result.error === "" ? copy.failed : result.error);
      setState("idle");
    }
  }, [userId, body, copy]);

  if (!userId) return null;

  if (state === "sent") {
    return (
      <Card>
        <Txt variant="body">{copy.sent}</Txt>
        <View style={{ marginTop: space.sm, alignItems: "flex-start" }}>
          <Button label={copy.sendAnother} variant="secondary" onPress={() => setState("idle")} />
        </View>
      </Card>
    );
  }

  return (
    <Card>
      <Txt variant="heading">{copy.title}</Txt>
      <Txt variant="small" tone="dim">
        {copy.body}
      </Txt>
      <View style={{ marginTop: space.sm, gap: space.sm }}>
        <Field label={copy.label} error={error ?? undefined}>
          <Input
            value={body}
            onChangeText={setBody}
            placeholder={copy.placeholder}
            multiline
            numberOfLines={4}
            style={{ minHeight: 96, textAlignVertical: "top" }}
          />
        </Field>
        <View style={{ alignItems: "flex-start" }}>
          <Button
            label={state === "sending" ? copy.submitting : copy.submit}
            onPress={() => void submit()}
            disabled={state === "sending" || body.trim().length === 0}
          />
        </View>
      </View>
    </Card>
  );
}
