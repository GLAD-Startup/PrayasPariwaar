import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
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
  RefreshControl,
  ActivityIndicator,
  Animated,
  Easing,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors, Shadows } from "../../lib/theme";
import { api, resolveImageUrl, getImageUri } from "../../lib/api";
import { getCachedData, setCachedData } from "../../lib/cache";
import { prefetchRemoteImages } from "../../lib/assetPreloader";
import SidebarDrawer from "../../components/SidebarDrawer";
import PageSkeletonLoader from "../../components/PageSkeletonLoader";

const { width } = Dimensions.get("window");

export interface LiveBlogPost {
  id: string;
  slug: string;
  category: string;
  categoryBg: string;
  categoryColor: string;
  title: string;
  summary: string;
  content: string;
  date: string;
  readTime: string;
  coverImage: string | null;
  author: string;
  type: string;
  eventDate?: string | null;
  location?: string | null;
  images?: { id: string; url: string; caption?: string | null }[];
}

const CATEGORY_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  EDUCATION: { bg: "#EFF6FF", color: "#1D4ED8", label: "Education" },
  BLOOD: { bg: "#FEF2F2", color: "#DC2626", label: "Blood Donation" },
  PLANTATION: { bg: "#F0FDF4", color: "#166534", label: "Plantation" },
  HEALTH: { bg: "#F0F9FF", color: "#0284C7", label: "Health Camp" },
  EVENT: { bg: "#FAF5FF", color: "#7E22CE", label: "Event" },
  ACHIEVEMENT: { bg: "#FFFBEB", color: "#B45309", label: "Milestone" },
  NEWS: { bg: "#F8FAFC", color: "#334155", label: "Story" },
  GENERAL: { bg: "#EFF6FF", color: "#1D4ED8", label: "Seva News" },
};

function formatPost(item: any): LiveBlogPost {
  const typeKey = (item.type || "NEWS").toUpperCase();
  let matchedCategory = "NEWS";
  const titleLower = (item.title || "").toLowerCase();

  if (typeKey === "EVENT") matchedCategory = "EVENT";
  else if (typeKey === "ACHIEVEMENT") matchedCategory = "ACHIEVEMENT";
  else if (titleLower.includes("blood") || titleLower.includes("रक्तदान")) matchedCategory = "BLOOD";
  else if (titleLower.includes("plant") || titleLower.includes("वृक्षारोपण") || titleLower.includes("harit")) matchedCategory = "PLANTATION";
  else if (titleLower.includes("health") || titleLower.includes("camp") || titleLower.includes("स्वास्थ्य")) matchedCategory = "HEALTH";
  else if (titleLower.includes("education") || titleLower.includes("school") || titleLower.includes("aashayein") || titleLower.includes("शिक्षा")) matchedCategory = "EDUCATION";

  const catStyle = CATEGORY_STYLES[matchedCategory] || CATEGORY_STYLES.NEWS;

  // Compute reading time
  const wordCount = (item.content || "").split(/\s+/).length;
  const mins = Math.max(1, Math.ceil(wordCount / 180));
  const readTime = `${mins} min read`;

  // Format date
  const dateObj = new Date(item.publishedAt || item.createdAt || Date.now());
  const dateStr = dateObj.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  let authorName = "Prayas Pariwaar";
  if (typeof item.author === "string" && item.author.trim().length > 0) {
    authorName = item.author.trim();
  } else if (item.author && typeof item.author === "object" && item.author.name) {
    authorName = String(item.author.name).trim();
  }

  return {
    id: item.id,
    slug: item.slug || item.id,
    category: catStyle.label,
    categoryBg: catStyle.bg,
    categoryColor: catStyle.color,
    title: item.title || "Seva Initiative",
    summary: item.excerpt || (item.content ? String(item.content).substring(0, 140) + "..." : ""),
    content: item.content || "",
    date: dateStr,
    readTime,
    coverImage: item.coverImage || null,
    author: authorName,
    type: item.type || "NEWS",
    eventDate: item.eventDate,
    location: item.location,
    images: item.images || [],
  };
}

