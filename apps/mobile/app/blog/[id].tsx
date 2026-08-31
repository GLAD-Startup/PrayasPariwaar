import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  StatusBar,
  Alert,
  Share,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors, Shadows } from "../../lib/theme";

const { width } = Dimensions.get("window");

interface BlogStoryDetail {
  id: string;
  category: string;
  categoryBg: string;
  categoryColor: string;
  title: string;
  summary: string;
  date: string;
  author: string;
  readTime: string;
  heroImage: any;
  photoCount: string;
  content: string[];
  highlights: { value: string; label: string; icon: string; iconType: "ionicons" | "material" }[];
  gallery: any[];
}

const BLOG_STORIES_MAP: Record<string, BlogStoryDetail> = {
  "learning-center-rohini": {
    id: "learning-center-rohini",
    category: "Education",
    categoryBg: "#F0FDF4",
    categoryColor: "#166534",
    title: "New Learning Center Inaugurated in Rohini",
    summary:
      "A new free education center has been inaugurated to support underprivileged children with quality learning.",
    date: "12 May 2024",
    author: "Prayas Pariwaar",
    readTime: "3 min read",
    heroImage: require("../../assets/onboarding/education.jpg"),
    photoCount: "1/8",
    content: [
      "We are happy to share that our new free education center in Rohini was successfully inaugurated on 12th May 2024. The center will provide quality education, study materials and a safe learning environment to children from underprivileged communities.",
      "This is a small step towards building a better tomorrow for our children. A heartfelt thank you to our volunteers, donors and well-wishers who made this possible.",
      "Together, let's continue to empower young minds and create a brighter future.",
    ],
    highlights: [
      { value: "120+", label: "Children Enrolled", icon: "people-outline", iconType: "ionicons" },
      { value: "6", label: "Classrooms", icon: "book-outline", iconType: "ionicons" },
      { value: "8", label: "Volunteer Teachers", icon: "school-outline", iconType: "ionicons" },
    ],
    gallery: [
      require("../../assets/onboarding/ribbon_cutting.jpg"),
      require("../../assets/onboarding/classroom.jpg"),
      require("../../assets/onboarding/education.jpg"),
      require("../../assets/onboarding/gallery_1.jpg"),
    ],
  },
  "blood-donation-city-hospital": {
    id: "blood-donation-city-hospital",
    category: "Blood Donation",
    categoryBg: "#FEF2F2",
    categoryColor: "#DC2626",
    title: "Successful Blood Donation Camp at City Hospital",
    summary:
      "We are grateful to all the voluntary donors who came forward and made the trauma emergency camp a huge success.",
    date: "10 May 2024",
    author: "Prayas Pariwaar",
    readTime: "2 min read",
    heroImage: require("../../assets/onboarding/blood.jpg"),
    photoCount: "1/6",
    content: [
      "Over 120 voluntary blood donors participated in our mega blood donation drive at City Hospital, collecting 85 units of critical blood groups.",
      "Every drop of donated blood was allocated to surgical patients, accident victims, and Thalassemia children in urgent need.",
      "We salute the selfless spirit of all our voluntary donors and medical staff who made this possible.",
    ],
    highlights: [
      { value: "85+", label: "Units Collected", icon: "water-outline", iconType: "ionicons" },
      { value: "120", label: "Donors Screened", icon: "people-outline", iconType: "ionicons" },
      { value: "100%", label: "Free Dispatch", icon: "shield-checkmark-outline", iconType: "ionicons" },
    ],
    gallery: [
      require("../../assets/onboarding/blood.jpg"),
      require("../../assets/onboarding/education.jpg"),
      require("../../assets/onboarding/gallery_1.jpg"),
      require("../../assets/onboarding/plantation.jpg"),
    ],
  },
  "tree-plantation-green-valley": {
    id: "tree-plantation-green-valley",
    category: "Plantation",
    categoryBg: "#F0FDF4",
    categoryColor: "#15803D",
    title: "Tree Plantation Drive at Green Valley Park",
    summary:
      "Together we planted more than 500 native saplings for a greener and healthier tomorrow.",
    date: "08 May 2024",
    author: "Harit Braj Team",
    readTime: "2 min read",
    heroImage: require("../../assets/onboarding/plantation.jpg"),
    photoCount: "1/5",
    content: [
      "Our Harit Braj taskforce planted 500 native Neem, Peepal, and Banyan saplings along the Green Valley corridor.",
      "Each sapling has been assigned a local volunteer caretaker and equipped with bio-degradable tree guards.",
      "Thank you to the 80 volunteers who joined this sacred green mission!",
    ],
    highlights: [
      { value: "500+", label: "Trees Planted", icon: "leaf-outline", iconType: "ionicons" },
      { value: "80", label: "Green Volunteers", icon: "people-outline", iconType: "ionicons" },
      { value: "100%", label: "Native Flora", icon: "sprout-outline", iconType: "material" },
    ],
    gallery: [
      require("../../assets/onboarding/plantation.jpg"),
      require("../../assets/onboarding/jeev_jal.jpg"),
      require("../../assets/onboarding/education.jpg"),
      require("../../assets/onboarding/classroom.jpg"),
    ],
  },
  "summer-water-bowls-birds": {
    id: "summer-water-bowls-birds",
    category: "Jeev Jal Seva",
    categoryBg: "#EFF6FF",
    categoryColor: "#1D4ED8",
    title: "Summer Water Bowls Initiative for Birds",
    summary:
      "Installed hundreds of water bowls across the city to help our feathered friends beat the summer heat.",
    date: "06 May 2024",
    author: "Jeev Seva Taskforce",
    readTime: "2 min read",
    heroImage: require("../../assets/onboarding/jeev_jal.jpg"),
    photoCount: "1/4",
    content: [
      "With scorching summer heat hitting 45°C in Mathura and Vrindavan, our team distributed over 400 terracotta earthen water bowls to households and temple courtyards.",
      "Volunteers ensure public bowls are cleaned and refilled daily with fresh water.",
      "Compassion towards all living beings is at the heart of our seva.",
    ],
    highlights: [
      { value: "400+", label: "Bowls Placed", icon: "water-outline", iconType: "ionicons" },
      { value: "60+", label: "Refill Points", icon: "refresh-outline", iconType: "ionicons" },
      { value: "100%", label: "Community Seva", icon: "heart-outline", iconType: "ionicons" },
    ],
    gallery: [
      require("../../assets/onboarding/jeev_jal.jpg"),
      require("../../assets/onboarding/plantation.jpg"),
      require("../../assets/onboarding/gallery_1.jpg"),
      require("../../assets/onboarding/education.jpg"),
    ],
  },
  "vocational-training-youth": {
    id: "vocational-training-youth",
    category: "Vocational Training",
    categoryBg: "#FAF5FF",
    categoryColor: "#7E22CE",
    title: "Vocational Training Program Empowers Youth",
    summary:
      "Our students are gaining skills and confidence to build a better future for themselves.",
    date: "04 May 2024",
    author: "Skill Development Wing",
    readTime: "3 min read",
    heroImage: require("../../assets/onboarding/equipment.jpg"),
    photoCount: "1/6",
    content: [
      "Our technical skills batch completed hands-on training in machine maintenance, electrical repair, and medical device servicing.",
      "Every graduate receives a recognized certification and starter toolkits to launch their independent career.",
      "Skill education empowers families and builds self-reliant communities.",
    ],
    highlights: [
      { value: "45", label: "Graduates Certified", icon: "school-outline", iconType: "ionicons" },
      { value: "100%", label: "Free Tools", icon: "gift-outline", iconType: "ionicons" },
      { value: "85%", label: "Job Placements", icon: "briefcase-outline", iconType: "ionicons" },
    ],
    gallery: [
      require("../../assets/onboarding/equipment.jpg"),
      require("../../assets/onboarding/education.jpg"),
      require("../../assets/onboarding/ribbon_cutting.jpg"),
      require("../../assets/onboarding/classroom.jpg"),
    ],
  },
};

