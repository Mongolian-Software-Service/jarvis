import { View } from "react-native";
import { space } from "@jarvis/core";
import { Screen } from "@/components/ui";
import { AuthForm } from "@/components/auth-form";

export default function SignUpScreen() {
  return (
    <Screen>
      <View style={{ paddingTop: space.xxl }}>
        <AuthForm mode="sign-up" />
      </View>
    </Screen>
  );
}
