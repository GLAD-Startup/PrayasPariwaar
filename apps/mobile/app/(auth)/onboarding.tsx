import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  Image,
  StatusBar,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { Colors, Shadows } from "../../lib/theme";

const { width } = Dimensions.get("window");
const COLLAGE_SIZE = Math.min(width - 48, 320);
const QUADRANT_SIZE = (COLLAGE_SIZE - 10) / 2;
const CENTER_CIRCLE_SIZE = 92;

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
        translucent={Platform.OS === "android"}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: Math.max(insets.top > 0 ? 8 : 16, 12), paddingBottom: Math.max(insets.bottom, 20) + 10 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Organization Emblem */}
        <View style={styles.brandHeader}>
          <View style={styles.emblemWrapper}>
            <View style={styles.sunRays}>
              <Ionicons name="sunny-outline" size={32} color="#F59E0B" />
            </View>
            <View style={styles.emblemCircle}>
              <MaterialCommunityIcons name="hand-heart" size={26} color="#D97706" />
            </View>
          </View>

          <Text style={styles.orgName}>Prayas Pariwaar</Text>

          {/* Subtitle with divider lines */}
          <View style={styles.taglineRow}>
            <View style={styles.goldLine} />
            <Text style={styles.taglineText}>Seva Today, Better Tomorrow</Text>
            <View style={styles.goldLine} />
          </View>
        </View>

        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <View style={styles.welcomeTitleRow}>
            <Text style={styles.welcomeTitle}>Welcome!</Text>
            <Text style={styles.heartEmoji}>💛</Text>
          </View>
          <Text style={styles.welcomeDesc}>
            Together, we can build a stronger, healthier and compassionate society.
          </Text>
        </View>

        {/* 5-Piece Photo Collage */}
        <View style={styles.collageContainer}>
          <View style={[styles.collageGrid, { width: COLLAGE_SIZE, height: COLLAGE_SIZE }]}>
            {/* Top-Left: Free Education */}
            <View style={[styles.quadrant, styles.quadrantTL, { width: QUADRANT_SIZE, height: QUADRANT_SIZE }]}>
              <Image
                source={require("../../assets/onboarding/education.jpg")}
                style={styles.quadrantImage}
                resizeMode="cover"
              />
            </View>

            {/* Top-Right: Tree Plantation */}
            <View style={[styles.quadrant, styles.quadrantTR, { width: QUADRANT_SIZE, height: QUADRANT_SIZE }]}>
              <Image
                source={require("../../assets/onboarding/plantation.jpg")}
                style={styles.quadrantImage}
                resizeMode="cover"
              />
            </View>

            {/* Bottom-Left: Blood Donation */}
            <View style={[styles.quadrant, styles.quadrantBL, { width: QUADRANT_SIZE, height: QUADRANT_SIZE }]}>
              <Image
                source={require("../../assets/onboarding/blood.jpg")}
                style={styles.quadrantImage}
                resizeMode="cover"
              />
            </View>

            {/* Bottom-Right: Vocational Seva */}
            <View style={[styles.quadrant, styles.quadrantBR, { width: QUADRANT_SIZE, height: QUADRANT_SIZE }]}>
              <Image
                source={require("../../assets/onboarding/equipment.jpg")}
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
                    width: CENTER_CIRCLE_SIZE - 8,
                    height: CENTER_CIRCLE_SIZE - 8,
                    borderRadius: (CENTER_CIRCLE_SIZE - 8) / 2,
                  },
                ]}
                resizeMode="cover"
              />
            </View>
          </View>
        </View>

        {/* 5 Service Category Icon Circles */}
        <View style={styles.servicesRow}>
          {/* Free Education */}
          <View style={styles.serviceItem}>
            <View style={[styles.serviceCircle, { backgroundColor: "#F0FDF4", borderColor: "#BBF7D0" }]}>
              <Ionicons name="school-outline" size={20} color="#16A34A" />
            </View>
            <Text style={styles.serviceLabel}>Free{"\n"}Education</Text>
          </View>

          {/* Blood Donation */}
          <View style={styles.serviceItem}>
            <View style={[styles.serviceCircle, { backgroundColor: "#FEF2F2", borderColor: "#FECACA" }]}>
              <Ionicons name="water-outline" size={20} color="#DC2626" />
            </View>
            <Text style={styles.serviceLabel}>Blood{"\n"}Donation</Text>
          </View>

          {/* Plantation */}
          <View style={styles.serviceItem}>
            <View style={[styles.serviceCircle, { backgroundColor: "#F0FDF4", borderColor: "#BBF7D0" }]}>
              <MaterialCommunityIcons name="sprout-outline" size={20} color="#15803D" />
            </View>
            <Text style={styles.serviceLabel}>Tree{"\n"}Plantation</Text>
          </View>

          {/* Jeev Jal Seva */}
          <View style={styles.serviceItem}>
            <View style={[styles.serviceCircle, { backgroundColor: "#EFF6FF", borderColor: "#BFDBFE" }]}>
              <MaterialCommunityIcons name="bird" size={20} color="#2563EB" />
            </View>
            <Text style={styles.serviceLabel}>Jeev Jal{"\n"}Seva</Text>
          </View>

          {/* Vocational & Medical */}
          <View style={styles.serviceItem}>
            <View style={[styles.serviceCircle, { backgroundColor: "#FAF5FF", borderColor: "#E9D5FF" }]}>
              <Ionicons name="medkit-outline" size={20} color="#9333EA" />
            </View>
            <Text style={styles.serviceLabel}>Equipment{"\n"}Loan</Text>
          </View>
        </View>

        {/* Motto Banner */}
        <View style={styles.mottoRow}>
          <Text style={styles.mottoArrows}>❯❯</Text>
          <Text style={styles.mottoText}>Small Acts, Big Impact</Text>
          <Text style={styles.mottoArrows}>❮❮</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {/* Primary Get Started Button */}
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => router.push("/(auth)/signup" as any)}
            activeOpacity={0.88}
          >
            <Text style={styles.primaryBtnText}>Get Started</Text>
            <View style={styles.arrowCircle}>
              <Ionicons name="arrow-forward" size={14} color={Colors.primary} />
            </View>
          </TouchableOpacity>

          {/* Secondary Explore App Button */}
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => router.replace("/(tabs)/home" as any)}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons name="hand-heart-outline" size={18} color={Colors.primary} style={{ marginRight: 6 }} />
            <Text style={styles.secondaryBtnText}>Explore the App</Text>
          </TouchableOpacity>

          {/* Sign In Link */}
          <TouchableOpacity
            style={styles.signInRow}
            onPress={() => router.push("/(auth)/login" as any)}
          >
            <Text style={styles.signInText}>
              Already have an account? <Text style={styles.signInBold}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  brandHeader: {
    alignItems: "center",
    marginBottom: 12,
  },
  emblemWrapper: {
    position: "relative",
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  sunRays: {
    position: "absolute",
    opacity: 0.85,
  },
  emblemCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFBEB",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#FDE68A",
  },
  orgName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#164E2E",
    letterSpacing: -0.3,
    marginTop: 2,
  },
  taglineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  goldLine: {
    width: 24,
    height: 1,
    backgroundColor: "#D97706",
    opacity: 0.6,
  },
  taglineText: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  welcomeSection: {
    alignItems: "center",
    marginVertical: 10,
    paddingHorizontal: 16,
  },
  welcomeTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#15803D",
    fontStyle: "italic",
    letterSpacing: 0.2,
  },
  heartEmoji: {
    fontSize: 16,
  },
  welcomeDesc: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
    marginTop: 4,
    lineHeight: 18,
    maxWidth: 290,
  },
  collageContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 12,
  },
  collageGrid: {
    position: "relative",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignContent: "space-between",
  },
  quadrant: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#E2E8F0",
  },
  quadrantTL: {
    borderTopLeftRadius: 44,
  },
  quadrantTR: {
    borderTopRightRadius: 44,
  },
  quadrantBL: {
    borderBottomLeftRadius: 44,
  },
  quadrantBR: {
    borderBottomRightRadius: 44,
  },
  quadrantImage: {
    width: "100%",
    height: "100%",
  },
  centerCircle: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -CENTER_CIRCLE_SIZE / 2 }, { translateY: -CENTER_CIRCLE_SIZE / 2 }],
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "#FFFFFF",
    ...Shadows.card,
    zIndex: 10,
  },
  centerImage: {
    overflow: "hidden",
  },
  servicesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    maxWidth: 340,
    marginTop: 10,
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  serviceItem: {
    alignItems: "center",
    width: 60,
  },
  serviceCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    marginBottom: 6,
    ...Shadows.soft,
  },
  serviceLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: "#334155",
    textAlign: "center",
    lineHeight: 12,
  },
  mottoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  mottoArrows: {
    fontSize: 12,
    fontWeight: "800",
    color: "#166534",
  },
  mottoText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#166534",
    letterSpacing: 0.4,
  },
  actionsContainer: {
    width: "100%",
    maxWidth: 330,
    gap: 10,
    marginTop: 2,
  },
  primaryBtn: {
    height: 50,
    backgroundColor: "#1B432E",
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.primaryBtn,
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  arrowCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  secondaryBtn: {
    height: 48,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#1B432E",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.soft,
  },
  secondaryBtnText: {
    color: "#1B432E",
    fontSize: 14,
    fontWeight: "800",
  },
  signInRow: {
    alignItems: "center",
    paddingVertical: 6,
    marginTop: 2,
  },
  signInText: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
  signInBold: {
    color: "#1B432E",
    fontWeight: "800",
  },
});
