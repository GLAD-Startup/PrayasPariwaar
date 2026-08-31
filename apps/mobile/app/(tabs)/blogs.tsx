import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  TextInput,
  StatusBar,
  Alert,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors, Shadows } from "../../lib/theme";
import { api, resolveImageUrl } from "../../lib/api";

const { width } = Dimensions.get("window");

export interface BlogPost {
  id: string;
  category: string;
  categoryBg: string;
  categoryColor: string;
  title: string;
  summary: string;
  date: string;
  readTime: string;
  image: any;
  author: string;
  streamId: string;
}

export const DEFAULT_BLOG_POSTS: BlogPost[] = [
  {
    id: "learning-center-rohini",
    category: "Education",
    categoryBg: "#F0FDF4",
    categoryColor: "#166534",
    title: "New Learning Center Inaugurated in Rohini",
    summary:
      "A new free education center has been inaugurated to support underprivileged children with quality learning and school kits.",
    date: "12 May 2024",
    readTime: "3 min read",
    image: require("../../assets/onboarding/education.jpg"),
    author: "Prayas Pariwaar",
    streamId: "education",
  },
  {
    id: "blood-donation-city-hospital",
    category: "Blood Donation",
    categoryBg: "#FEF2F2",
    categoryColor: "#DC2626",
    title: "Successful Blood Donation Camp at City Hospital",
    summary:
      "We are grateful to all the voluntary donors who came forward and made the emergency trauma camp a huge success.",
    date: "10 May 2024",
    readTime: "2 min read",
    image: require("../../assets/onboarding/blood.jpg"),
    author: "Prayas Pariwaar",
    streamId: "blood-donation",
  },
  {
    id: "tree-plantation-green-valley",
    category: "Plantation",
    categoryBg: "#F0FDF4",
    categoryColor: "#15803D",
    title: "Tree Plantation Drive at Green Valley Park",
    summary:
      "Together we planted more than 500 native saplings along the Parikrama Marg for a greener and healthier tomorrow.",
    date: "08 May 2024",
    readTime: "2 min read",
    image: require("../../assets/onboarding/plantation.jpg"),
    author: "Harit Braj Team",
    streamId: "plantation",
  },
  {
    id: "summer-water-bowls-birds",
    category: "Jeev Jal Seva",
    categoryBg: "#EFF6FF",
    categoryColor: "#1D4ED8",
    title: "Summer Water Bowls Initiative for Birds",
    summary:
      "Installed hundreds of terracotta water bowls across the city to help our feathered friends beat the intense summer heat.",
    date: "06 May 2024",
    readTime: "2 min read",
    image: require("../../assets/onboarding/jeev_jal.jpg"),
    author: "Jeev Seva Taskforce",
    streamId: "jeev-jal",
  },
  {
    id: "vocational-training-youth",
    category: "Vocational Training",
    categoryBg: "#FAF5FF",
    categoryColor: "#7E22CE",
    title: "Vocational Training Program Empowers Youth",
    summary:
      "Our students are gaining practical technical skills and self-reliance to build a prosperous future for their families.",
    date: "04 May 2024",
    readTime: "3 min read",
    image: require("../../assets/onboarding/equipment.jpg"),
    author: "Skill Development Wing",
    streamId: "vocational",
  },
];

const CATEGORY_TABS = [
  { id: "all", label: "All", icon: null, iconType: null },
  { id: "Education", label: "Education", icon: "book-outline", iconType: "ionicons" },
  { id: "Blood Donation", label: "Blood Donation", icon: "water-outline", iconType: "ionicons" },
  { id: "Plantation", label: "Plantation", icon: "sprout-outline", iconType: "material" },
  { id: "Jeev Jal Seva", label: "Jeev Jal Seva", icon: "bird", iconType: "material" },
  { id: "Vocational Training", label: "Vocational Training", icon: "cog-outline", iconType: "material" },
];

