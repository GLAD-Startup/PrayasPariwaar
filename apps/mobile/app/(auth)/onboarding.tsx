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
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors, Shadows } from "../../lib/theme";

const { width } = Dimensions.get("window");
const COLLAGE_SIZE = Math.min(width - 48, 300);
const QUADRANT_SIZE = (COLLAGE_SIZE - 10) / 2;
const CENTER_CIRCLE_SIZE = 86;

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
        {/* Top Organization Emblem - Official Prayas Blue Logo */}
        <View style={styles.brandHeader}>
          <Image
            source={require("../../assets/images/prayas-logo-blue.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.orgName}>PRAYAS</Text>

          {/* Subtitle with divider lines */}
          <View style={styles.taglineRow}>
            <View style={styles.blueLine} />
            <Text style={styles.taglineText}>A TRIAL TO MOVE AHEAD</Text>
            <View style={styles.blueLine} />
          </View>
        </View>

        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <View style={styles.welcomeTitleRow}>
            <Text style={styles.welcomeTitle}>Welcome to Prayas</Text>
            <Text style={styles.heartEmoji}>💙</Text>
          </View>
          <Text style={styles.welcomeDesc}>
            Serving humanity across education, emergency blood dispatch, green afforestation & medical aid in Vrindavan.
          </Text>
        </View>

        {/* 5-Piece Photo Collage */}
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

            {/* Bottom-Right: Vocational Seva */}
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

        {/* 5 Service Category Icon Circles */}
        <View style={styles.servicesRow}>
          {/* Free Education */}
          <View style={styles.serviceItem}>
            <View style={[styles.serviceCircle, { backgroundColor: "#EFF6FF", borderColor: "#BFDBFE" }]}>
              <Ionicons name="school-outline" size={18} color="#1D4ED8" />
            </View>
            <Text style={styles.serviceLabel}>Free{"\n"}Education</Text>
          </View>

          {/* Blood Donation */}
          <View style={styles.serviceItem}>
            <View style={[styles.serviceCircle, { backgroundColor: "#FEF2F2", borderColor: "#FECACA" }]}>
              <Ionicons name="water-outline" size={18} color="#DC2626" />
            </View>
            <Text style={styles.serviceLabel}>Blood{"\n"}Donation</Text>
          </View>

          {/* Plantation */}
          <View style={styles.serviceItem}>
            <View style={[styles.serviceCircle, { backgroundColor: "#F0FDF4", borderColor: "#BBF7D0" }]}>
              <MaterialCommunityIcons name="sprout-outline" size={18} color="#15803D" />
            </View>
            <Text style={styles.serviceLabel}>Tree{"\n"}Plantation</Text>
          </View>

          {/* Jeev Jal Seva */}
          <View style={styles.serviceItem}>
            <View style={[styles.serviceCircle, { backgroundColor: "#EFF6FF", borderColor: "#BFDBFE" }]}>
              <MaterialCommunityIcons name="bird" size={18} color="#2563EB" />
            </View>
            <Text style={styles.serviceLabel}>Jeev Jal{"\n"}Seva</Text>
          </View>

          {/* Vocational & Medical */}
          <View style={styles.serviceItem}>
            <View style={[styles.serviceCircle, { backgroundColor: "#FAF5FF", borderColor: "#E9D5FF" }]}>
              <Ionicons name="medkit-outline" size={18} color="#9333EA" />
            </View>
            <Text style={styles.serviceLabel}>Medical{"\n"}Aid</Text>
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
              <Ionicons name="arrow-forward" size={14} color="#1D4ED8" />
            </View>
          </TouchableOpacity>

          {/* Secondary Explore App Button */}
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => router.replace("/(tabs)/home" as any)}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons name="compass-outline" size={18} color="#1D4ED8" style={{ marginRight: 6 }} />
            <Text style={styles.secondaryBtnText}>Explore the App</Text>
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
    marginBottom: 8,
  },
  logoImage: {
    width: 64,
    height: 64,
    borderRadius: 14,
    marginBottom: 4,
  },
  orgName: {
    fontSize: 20,
    fontWeight: "900",
    color: "#1E3A8A",
    letterSpacing: 1.5,
    marginTop: 2,
  },
  taglineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 3,
  },
  blueLine: {
    width: 24,
    height: 1.5,
    backgroundColor: "#2563EB",
    opacity: 0.7,
  },
  taglineText: {
    fontSize: 10,
    color: "#1E40AF",
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  welcomeSection: {
    alignItems: "center",
    marginVertical: 8,
    paddingHorizontal: 16,
  },
  welcomeTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1D4ED8",
    letterSpacing: -0.2,
  },
  heartEmoji: {
    fontSize: 15,
  },
  welcomeDesc: {
    fontSize: 11,
    color: "#64748B",
    textAlign: "center",
    marginTop: 3,
    lineHeight: 16,
    maxWidth: 300,
  },
  collageContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 8,
  },
  collageGrid: {
    position: "relative",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignContent: "space-between",
  },
  quadrant: {
    overflow: "hidden",
    backgroundColor: "#F1F5F9",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    ...Shadows.soft,
  },
  quadrantTL: {
    borderTopLeftRadius: 28,
    borderBottomRightRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 8,
  },
  quadrantTR: {
    borderTopRightRadius: 28,
    borderBottomLeftRadius: 8,
    borderTopLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  quadrantBL: {
    borderBottomLeftRadius: 28,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    borderTopLeftRadius: 8,
  },
  quadrantBR: {
    borderBottomRightRadius: 28,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  quadrantImage: {
    width: "100%",
    height: "100%",
  },
  centerCircle: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -43 }, { translateY: -43 }],
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
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
    paddingHorizontal: 6,
    marginVertical: 10,
  },
  serviceItem: {
    alignItems: "center",
    flex: 1,
  },
  serviceCircle: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    marginBottom: 4,
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
    justifyContent: "center",
    gap: 8,
    marginVertical: 8,
  },
  mottoArrows: {
    fontSize: 11,
    color: "#1D4ED8",
    fontWeight: "800",
  },
  mottoText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#1E3A8A",
    letterSpacing: 0.3,
  },
  actionsContainer: {
    width: "100%",
    paddingHorizontal: 6,
    marginTop: 4,
    gap: 10,
  },
  primaryBtn: {
    backgroundColor: "#1D4ED8",
    height: 48,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.primaryBtn,
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: -0.2,
    marginRight: 8,
  },
  arrowCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtn: {
    height: 46,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#1D4ED8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.soft,
  },
  secondaryBtnText: {
    color: "#1D4ED8",
    fontSize: 13,
    fontWeight: "800",
  },
  signInRow: {
    alignItems: "center",
    paddingVertical: 6,
  },
  signInText: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
  signInBold: {
    color: "#1D4ED8",
    fontWeight: "800",
  },
});