export default function BlogDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const storyKey = typeof id === "string" && BLOG_STORIES_MAP[id] ? id : "learning-center-rohini";
  const story = BLOG_STORIES_MAP[storyKey];

  const [bookmarked, setBookmarked] = useState(false);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${story.title} - Read inspiring stories of change on Prayas Pariwaar.`,
      });
    } catch (error) {
      // ignore
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)/blogs"))}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={22} color="#164E2E" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Blog Details</Text>

        <View style={styles.headerRightActions}>
          <TouchableOpacity
            style={styles.headerActionBtn}
            onPress={() => {
              setBookmarked(!bookmarked);
              Alert.alert(bookmarked ? "Removed from Saved" : "Story Saved", "You can find this story in your profile.");
            }}
          >
            <Ionicons
              name={bookmarked ? "bookmark" : "bookmark-outline"}
              size={22}
              color={bookmarked ? "#166534" : "#164E2E"}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.headerActionBtn} onPress={handleShare}>
            <Ionicons name="share-social-outline" size={22} color="#164E2E" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Featured Hero Image with Less-Rounded Corners */}
        <View style={styles.heroImageWrapper}>
          <Image source={story.heroImage} style={styles.heroImage} resizeMode="cover" />
          <View style={styles.photoCountBadge}>
            <Ionicons name="images-outline" size={13} color="#FFFFFF" style={{ marginRight: 4 }} />
            <Text style={styles.photoCountText}>{story.photoCount}</Text>
          </View>
        </View>

        {/* Category Pill */}
        <View style={[styles.categoryPill, { backgroundColor: story.categoryBg }]}>
          <Text style={[styles.categoryPillText, { color: story.categoryColor }]}>
            {story.category}
          </Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>{story.title}</Text>

        {/* Summary */}
        <Text style={styles.summaryLead}>{story.summary}</Text>

        {/* Meta Row */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={13} color="#64748B" style={{ marginRight: 4 }} />
            <Text style={styles.metaText}>{story.date}</Text>
          </View>
          <Text style={styles.metaDivider}>|</Text>
          <View style={styles.metaItem}>
            <Ionicons name="person-outline" size={13} color="#64748B" style={{ marginRight: 4 }} />
            <Text style={styles.metaText}>{story.author}</Text>
          </View>
          <Text style={styles.metaDivider}>|</Text>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={13} color="#64748B" style={{ marginRight: 4 }} />
            <Text style={styles.metaText}>{story.readTime}</Text>
          </View>
        </View>

        {/* Article Body Content */}
        <View style={styles.articleBody}>
          {story.content.map((para, i) => (
            <Text key={i} style={styles.paragraph}>
              {para}
            </Text>
          ))}
        </View>

        {/* Highlights Box with Less Rounded Corners */}
        <View style={styles.highlightsCard}>
          <View style={styles.highlightsHeaderRow}>
            <Text style={styles.highlightsHeaderIcon}>🌿</Text>
            <Text style={styles.highlightsHeading}>Highlights</Text>
          </View>

          <View style={styles.highlightsGrid}>
            {story.highlights.map((hl, i) => (
              <View key={i} style={styles.highlightItem}>
                <View style={styles.hlIconCircle}>
                  <Ionicons name={hl.icon as any} size={18} color="#166534" />
                </View>
                <View>
                  <Text style={styles.hlValue}>{hl.value}</Text>
                  <Text style={styles.hlLabel}>{hl.label}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Photo Gallery */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>Photo Gallery</Text>
          <TouchableOpacity onPress={() => router.push("/gallery")}>
            <Text style={styles.viewAllText}>View All ›</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.galleryScroll}
        >
          {story.gallery.map((img, i) => (
            <View key={i} style={styles.galleryThumb}>
              <Image source={img} style={styles.galleryImage} resizeMode="cover" />
            </View>
          ))}
        </ScrollView>

        {/* Share This Story Section */}
        <View style={styles.shareSection}>
          <Text style={styles.shareTitle}>Share this story</Text>
          <View style={styles.socialButtonsRow}>
            {/* WhatsApp */}
            <TouchableOpacity style={[styles.socialShareBtn, { backgroundColor: "#25D366" }]} onPress={handleShare}>
              <FontAwesome name="whatsapp" size={20} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Facebook */}
            <TouchableOpacity style={[styles.socialShareBtn, { backgroundColor: "#1877F2" }]} onPress={handleShare}>
              <FontAwesome name="facebook" size={18} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Twitter */}
            <TouchableOpacity style={[styles.socialShareBtn, { backgroundColor: "#1DA1F2" }]} onPress={handleShare}>
              <FontAwesome name="twitter" size={18} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Email */}
            <TouchableOpacity style={[styles.socialShareBtn, { backgroundColor: "#166534" }]} onPress={handleShare}>
              <Ionicons name="mail" size={18} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Link */}
            <TouchableOpacity
              style={[styles.socialShareBtn, { backgroundColor: "#64748B" }]}
              onPress={() => Alert.alert("Link Copied", "Story link copied to clipboard.")}
            >
              <Ionicons name="link" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom CTA Card */}
        <View style={styles.bottomMissionCard}>
          <View style={styles.missionLeftCol}>
            <View style={styles.missionIconCircle}>
              <MaterialCommunityIcons name="hand-heart-outline" size={22} color="#166534" />
            </View>
            <View style={styles.missionTextCol}>
              <Text style={styles.missionTitle}>Be a part of this mission</Text>
              <Text style={styles.missionSubtitle}>
                Your support can help us educate more children.
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.donateNowBtn}
            onPress={() => router.push("/(tabs)/donate")}
            activeOpacity={0.88}
          >
            <Text style={styles.donateNowBtnText}>Donate Now</Text>
            <Ionicons name="arrow-forward" size={14} color="#FFFFFF" style={{ marginLeft: 4 }} />
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
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#164E2E",
    letterSpacing: -0.3,
  },
  headerRightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  headerActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 30,
  },
  heroImageWrapper: {
    height: 220,
    borderRadius: 14,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#F1F5F9",
    marginBottom: 14,
    ...Shadows.soft,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  photoCountBadge: {
    position: "absolute",
    bottom: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  photoCountText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  categoryPill: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  categoryPillText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#164E2E",
    letterSpacing: -0.3,
    lineHeight: 26,
    marginBottom: 6,
  },
  summaryLead: {
    fontSize: 13,
    color: "#475569",
    lineHeight: 19,
    marginBottom: 10,
    fontWeight: "500",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 14,
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaText: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
  },
  metaDivider: {
    color: "#CBD5E1",
    marginHorizontal: 8,
    fontSize: 11,
  },
  articleBody: {
    gap: 12,
    marginBottom: 18,
  },
  paragraph: {
    fontSize: 13,
    color: "#334155",
    lineHeight: 21,
  },
  highlightsCard: {
    backgroundColor: "#F0FDF4",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BBF7D0",
    padding: 14,
    marginBottom: 20,
  },
  highlightsHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  highlightsHeaderIcon: {
    fontSize: 14,
  },
  highlightsHeading: {
    fontSize: 14,
    fontWeight: "800",
    color: "#166534",
  },
  highlightsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  highlightItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  hlIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  hlValue: {
    fontSize: 13,
    fontWeight: "800",
    color: "#166534",
  },
  hlLabel: {
    fontSize: 9,
    color: "#64748B",
    fontWeight: "600",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#166534",
  },
  galleryScroll: {
    gap: 10,
    marginBottom: 22,
  },
  galleryThumb: {
    width: 105,
    height: 85,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#F1F5F9",
  },
  galleryImage: {
    width: "100%",
    height: "100%",
  },
  shareSection: {
    alignItems: "center",
    marginBottom: 20,
    paddingVertical: 10,
  },
  shareTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748B",
    marginBottom: 12,
  },
  socialButtonsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 14,
  },
  socialShareBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.soft,
  },
  bottomMissionCard: {
    backgroundColor: "#F8FAF9",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...Shadows.soft,
  },
  missionLeftCol: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  missionIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  missionTextCol: {
    flex: 1,
  },
  missionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#164E2E",
  },
  missionSubtitle: {
    fontSize: 10,
    color: "#64748B",
    marginTop: 2,
    lineHeight: 14,
  },
  donateNowBtn: {
    backgroundColor: "#166534",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    ...Shadows.soft,
  },
  donateNowBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
});