export default function BlogsScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [posts, setPosts] = useState<BlogPost[]>(DEFAULT_BLOG_POSTS);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const res = await api.get<any>("/posts");
      if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
        const livePosts = res.data.data;
        const mapped: BlogPost[] = livePosts.map((post: any) => {
          let cat = post.category || "Education";
          if (cat === "HEALTH") cat = "Blood Donation";
          else if (cat === "EDUCATION") cat = "Education";
          else if (cat === "PLANTATION") cat = "Plantation";
          else if (cat === "JEEV_JAL") cat = "Jeev Jal Seva";
          else if (cat === "VOCATIONAL") cat = "Vocational Training";

          return {
            id: post.id || post.slug,
            category: cat,
            categoryBg: cat === "Education" ? "#F0FDF4" : cat === "Blood Donation" ? "#FEF2F2" : "#F0FDF4",
            categoryColor: cat === "Education" ? "#166534" : cat === "Blood Donation" ? "#DC2626" : "#15803D",
            title: post.title,
            summary: post.excerpt || (post.content ? post.content.substring(0, 110) + "..." : "Field update from Prayas Pariwaar."),
            date: post.createdAt ? new Date(post.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Recent",
            readTime: post.readTime || "3 min read",
            image: resolveImageUrl(post.images?.[0]?.url || post.coverImage, require("../../assets/onboarding/education.jpg")),
            author: post.author?.name || "Prayas Pariwaar",
            streamId: post.category?.toLowerCase() || "education",
          };
        });
        setPosts(mapped);
      }
    } catch (e) {
      console.warn("Failed to load posts:", e);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPosts();
    setRefreshing(false);
  };

  const filteredPosts = posts.filter((post) => {
    const matchesCategory = selectedCategory === "all" || post.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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

        <Text style={styles.headerTitle}>Blogs & Stories</Text>

        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => setSearchOpen(!searchOpen)}
          activeOpacity={0.8}
        >
          <Ionicons name={searchOpen ? "close" : "search-outline"} size={22} color="#164E2E" />
        </TouchableOpacity>
      </View>

      {/* Optional Search Bar */}
      {searchOpen && (
        <View style={styles.searchBarWrapper}>
          <Ionicons name="search-outline" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search stories, campaigns, news..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          ) : null}
        </View>
      )}

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Subtitle */}
        <Text style={styles.subtitle}>Stories of compassion, impact, and seva across Braj.</Text>

        {/* Category Horizontal Filter Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterTabsScroll}
        >
          {CATEGORY_TABS.map((tab) => {
            const isActive = selectedCategory === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.filterTab, isActive && styles.filterTabActive]}
                onPress={() => setSelectedCategory(tab.id)}
                activeOpacity={0.8}
              >
                {tab.icon && (
                  <View style={{ marginRight: 6 }}>
                    {tab.iconType === "ionicons" ? (
                      <Ionicons
                        name={tab.icon as any}
                        size={15}
                        color={isActive ? "#FFFFFF" : "#166534"}
                      />
                    ) : (
                      <MaterialCommunityIcons
                        name={tab.icon as any}
                        size={15}
                        color={isActive ? "#FFFFFF" : "#166534"}
                      />
                    )}
                  </View>
                )}
                <Text style={[styles.filterTabText, isActive && styles.filterTabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Sort & Filter Controls Bar */}
        <View style={styles.controlsBar}>
          <TouchableOpacity
            style={styles.sortDropdown}
            onPress={() => Alert.alert("Sort Stories", "Showing latest stories first.")}
          >
            <Text style={styles.sortText}>Latest First ({filteredPosts.length})</Text>
            <Ionicons name="chevron-down" size={14} color="#64748B" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.filterBtn}
            onPress={() => Alert.alert("Filters", "Filter by date, category or location.")}
          >
            <Text style={styles.filterBtnText}>Filter</Text>
            <Ionicons name="options-outline" size={14} color="#166534" />
          </TouchableOpacity>
        </View>

        {/* Blog Cards List */}
        <View style={styles.postsList}>
          {filteredPosts.map((post) => (
            <TouchableOpacity
              key={post.id}
              style={styles.blogCard}
              onPress={() => router.push(`/blog/${post.id}` as any)}
              activeOpacity={0.88}
            >
              {/* Left Image Thumbnail */}
              <View style={styles.cardImageWrapper}>
                <Image
                  source={typeof post.image === "string" ? { uri: post.image } : post.image}
                  style={styles.cardImage}
                  resizeMode="cover"
                />
              </View>

              {/* Right Content */}
              <View style={styles.cardBody}>
                {/* Category Pill */}
                <View style={[styles.categoryPill, { backgroundColor: post.categoryBg }]}>
                  <Text style={[styles.categoryPillText, { color: post.categoryColor }]}>
                    {post.category}
                  </Text>
                </View>

                {/* Title */}
                <Text style={styles.cardTitle} numberOfLines={2}>
                  {post.title}
                </Text>

                {/* Summary */}
                <Text style={styles.cardSummary} numberOfLines={2}>
                  {post.summary}
                </Text>

                {/* Meta Row: Date & Read Time */}
                <View style={styles.cardMetaRow}>
                  <View style={styles.metaItem}>
                    <Ionicons name="calendar-outline" size={11} color="#94A3B8" style={{ marginRight: 3 }} />
                    <Text style={styles.metaText}>{post.date}</Text>
                  </View>
                  <Text style={styles.metaDot}>•</Text>
                  <View style={styles.metaItem}>
                    <Ionicons name="time-outline" size={11} color="#94A3B8" style={{ marginRight: 3 }} />
                    <Text style={styles.metaText}>{post.readTime}</Text>
                  </View>
                </View>
              </View>

              {/* Right Chevron */}
              <View style={styles.cardChevronWrapper}>
                <Ionicons name="chevron-forward" size={18} color="#166534" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Load More Blogs Button */}
        <TouchableOpacity
          style={styles.loadMoreBtn}
          onPress={() => Alert.alert("Latest Stories", "All current stories are loaded.")}
          activeOpacity={0.85}
        >
          <Ionicons name="refresh-outline" size={16} color="#166534" style={{ marginRight: 6 }} />
          <Text style={styles.loadMoreText}>Load More Blogs</Text>
        </TouchableOpacity>
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
    paddingVertical: 10,
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
  searchBarWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 10,
    paddingHorizontal: 14,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: "#0F172A",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 30,
  },
  subtitle: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 14,
  },
  filterTabsScroll: {
    gap: 8,
    paddingBottom: 6,
  },
  filterTab: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    ...Shadows.soft,
  },
  filterTabActive: {
    backgroundColor: "#166534",
    borderColor: "#166534",
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
  },
  filterTabTextActive: {
    color: "#FFFFFF",
  },
  controlsBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 14,
  },
  sortDropdown: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  sortText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
  },
  filterBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  filterBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#166534",
  },
  postsList: {
    gap: 12,
  },
  blogCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 10,
    alignItems: "center",
    ...Shadows.soft,
  },
  cardImageWrapper: {
    width: 100,
    height: 96,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#F1F5F9",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  cardBody: {
    flex: 1,
    paddingHorizontal: 10,
  },
  categoryPill: {
    alignSelf: "flex-start",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4,
  },
  categoryPillText: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
    lineHeight: 17,
    marginBottom: 3,
  },
  cardSummary: {
    fontSize: 11,
    color: "#64748B",
    lineHeight: 15,
    marginBottom: 5,
  },
  cardMetaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaText: {
    fontSize: 10,
    color: "#94A3B8",
    fontWeight: "600",
  },
  metaDot: {
    fontSize: 10,
    color: "#CBD5E1",
    marginHorizontal: 4,
  },
  cardChevronWrapper: {
    paddingLeft: 2,
    paddingRight: 4,
  },
  loadMoreBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 46,
    borderRadius: 12,
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    marginTop: 18,
  },
  loadMoreText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#166534",
  },
});
