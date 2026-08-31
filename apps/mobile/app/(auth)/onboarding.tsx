import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

interface Slide {
  id: string;
  badge: string;
  emoji: string;
  title: string;
  subtitle: string;
  color: string;
}

const ONBOARDING_SLIDES: Slide[] = [
  {
    id: "1",
    badge: "24/7 EMERGENCY LIFELINE",
    emoji: "🩸",
    title: "Voluntary Blood Donor Network",
    subtitle:
      "Instant voluntary blood donor coordination for critical surgeries, accident trauma, and Thalassemia patients in Mathura & Vrindavan hospitals.",
    color: "#DC2626",
  },
  {
    id: "2",
    badge: "JAN SWASTHYA SEVA",
    emoji: "🩺",
    title: "Free Medical Equipment Bank",
    subtitle:
      "Zero-cost home loans of 10L oxygen concentrators, wheelchairs, CPAP/BiPAP machines, and adjustable hospital beds for patients in need.",
    color: "#2E5339",
  },
  {
    id: "3",
    badge: "SHIKSHA & HARIT KRANTI",
    emoji: "🎓",
    title: "Project Aashayein & Rural Seva",
    subtitle:
      "Empowering underprivileged village children through evening tuition centers, school kits, and native tree planting drives along Braj Parikrama.",
    color: "#D97706",
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (currentIndex < ONBOARDING_SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      router.push("/(auth)/signup" as any);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />

      {/* Top Bar with Skip */}
      <View style={styles.topBar}>
        <View style={styles.brandRow}>
          <View style={styles.brandBadge}>
            <Text style={styles.brandIcon}>🌿</Text>
          </View>
          <View>
            <Text style={styles.brandName}>Prayas Pariwaar</Text>
            <Text style={styles.brandTag}>Vrindavan Nishkam Seva</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => router.replace("/(tabs)/home" as any)}
          style={styles.skipBtn}
        >
          <Text style={styles.skipBtnText}>Skip to App →</Text>
        </TouchableOpacity>
      </View>

      {/* Carousel */}
      <FlatList
        ref={flatListRef}
        data={ONBOARDING_SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <View style={[styles.illustrationCard, { borderColor: item.color + "30" }]}>
              <View style={[styles.emojiCircle, { backgroundColor: item.color + "15" }]}>
                <Text style={styles.emojiText}>{item.emoji}</Text>
              </View>
              <View style={[styles.badgeTag, { backgroundColor: item.color + "15" }]}>
                <Text style={[styles.badgeTagText, { color: item.color }]}>
                  {item.badge}
                </Text>
              </View>
            </View>

            <View style={styles.textContainer}>
              <Text style={styles.slideTitle}>{item.title}</Text>
              <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
            </View>
          </View>
        )}
        keyExtractor={(item) => item.id}
      />

      {/* Footer Controls */}
      <View style={styles.footer}>
        {/* Pagination Dots */}
        <View style={styles.dotsContainer}>
          {ONBOARDING_SLIDES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentIndex === index ? styles.activeDot : null,
              ]}
            />
          ))}
        </View>

        {/* Primary Action Button */}
        <TouchableOpacity style={styles.primaryBtn} onPress={handleNext}>
          <Text style={styles.primaryBtnText}>
            {currentIndex === ONBOARDING_SLIDES.length - 1
              ? "Join Prayas Community →"
              : "Continue →"}
          </Text>
        </TouchableOpacity>

        {/* Secondary Auth Links */}
        <View style={styles.authLinksRow}>
          <TouchableOpacity
            style={styles.authLink}
            onPress={() => router.push("/(auth)/login" as any)}
          >
            <Text style={styles.authLinkText}>
              Already registered? <Text style={styles.authLinkBold}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  brandBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#2E5339",
    alignItems: "center",
    justifyContent: "center",
  },
  brandIcon: {
    fontSize: 18,
  },
  brandName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1E293B",
  },
  brandTag: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
  },
  skipBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#E2E8F0",
  },
  skipBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
  },
  slide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  illustrationCard: {
    width: 220,
    height: 220,
    borderRadius: 40,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    marginBottom: 32,
  },
  emojiCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emojiText: {
    fontSize: 48,
  },
  badgeTag: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  badgeTagText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  textContainer: {
    alignItems: "center",
    paddingHorizontal: 10,
  },
  slideTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 28,
  },
  slideSubtitle: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 22,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 28,
    paddingTop: 12,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#CBD5E1",
  },
  activeDot: {
    width: 24,
    backgroundColor: "#2E5339",
  },
  primaryBtn: {
    height: 52,
    backgroundColor: "#2E5339",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2E5339",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  authLinksRow: {
    marginTop: 14,
    alignItems: "center",
  },
  authLink: {
    paddingVertical: 6,
  },
  authLinkText: {
    fontSize: 13,
    color: "#64748B",
  },
  authLinkBold: {
    color: "#2E5339",
    fontWeight: "800",
  },
});
