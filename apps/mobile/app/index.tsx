import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet, Image } from "react-native";
import { useRouter } from "expo-router";
import { getAuthUser } from "../lib/secureStore";
import { preloadAppAssets, hideSplashScreen } from "../lib/assetPreloader";

export default function EntryScreen() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function initializeApp() {
      try {
        // Run asset warmup and user auth check concurrently
        const [, user] = await Promise.allSettled([
          preloadAppAssets(),
          getAuthUser(),
        ]);

        const authUser = user.status === "fulfilled" ? user.value : null;

        if (authUser && authUser.id) {
          router.replace("/(tabs)/home" as any);
        } else {
          router.replace("/(auth)/onboarding" as any);
        }
      } catch (e) {
        router.replace("/(auth)/onboarding" as any);
      } finally {
        setChecking(false);
        hideSplashScreen();
      }
    }

    initializeApp();
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/prayas-logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />
      <ActivityIndicator size="large" color="#166534" style={{ marginTop: 20 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 90,
    height: 90,
  },
});
