import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { saveAuthSession, getAuthUser } from "../lib/secureStore";
import { registerForPushNotificationsAsync } from "../lib/notifications";
import { redeemGoogleAuthCode } from "../lib/googleAuth";
import { getApiBaseUrl } from "../lib/api";

export default function OAuthCallbackScreen() {
  const router = useRouter();
  const [statusMessage, setStatusMessage] = useState("Completing Google sign-in...");
  const params = useLocalSearchParams<{
    accessToken?: string;
    refreshToken?: string;
    user?: string;
    error?: string;
    code?: string;
    state?: string;
    id_token?: string;
    access_token?: string;
  }>();

  useEffect(() => {
    let isMounted = true;

    async function handleAuth() {
      // If user is already authenticated, directly enter the app
      const existingUser = await getAuthUser().catch(() => null);
      if (existingUser?.id) {
        if (isMounted) setStatusMessage("Sign-in successful! Entering app...");
        router.replace("/(tabs)/home");
        return;
      }

      if (params.error) {
        router.replace({
          pathname: "/(auth)/login",
          params: { oauthError: params.error },
        });
        return;
      }

      // Case 1: Direct tokens from backend redirect
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

        if (isMounted) setStatusMessage("Sign-in successful! Entering app...");
        router.replace("/(tabs)/home");
        return;
      }

      // Case 1b: Direct Google id_token / access_token returned
      if (params.id_token || params.access_token) {
        try {
          if (isMounted) setStatusMessage("Verifying Google token with Prayas server...");
          const authRes = await fetch(`${getApiBaseUrl()}/auth/google`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              idToken: params.id_token,
              accessToken: params.access_token,
            }),
          });

          const authData = await authRes.json().catch(() => null);
          if (authRes.ok && authData?.success && authData?.accessToken) {
            await saveAuthSession(authData.accessToken, authData.refreshToken, authData.user);
            if (authData.user?.id) {
              registerForPushNotificationsAsync(authData.user.id);
            }
            if (isMounted) setStatusMessage("Sign-in successful! Entering app...");
            router.replace("/(tabs)/home");
            return;
          }
        } catch (tokenErr) {
          console.warn("[OAuth Screen] Token exchange error:", tokenErr);
        }
      }

      // Case 2: Authorization code returned from Google / Expo Auth proxy
      if (params.code) {
        try {
          if (isMounted) setStatusMessage("Verifying credentials with Prayas server...");
          await redeemGoogleAuthCode(params.code, params.state);

          if (isMounted) setStatusMessage("Sign-in successful! Entering app...");
          router.replace("/(tabs)/home");
          return;
        } catch (err: any) {
          const user = await getAuthUser().catch(() => null);
          if (user?.id) {
            router.replace("/(tabs)/home");
            return;
          }
          console.error("[OAuth Screen] Authentication failed:", err);
          router.replace({
            pathname: "/(auth)/login",
            params: { oauthError: err?.message || "Failed to complete Google sign-in." },
          });
          return;
        }
      }

      // Neither tokens nor code found: check if already logged in
      if (existingUser?.id) {
        router.replace("/(tabs)/home");
      } else {
        router.replace("/(auth)/login");
      }
    }

    handleAuth();

    return () => {
      isMounted = false;
    };
  }, [params]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#166534" />
      <Text style={styles.text}>{statusMessage}</Text>
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
