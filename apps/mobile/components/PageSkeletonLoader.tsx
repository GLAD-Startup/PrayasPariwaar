import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

interface PageSkeletonLoaderProps {
  type?: "home" | "blogs" | "seva" | "generic";
}

export default function PageSkeletonLoader({ type = "home" }: PageSkeletonLoaderProps) {
  const shimmerAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 0.8,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0.3,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();

    return () => loop.stop();
  }, [shimmerAnim]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header bar skeleton */}
      <View style={styles.headerRow}>
        <Animated.View style={[styles.circleBtn, { opacity: shimmerAnim }]} />
        <View style={styles.headerTextCol}>
          <Animated.View style={[styles.badgeLine, { opacity: shimmerAnim }]} />
          <Animated.View style={[styles.titleLine, { opacity: shimmerAnim }]} />
        </View>
        <Animated.View style={[styles.circleBtn, { opacity: shimmerAnim }]} />
      </View>

      {/* Main content skeletons based on type */}
      {type === "home" && (
        <View style={styles.body}>
          {/* Hero banner card */}
          <Animated.View style={[styles.heroCard, { opacity: shimmerAnim }]} />

          {/* Quick actions row */}
          <View style={styles.actionsRow}>
            <Animated.View style={[styles.actionChip, { opacity: shimmerAnim }]} />
            <Animated.View style={[styles.actionChip, { opacity: shimmerAnim }]} />
            <Animated.View style={[styles.actionChip, { opacity: shimmerAnim }]} />
          </View>

          {/* Section header */}
          <Animated.View style={[styles.sectionHeading, { opacity: shimmerAnim }]} />

          {/* Card list */}
          <Animated.View style={[styles.feedCard, { opacity: shimmerAnim }]} />
          <Animated.View style={[styles.feedCard, { opacity: shimmerAnim }]} />
        </View>
      )}

      {type === "blogs" && (
        <View style={styles.body}>
          {/* Search bar */}
          <Animated.View style={[styles.searchBar, { opacity: shimmerAnim }]} />

          {/* Filter chips */}
          <View style={styles.chipsRow}>
            <Animated.View style={[styles.filterChip, { opacity: shimmerAnim }]} />
            <Animated.View style={[styles.filterChip, { opacity: shimmerAnim }]} />
            <Animated.View style={[styles.filterChip, { opacity: shimmerAnim }]} />
          </View>

          {/* Blog Cards */}
          <Animated.View style={[styles.blogCard, { opacity: shimmerAnim }]} />
          <Animated.View style={[styles.blogCard, { opacity: shimmerAnim }]} />
        </View>
      )}

      {type === "seva" && (
        <View style={styles.body}>
          {/* Tabs */}
          <Animated.View style={[styles.segmentedBar, { opacity: shimmerAnim }]} />

          {/* Filter chips */}
          <View style={styles.chipsRow}>
            <Animated.View style={[styles.filterChip, { opacity: shimmerAnim }]} />
            <Animated.View style={[styles.filterChip, { opacity: shimmerAnim }]} />
            <Animated.View style={[styles.filterChip, { opacity: shimmerAnim }]} />
          </View>

          {/* Project Cards */}
          <Animated.View style={[styles.projectCard, { opacity: shimmerAnim }]} />
          <Animated.View style={[styles.projectCard, { opacity: shimmerAnim }]} />
        </View>
      )}

      {type === "generic" && (
        <View style={styles.body}>
          <Animated.View style={[styles.heroCard, { opacity: shimmerAnim }]} />
          <Animated.View style={[styles.feedCard, { opacity: shimmerAnim }]} />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  circleBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#E2E8F0",
  },
  headerTextCol: {
    flex: 1,
    marginHorizontal: 12,
    gap: 6,
  },
  badgeLine: {
    width: 110,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#DCFCE7",
  },
  titleLine: {
    width: 160,
    height: 18,
    borderRadius: 6,
    backgroundColor: "#E2E8F0",
  },
  body: {
    padding: 16,
    gap: 16,
  },
  heroCard: {
    width: "100%",
    height: 185,
    borderRadius: 16,
    backgroundColor: "#E2E8F0",
  },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
  },
  actionChip: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
  },
  sectionHeading: {
    width: 140,
    height: 16,
    borderRadius: 6,
    backgroundColor: "#E2E8F0",
    marginTop: 6,
  },
  feedCard: {
    width: "100%",
    height: 90,
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  searchBar: {
    width: "100%",
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
  },
  chipsRow: {
    flexDirection: "row",
    gap: 8,
  },
  filterChip: {
    width: 80,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
  },
  blogCard: {
    width: "100%",
    height: 220,
    borderRadius: 16,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  segmentedBar: {
    width: "100%",
    height: 40,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
  },
  projectCard: {
    width: "100%",
    height: 260,
    borderRadius: 18,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
});
