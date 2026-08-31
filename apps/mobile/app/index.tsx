import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { getAuthUser } from "../lib/secureStore";

export default function EntryScreen() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const user = await getAuthUser();
        if (user && user.id) {
          router.replace("/(tabs)/home" as any);
        } else {
          router.replace("/(auth)/onboarding" as any);
        }
      } catch (e) {
        router.replace("/(auth)/onboarding" as any);
      } finally {
        setChecking(false);
      }
    }

    checkAuth();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#166534" />
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
});
