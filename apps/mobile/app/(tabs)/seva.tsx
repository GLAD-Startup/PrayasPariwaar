import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors, Shadows } from "../../lib/theme";

const { width } = Dimensions.get("window");

export interface SevaStreamItem {
  id: string;
  number: string;
  title: string;
  color: string;
  description: string;
  tag: string;
  tagIcon: any;
  iconName: string;
  iconType: "ionicons" | "material";
  iconBg: string;
  iconBorder: string;
  iconColor: string;
  image: any;
}

export const SEVA_STREAMS_DATA: SevaStreamItem[] = [
  {
    id: "education",
    number: "1",
    title: "Free Education",
    color: "#164E2E",
    description: "Providing quality education to underprivileged children and building a better future.",
    tag: "Empowering Minds",
    tagIcon: "people",
    iconName: "school-outline",
    iconType: "ionicons",
    iconBg: "#F0FDF4",
    iconBorder: "#BBF7D0",
    iconColor: "#16A34A",
    image: require("../../assets/onboarding/education.jpg"),
  },
  {
    id: "blood-donation",
    number: "2",
    title: "Blood Donation",
    color: "#DC2626",
    description: "Organizing blood donation camps and saving lives through the gift of blood.",
    tag: "Donate Blood, Save Lives",
    tagIcon: "heart",
    iconName: "water-outline",
    iconType: "ionicons",
    iconBg: "#FEF2F2",
    iconBorder: "#FECACA",
    iconColor: "#DC2626",
    image: require("../../assets/onboarding/blood.jpg"),
  },
  {
    id: "plantation",
    number: "3",
    title: "Plantation",
    color: "#15803D",
    description: "Planting trees for a greener tomorrow and a healthier environment.",
    tag: "Plant Today, Protect Tomorrow",
    tagIcon: "leaf",
    iconName: "sprout-outline",
    iconType: "material",
    iconBg: "#F0FDF4",
    iconBorder: "#BBF7D0",
    iconColor: "#15803D",
    image: require("../../assets/onboarding/plantation.jpg"),
  },
  {
    id: "jeev-jal",
    number: "4",
    title: "Jeev Jal Seva",
    color: "#1D4ED8",
    description: "Providing water for animals and birds and serving the community with compassion.",
    tag: "Water is Life, Service is Duty",
    tagIcon: "water",
    iconName: "bird",
    iconType: "material",
    iconBg: "#EFF6FF",
    iconBorder: "#BFDBFE",
    iconColor: "#2563EB",
    image: require("../../assets/onboarding/jeev_jal.jpg"),
  },
  {
    id: "vocational",
    number: "5",
    title: "Vocational Training",
    color: "#7E22CE",
    description: "Equipping youth with skills and training to build self-reliance and a brighter future.",
    tag: "Skill Today, Success Tomorrow",
    tagIcon: "briefcase",
    iconName: "cog-outline",
    iconType: "material",
    iconBg: "#FAF5FF",
    iconBorder: "#E9D5FF",
    iconColor: "#9333EA",
    image: require("../../assets/onboarding/equipment.jpg"),
  },
];

export default function SevaStreamsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => router.replace("/(tabs)/home")}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={22} color="#164E2E" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Service Streams</Text>

        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => router.push("/(tabs)/volunteer")}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="hand-heart-outline" size={24} color="#164E2E" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Subtitle & Leaf Divider */}
        <View style={styles.subHeaderSection}>
          <Text style={styles.subTitle}>Five pillars of service. One mission.</Text>
          <View style={styles.leafDividerRow}>
            <View style={styles.leafLine} />
            <Text style={styles.leafIcon}>🌿</Text>
            <View style={styles.leafLine} />
          </View>
        </View>

        {/* 5 Pillar Cards */}
        <View style={styles.cardsList}>
          {SEVA_STREAMS_DATA.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              onPress={() => router.push(`/seva/${item.id}` as any)}
              activeOpacity={0.88}
            >
              {/* Left Column: Icon Badge + Content */}
              <View style={styles.cardLeftCol}>
                <View style={styles.cardIconAndTitleRow}>
                  {/* Left Circular Icon Badge */}
                  <View
                    style={[
                      styles.iconCircle,
                      { backgroundColor: item.iconBg, borderColor: item.iconBorder },
                    ]}
                  >
                    {item.iconType === "ionicons" ? (
                      <Ionicons name={item.iconName as any} size={24} color={item.iconColor} />
                    ) : (
                      <MaterialCommunityIcons name={item.iconName as any} size={24} color={item.iconColor} />
                    )}
                  </View>

                  <View style={styles.titleWrapper}>
                    <Text style={[styles.cardTitle, { color: item.color }]}>
                      {item.number}. {item.title}
                    </Text>
                  </View>
                </View>

                {/* Description */}
                <Text style={styles.cardDesc} numberOfLines={3}>
                  {item.description}
                </Text>

                {/* Bottom Motto Tag */}
                <View style={styles.tagRow}>
                  <Ionicons name={item.tagIcon as any} size={12} color={item.color} style={{ marginRight: 4 }} />
                  <Text style={[styles.tagText, { color: item.color }]}>{item.tag}</Text>
                </View>
              </View>

              {/* Right Column: Photo + Forward Arrow Overlay */}
              <View style={styles.cardRightCol}>
                <Image source={item.image} style={styles.cardImage} resizeMode="cover" />
                <View style={styles.arrowCircle}>
                  <Ionicons name="chevron-forward" size={16} color="#164E2E" />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Bottom Impact Banner */}
        <View style={styles.bottomBanner}>
          <View style={styles.bottomBannerLeft}>
            <Text style={styles.bottomBannerTitle}>Together, we create lasting change.</Text>
            <Text style={styles.bottomBannerSubtitle}>
              Choose a stream to know more and get involved.
            </Text>
          </View>
          <View style={styles.bottomBannerIconCircle}>
            <MaterialCommunityIcons name="account-group-outline" size={32} color="#166534" />
          </View>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#164E2E",
    letterSpacing: -0.3,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 30,
  },
  subHeaderSection: {
    alignItems: "center",
    marginBottom: 16,
  },
  subTitle: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
    textAlign: "center",
  },
  leafDividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
  },
  leafLine: {
    width: 30,
    height: 1,
    backgroundColor: "#CBD5E1",
  },
  leafIcon: {
    fontSize: 12,
  },
  cardsList: {
    gap: 14,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...Shadows.card,
  },
  cardLeftCol: {
    flex: 1,
    paddingRight: 10,
  },
  cardIconAndTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 6,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    ...Shadows.soft,
  },
  titleWrapper: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  cardDesc: {
    fontSize: 11,
    color: "#64748B",
    lineHeight: 16,
    marginBottom: 8,
  },
  tagRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  tagText: {
    fontSize: 10,
    fontWeight: "700",
  },
  cardRightCol: {
    width: 105,
    height: 105,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  arrowCircle: {
    position: "absolute",
    bottom: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.soft,
  },
  bottomBanner: {
    backgroundColor: "#F0FDF4",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#BBF7D0",
    padding: 16,
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bottomBannerLeft: {
    flex: 1,
    paddingRight: 10,
  },
  bottomBannerTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#166534",
    marginBottom: 2,
  },
  bottomBannerSubtitle: {
    fontSize: 11,
    color: "#64748B",
    lineHeight: 15,
  },
  bottomBannerIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
});
