import React, { useEffect } from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { saveAuthSession } from "../lib/secureStore";
import { registerForPushNotificationsAsync } from "../lib/notifications";

export default function OAuthCallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    accessToken?: string;
    refreshToken?: string;
    user?: string;
    error?: string;
  }>();

  useEffect(() => {
    async function handleAuth() {
      if (params.error) {
        router.replace({
          pathname: "/(auth)/login",
          params: { oauthError: params.error },
        });
        return;
      }

      if (params.accessToken && params.refreshToken) {
        let user: any = null;
        if (params.user) {
          try {
            user = JSON.parse(decodeURIComponent(params.user));
          } catch {
            try {
              user = JSON.parse(params.user);
            } catch {
              user = null;
            }
          }
        }

        await saveAuthSession(params.accessToken, params.refreshToken, user);

        if (user?.id) {
          registerForPushNotificationsAsync(user.id);
        }

        router.replace("/(tabs)/home");
      } else {
        router.replace("/(auth)/login");
      }
    }

    handleAuth();
  }, [params]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#166534" />
      <Text style={styles.text}>Completing Google sign-in...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
  },
  text: {
    fontSize: 14,
    color: "#166534",
    fontWeight: "700",
  },
});
