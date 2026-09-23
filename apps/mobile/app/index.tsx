import React, { useEffect, useState, useRef } from "react";
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Image,
  Text,
  Animated,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { getAuthUser } from "../lib/secureStore";
import { preloadAppAssets, hideSplashScreen } from "../lib/assetPreloader";

export default function EntryScreen() {
  const router = useRouter();
  const [loadingText, setLoadingText] = useState("Loading application...");
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Immediately hide native splash so this branded loading screen is visible
    hideSplashScreen();

    // Smooth fade-in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    // Gentle pulse animation for the logo card
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.03,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    ).start();

    let isMounted = true;

    async function initializeApp() {
      try {
        if (isMounted) setLoadingText("Loading application...");

        // Ensure a brief minimum display (650ms) so user gets smooth visual feedback
        const minDelay = new Promise((resolve) => setTimeout(resolve, 650));

        const [, user] = await Promise.allSettled([
          preloadAppAssets(),
          getAuthUser(),
          minDelay,
        ]);

        if (!isMounted) return;

        const authUser = user.status === "fulfilled" ? user.value : null;

        if (authUser && authUser.id) {
          router.replace("/(tabs)/home" as any);
        } else {
          router.replace("/(auth)/onboarding" as any);
        }
      } catch (e) {
        if (isMounted) {
          router.replace("/(auth)/onboarding" as any);
        }
      }
    }

    initializeApp();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        {/* Top Spacer */}
        <View style={styles.spacer} />

        {/* Brand Center Section */}
        <Animated.View style={[styles.logoCard, { transform: [{ scale: pulseAnim }] }]}>
          <Image
            source={require("../assets/images/prayas-logo-blue.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        <Text style={styles.appName}>PRAYAS</Text>
        <Text style={styles.appTagline}>A TRIAL TO MOVE AHEAD</Text>

        {/* Loader & Status Indicator */}
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#1E3A8A" />
          <View style={styles.statusBox}>
            <Text style={styles.loadingText}>{loadingText}</Text>
            <Text style={styles.subLoadingText}>Please wait a moment...</Text>
          </View>
        </View>

        {/* Bottom Spacer & Footer */}
        <View style={styles.spacer} />
        <View style={styles.footer}>
          <Text style={styles.footerText}>18 Years of Grassroots Seva</Text>
          <Text style={styles.footerSubText}>Vrindavan, Mathura (U.P.)</Text>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  spacer: {
    flex: 1,
  },
  logoCard: {
    width: 108,
    height: 108,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#1E3A8A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 16,
  },
  logo: {
    width: 88,
    height: 88,
  },
  appName: {
    fontSize: 24,
    fontWeight: "900",
    color: "#0F172A",
    letterSpacing: 1.5,
  },
  appTagline: {
    fontSize: 11,
    fontWeight: "800",
    color: "#1E3A8A",
    letterSpacing: 1.2,
    marginTop: 4,
    marginBottom: 28,
  },
  loaderContainer: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 90,
  },
  statusBox: {
    alignItems: "center",
    marginTop: 14,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E293B",
    letterSpacing: 0.2,
  },
  subLoadingText: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
  },
  footer: {
    alignItems: "center",
    paddingBottom: 12,
  },
  footerText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
    letterSpacing: 0.4,
  },
  footerSubText: {
    fontSize: 10,
    color: "#94A3B8",
    marginTop: 2,
  },
});