export default function BlogsScreen() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [posts, setPosts] = useState<LiveBlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("ALL");

  // Load from cache instantly, then fetch live from backend
  const loadPosts = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) {
        // Instant render from local cache
        const cached = await getCachedData<LiveBlogPost[]>("prayas_blog_posts");
        if (cached && Array.isArray(cached) && cached.length > 0) {
          setPosts(cached);
          setLoading(false);
        }
      }

      // Live fetch from backend API
      const res = await api.get<any>("/posts");
      if (res.data?.success && Array.isArray(res.data.data)) {
        const livePosts = res.data.data.map(formatPost);

        // Extract and prefetch remote images so everything appears at once
        const imageUrls: string[] = [];
        livePosts.forEach((p: LiveBlogPost) => {
          const coverUri = getImageUri(p.coverImage);
          if (coverUri) {
            imageUrls.push(coverUri);
          }
          if (Array.isArray(p.images)) {
            p.images.forEach((img) => {
              const imgUri = getImageUri(img?.url);
              if (imgUri) {
                imageUrls.push(imgUri);
              }
            });
          }
        });

        if (imageUrls.length > 0) {
          await prefetchRemoteImages(imageUrls);
        }

        setPosts(livePosts);
        await setCachedData("prayas_blog_posts", livePosts);
      }
    } catch (e) {
      console.log("[Blogs Fetch Notice]", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const spinValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;
  const spinLoopRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (refreshing) {
      spinValue.setValue(0);
      spinLoopRef.current = Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 750,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      spinLoopRef.current.start();
    } else {
      if (spinLoopRef.current) {
        spinLoopRef.current.stop();
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 250,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }).start(() => spinValue.setValue(0));
      }
    }
  }, [refreshing]);

  const handleManualRefresh = () => {
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.88,
        duration: 90,
        useNativeDriver: true,
      }),
      Animated.spring(scaleValue, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    if (!refreshing) {
      setRefreshing(true);
      loadPosts(true);
    }
  };

  const spinInterpolation = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const onRefresh = () => {
    setRefreshing(true);
    loadPosts(true);
  };

  const filterTabs = [
    { id: "ALL", label: `All (${posts.length})` },
    { id: "EDUCATION", label: "🎓 Education" },
    { id: "BLOOD", label: "🩸 Blood Seva" },
    { id: "PLANTATION", label: "🌱 Plantation" },
    { id: "HEALTH", label: "🩺 Health Camps" },
    { id: "ACHIEVEMENT", label: "🏆 Milestones" },
  ];

  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      // Category filter
      if (selectedFilter !== "ALL") {
        const matchesCategory =
          (selectedFilter === "EDUCATION" && (p.category.includes("Education") || p.title.toLowerCase().includes("education") || p.title.toLowerCase().includes("learning"))) ||
          (selectedFilter === "BLOOD" && (p.category.includes("Blood") || p.title.toLowerCase().includes("blood"))) ||
          (selectedFilter === "PLANTATION" && (p.category.includes("Plantation") || p.title.toLowerCase().includes("plant") || p.title.toLowerCase().includes("harit"))) ||
          (selectedFilter === "HEALTH" && (p.category.includes("Health") || p.title.toLowerCase().includes("health") || p.title.toLowerCase().includes("camp"))) ||
          (selectedFilter === "ACHIEVEMENT" && (p.type === "ACHIEVEMENT" || p.category.includes("Milestone")));
        if (!matchesCategory) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          p.title.toLowerCase().includes(q) ||
          p.summary.toLowerCase().includes(q) ||
          p.author.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [posts, selectedFilter, searchQuery]);

  if (loading && posts.length === 0) {
    return <PageSkeletonLoader type="blogs" />;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerMenuBtn}
          onPress={() => setSidebarOpen(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="menu" size={24} color="#1E293B" />
        </TouchableOpacity>

        <View style={styles.headerTitleCol}>
          <View style={styles.headerBadgeRow}>
            <View style={styles.livePulseDot} />
            <Text style={styles.headerBadgeText}>LIVE STORIES & DISPATCHES</Text>
          </View>
          <Text style={styles.headerTitle}>Stories & Blogs</Text>
        </View>

        {/* Animated Refresh Button */}
        <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
          <TouchableOpacity
            style={[
              styles.refreshIconBtn,
              refreshing && styles.refreshIconBtnActive,
            ]}
            onPress={handleManualRefresh}
            activeOpacity={0.75}
          >
            <Animated.View style={{ transform: [{ rotate: spinInterpolation }] }}>
              <Ionicons
                name="reload"
                size={18}
                color={refreshing ? "#16A34A" : "#334155"}
              />
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Search Input Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search seva stories, medical drives, camps..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={18} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Filter Chips */}
      <View style={styles.filterBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {filterTabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.filterChip,
                selectedFilter === tab.id && styles.filterChipActive,
              ]}
              onPress={() => setSelectedFilter(tab.id)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedFilter === tab.id && styles.filterChipTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Main Content List with Slide-Down Pull-to-Refresh */}
      {loading && posts.length === 0 ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingStateText}>Loading latest stories...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
              title="Pull down to refresh stories"
              titleColor="#64748B"
            />
          }
        >
          {filteredPosts.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="newspaper-outline" size={36} color={Colors.primary} />
              </View>
              <Text style={styles.emptyTitle}>No Stories Found</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery
                  ? `No stories matched "${searchQuery}". Try a different search term.`
                  : "No published posts in this category yet. Pull down to refresh."}
              </Text>
              {searchQuery ? (
                <TouchableOpacity
                  style={styles.clearSearchBtn}
                  onPress={() => setSearchQuery("")}
                >
                  <Text style={styles.clearSearchBtnText}>Clear Search Filter</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : (
            <View style={styles.postsList}>
              {filteredPosts.map((post) => (
                <TouchableOpacity
                  key={post.id}
                  style={styles.postCard}
                  onPress={() => router.push(`/blog/${post.slug || post.id}` as any)}
                  activeOpacity={0.88}
                >
                  {/* Post Image Banner */}
                  <View style={styles.imageWrap}>
                    {post.coverImage ? (
                      <Image
                        source={resolveImageUrl(post.coverImage)}
                        style={styles.postImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.fallbackImageBanner}>
                        <Ionicons name="sparkles" size={32} color="#1D4ED8" />
                        <Text style={styles.fallbackImageText}>Prayas Seva Report</Text>
                      </View>
                    )}

                    {/* Category Overlay Badge */}
                    <View
                      style={[
                        styles.categoryOverlayBadge,
                        { backgroundColor: post.categoryBg },
                      ]}
                    >
                      <Text
                        style={[
                          styles.categoryOverlayText,
                          { color: post.categoryColor },
                        ]}
                      >
                        {post.category}
                      </Text>
                    </View>
                  </View>

                  {/* Card Details */}
                  <View style={styles.postContent}>
                    {/* Meta Row: Date & Reading Time */}
                    <View style={styles.metaRow}>
                      <View style={styles.metaItem}>
                        <Ionicons name="calendar-outline" size={12} color="#94A3B8" style={{ marginRight: 4 }} />
                        <Text style={styles.metaText}>{post.date}</Text>
                      </View>
                      <View style={styles.metaDot} />
                      <View style={styles.metaItem}>
                        <Ionicons name="time-outline" size={12} color="#94A3B8" style={{ marginRight: 4 }} />
                        <Text style={styles.metaText}>{post.readTime}</Text>
                      </View>
                    </View>

                    {/* Title */}
                    <Text style={styles.postTitle} numberOfLines={2}>
                      {post.title}
                    </Text>

                    {/* Excerpt Summary */}
                    <Text style={styles.postSummary} numberOfLines={2}>
                      {post.summary}
                    </Text>

                    {/* Footer Row: Author & Read More Link */}
                    <View style={styles.cardFooter}>
                      <View style={styles.authorCol}>
                        <View style={styles.authorAvatar}>
                          <Text style={styles.authorAvatarText}>
                            {String(post.author || "P").charAt(0).toUpperCase()}
                          </Text>
                        </View>
                        <Text style={styles.authorName} numberOfLines={1}>
                          {typeof post.author === "string" ? post.author : "Prayas Pariwaar"}
                        </Text>
                      </View>

                      <View style={styles.readMoreLink}>
                        <Text style={styles.readMoreText}>Read Story</Text>
                        <Ionicons name="arrow-forward" size={13} color={Colors.primary} />
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      )}

      {/* Navigation Sidebar Drawer */}
      <SidebarDrawer isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
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
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  headerMenuBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginRight: 12,
  },
  headerTitleCol: {
    flex: 1,
    justifyContent: "center",
  },
  headerBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#16A34A",
    marginRight: 6,
  },
  headerBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#16A34A",
    letterSpacing: 0.6,
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.4,
  },
  refreshIconBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.soft,
  },
  refreshIconBtnActive: {
    backgroundColor: "#F0FDF4",
    borderColor: "#BBF7D0",
  },

  /* Search Bar */
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: "#0F172A",
    padding: 0,
  },

  /* Filters */
  filterBar: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    paddingBottom: 10,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
  },
  filterChipTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  /* List & Cards */
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 36,
  },
  postsList: {
    gap: 14,
  },
  postCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
    ...Shadows.card,
  },
  imageWrap: {
    width: "100%",
    height: 170,
    backgroundColor: "#EFF6FF",
    position: "relative",
  },
  postImage: {
    width: "100%",
    height: "100%",
  },
  fallbackImageBanner: {
    width: "100%",
    height: "100%",
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  fallbackImageText: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "700",
    color: "#1D4ED8",
  },
  categoryOverlayBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.7)",
  },
  categoryOverlayText: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },

  /* Post Content */
  postContent: {
    padding: 14,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaText: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "600",
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#CBD5E1",
    marginHorizontal: 8,
  },
  postTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
    lineHeight: 21,
    marginBottom: 6,
  },
  postSummary: {
    fontSize: 12.5,
    color: "#64748B",
    lineHeight: 18,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: 10,
  },
  authorCol: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  authorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  authorAvatarText: {
    fontSize: 11,
    fontWeight: "800",
    color: Colors.primary,
  },
  authorName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
  },
  readMoreLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  readMoreText: {
    fontSize: 12,
    fontWeight: "800",
    color: Colors.primary,
  },

  /* Empty & Loading States */
  loadingState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },
  loadingStateText: {
    marginTop: 12,
    fontSize: 13,
    color: "#64748B",
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
    paddingHorizontal: 24,
  },
  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1E3A8A",
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 18,
  },
  clearSearchBtn: {
    marginTop: 14,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
  },
  clearSearchBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.primary,
  },
});
