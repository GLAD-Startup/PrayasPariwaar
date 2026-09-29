import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  StatusBar,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Shadows } from "../../lib/theme";
import { useAuth } from "../../lib/AuthContext";
import { getAuthUser } from "../../lib/secureStore";

const { width, height } = Dimensions.get("window");

// Responsive collage dimensions calibrated to stay 100% fixed on all device screen sizes
const COLLAGE_SIZE = Math.min(width - 56, height > 750 ? 280 : 230);
const QUADRANT_SIZE = (COLLAGE_SIZE - 8) / 2;
const CENTER_CIRCLE_SIZE = height > 750 ? 82 : 68;

export default function OnboardingScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace("/(tabs)/home");
      return;
    }

    getAuthUser()
      .then((user) => {
        if (user?.id) {
          router.replace("/(tabs)/home");
        }
      })
      .catch(() => {});
  }, [isAuthenticated, authLoading]);

  if (isAuthenticated) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
        translucent={Platform.OS === "android"}
      />

      <View style={styles.fixedContainer}>
        {/* Top Organization Emblem - Official Prayas Royal Blue Logo */}
        <View style={styles.brandHeader}>
          <Image
            source={require("../../assets/images/prayas-logo-blue.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.orgName}>PRAYAS</Text>

          {/* Subtitle with dark royal blue divider lines */}
          <View style={styles.taglineRow}>
            <View style={styles.blueLine} />
            <Text style={styles.taglineText}>A TRIAL TO MOVE AHEAD</Text>
            <View style={styles.blueLine} />
          </View>
        </View>

        {/* Center Visual: 5-Piece Humanitarian Work Collage */}
        <View style={styles.collageContainer}>
          <View style={[styles.collageGrid, { width: COLLAGE_SIZE, height: COLLAGE_SIZE }]}>
            {/* Top-Left: Free Education */}
            <View style={[styles.quadrant, styles.quadrantTL, { width: QUADRANT_SIZE, height: QUADRANT_SIZE }]}>
              <Image
                source={require("../../assets/images/hero-education-vrindavan.jpg")}
                style={styles.quadrantImage}
                resizeMode="cover"
              />
            </View>

            {/* Top-Right: Tree Plantation */}
            <View style={[styles.quadrant, styles.quadrantTR, { width: QUADRANT_SIZE, height: QUADRANT_SIZE }]}>
              <Image
                source={require("../../assets/images/vrindavan-plantation.jpg")}
                style={styles.quadrantImage}
                resizeMode="cover"
              />
            </View>

            {/* Bottom-Left: Blood Donation */}
            <View style={[styles.quadrant, styles.quadrantBL, { width: QUADRANT_SIZE, height: QUADRANT_SIZE }]}>
              <Image
                source={require("../../assets/images/medical-blood-seva.jpg")}
                style={styles.quadrantImage}
                resizeMode="cover"
              />
            </View>

            {/* Bottom-Right: Youth Skills */}
            <View style={[styles.quadrant, styles.quadrantBR, { width: QUADRANT_SIZE, height: QUADRANT_SIZE }]}>
              <Image
                source={require("../../assets/images/youth-skills-vrindavan.jpg")}
                style={styles.quadrantImage}
                resizeMode="cover"
              />
            </View>

            {/* Center Circular Badge: Jeev Jal Seva */}
            <View
              style={[
                styles.centerCircle,
                {
                  width: CENTER_CIRCLE_SIZE,
                  height: CENTER_CIRCLE_SIZE,
                  borderRadius: CENTER_CIRCLE_SIZE / 2,
                },
              ]}
            >
              <Image
                source={require("../../assets/onboarding/jeev_jal.jpg")}
                style={[
                  styles.centerImage,
                  {
                    width: CENTER_CIRCLE_SIZE - 6,
                    height: CENTER_CIRCLE_SIZE - 6,
                    borderRadius: (CENTER_CIRCLE_SIZE - 6) / 2,
                  },
                ]}
                resizeMode="cover"
              />
            </View>
          </View>
        </View>

        {/* Welcome Text Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome to Prayas</Text>
          <Text style={styles.welcomeDesc}>
            Serving humanity across free education, emergency blood dispatch, green afforestation & medical aid in Vrindavan.
          </Text>
          <View style={styles.mottoBadge}>
            <Text style={styles.mottoText}>18 Years of Dedicated Grassroots Seva</Text>
          </View>
        </View>

        {/* Bottom Actions Area (Fixed, No Explore App) */}
        <View style={styles.actionsContainer}>
          {/* Primary Get Started Button with Dark Royal Blue */}
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => router.push("/(auth)/signup" as any)}
            activeOpacity={0.88}
          >
            <Text style={styles.primaryBtnText}>Get Started</Text>
            <View style={styles.arrowCircle}>
              <Ionicons name="arrow-forward" size={15} color={Colors.bluePrimary} />
            </View>
          </TouchableOpacity>

          {/* Sign In Link */}
          <TouchableOpacity
            style={styles.signInRow}
            onPress={() => router.push("/(auth)/login" as any)}
            activeOpacity={0.7}
          >
            <Text style={styles.signInText}>
              Already have an account? <Text style={styles.signInBold}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  fixedContainer: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: height > 750 ? 16 : 8,
    paddingBottom: height > 750 ? 24 : 14,
    backgroundColor: "#FFFFFF",
  },
  brandHeader: {
    alignItems: "center",
  },
  logoImage: {
    width: height > 750 ? 66 : 54,
    height: height > 750 ? 66 : 54,
    marginBottom: 4,
  },
  orgName: {
    fontSize: height > 750 ? 22 : 19,
    fontWeight: "900",
    color: "#0F172A",
    letterSpacing: 2,
  },
  taglineRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
    gap: 8,
  },
  blueLine: {
    height: 1.5,
    width: 24,
    backgroundColor: Colors.bluePrimary,
    borderRadius: 2,
  },
  taglineText: {
    fontSize: 9.5,
    fontWeight: "800",
    color: Colors.bluePrimary,
    letterSpacing: 1.4,
  },
  collageContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 4,
  },
  collageGrid: {
    position: "relative",
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    padding: 3,
    shadowColor: Colors.bluePrimary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 6,
  },
  quadrant: {
    position: "absolute",
    overflow: "hidden",
  },
  quadrantTL: {
    top: 3,
    left: 3,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  quadrantTR: {
    top: 3,
    right: 3,
    borderTopRightRadius: 26,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  quadrantBL: {
    bottom: 3,
    left: 3,
    borderBottomLeftRadius: 26,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  quadrantBR: {
    bottom: 3,
    right: 3,
    borderBottomRightRadius: 26,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 8,
  },
  quadrantImage: {
    width: "100%",
    height: "100%",
  },
  centerCircle: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -(CENTER_CIRCLE_SIZE / 2) }, { translateY: -(CENTER_CIRCLE_SIZE / 2) }],
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3.5,
    borderColor: "#FFFFFF",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 10,
  },
  centerImage: {
    overflow: "hidden",
  },
  welcomeSection: {
    alignItems: "center",
    paddingHorizontal: 12,
  },
  welcomeTitle: {
    fontSize: height > 750 ? 21 : 18,
    fontWeight: "900",
    color: "#0F172A",
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  welcomeDesc: {
    fontSize: height > 750 ? 12.5 : 11.5,
    color: "#475569",
    textAlign: "center",
    lineHeight: height > 750 ? 18 : 16,
  },
  mottoBadge: {
    marginTop: 8,
    backgroundColor: Colors.blueSoft,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.blueBorder,
  },
  mottoText: {
    fontSize: 10.5,
    fontWeight: "800",
    color: Colors.bluePrimary,
    letterSpacing: 0.2,
  },
  actionsContainer: {
    width: "100%",
    alignItems: "center",
    gap: 12,
  },
  primaryBtn: {
    width: "100%",
    height: height > 750 ? 52 : 48,
    backgroundColor: Colors.bluePrimary,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.bluePrimary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.32,
    shadowRadius: 12,
    elevation: 5,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  arrowCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
  signInRow: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  signInText: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "600",
  },
  signInBold: {
    color: Colors.bluePrimary,
    fontWeight: "800",
  },
});
