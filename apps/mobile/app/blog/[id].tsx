import React, { useState, useEffect, useCallback } from "react";
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
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Shadows } from "../../lib/theme";
import { api, resolveImageUrl } from "../../lib/api";
import { getCachedData, setCachedData } from "../../lib/cache";
import { LiveBlogPost } from "../(tabs)/blogs";

const { width } = Dimensions.get("window");

interface DetailedPost {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string | null;
  category: string;
  categoryBg: string;
  categoryColor: string;
  coverImage: string | null;
  date: string;
  eventDate: string | null;
  location: string | null;
  author: string;
  authorRole: string;
  readTime: string;
  images: { id: string; url: string; caption?: string | null }[];
}

function parsePostData(raw: any): DetailedPost {
  const typeKey = (raw.type || "NEWS").toUpperCase();
  let category = "Seva Update";
  let categoryBg = "#EFF6FF";
  let categoryColor = "#1D4ED8";

  const titleLower = (raw.title || "").toLowerCase();
  if (typeKey === "EVENT") {
    category = "Event";
    categoryBg = "#FAF5FF";
    categoryColor = "#7E22CE";
  } else if (typeKey === "ACHIEVEMENT") {
    category = "Milestone";
    categoryBg = "#FFFBEB";
    categoryColor = "#B45309";
  } else if (titleLower.includes("blood") || titleLower.includes("रक्तदान")) {
    category = "Blood Donation";
    categoryBg = "#FEF2F2";
    categoryColor = "#DC2626";
  } else if (titleLower.includes("plant") || titleLower.includes("वृक्षारोपण") || titleLower.includes("harit")) {
    category = "Plantation";
    categoryBg = "#F0FDF4";
    categoryColor = "#166534";
  } else if (titleLower.includes("health") || titleLower.includes("camp") || titleLower.includes("स्वास्थ्य")) {
    category = "Health Camp";
    categoryBg = "#F0F9FF";
    categoryColor = "#0284C7";
  } else if (titleLower.includes("education") || titleLower.includes("aashayein") || titleLower.includes("शिक्षा")) {
    category = "Education";
    categoryBg = "#EFF6FF";
    categoryColor = "#1D4ED8";
  }

  const wordCount = (raw.content || "").split(/\s+/).length;
  const mins = Math.max(1, Math.ceil(wordCount / 180));
  const readTime = `${mins} min read`;

  const dateObj = new Date(raw.publishedAt || raw.createdAt || Date.now());
  const dateStr = dateObj.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return {
    id: String(raw.id || ""),
    slug: String(raw.slug || raw.id || ""),
    title: raw.title || "Prayas Seva Initiative",
    content: raw.content || "",
    excerpt: raw.excerpt || null,
    category,
    categoryBg,
    categoryColor,
    coverImage: raw.coverImage || null,
    date: dateStr,
    eventDate: raw.eventDate
      ? new Date(raw.eventDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
      : null,
    location: raw.location || null,
    author: typeof raw.author === "string" ? raw.author : raw.author?.name || "Prayas Pariwaar",
    authorRole: "Editorial & Seva Desk",
    readTime,
    images: Array.isArray(raw.images)
      ? raw.images.map((img: any) => ({
          id: img.id || String(Math.random()),
          url: typeof img === "string" ? img : img.url || "",
          caption: img.caption || null,
        }))
      : [],
  };
}

export default function BlogDetailScreen() {
  const router = useRouter();
  const rawParams = useLocalSearchParams();
  const id = Array.isArray(rawParams.id) ? rawParams.id[0] : (rawParams.id as string | undefined);

  const [post, setPost] = useState<DetailedPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPostDetail = useCallback(async (isRefresh = false) => {
    if (!id) {
      setLoading(false);
      setError("No story identifier provided.");
      return;
    }

    try {
      // 1. Check cached blog list first for instant 0ms UI load
      if (!isRefresh) {
        const cachedList = await getCachedData<LiveBlogPost[]>("prayas_blog_posts");
        if (cachedList && Array.isArray(cachedList)) {
          const found = cachedList.find(
            (p) => String(p.id) === String(id) || String(p.slug) === String(id)
          );
          if (found) {
            setPost(parsePostData(found));
            setLoading(false);
          }
        }
      }

      // 2. Fetch latest live story data from backend API
      const res = await api.get<any>(`/posts/${encodeURIComponent(id)}`);
      if (res.data?.success && res.data.data) {
        const parsed = parsePostData(res.data.data);
        setPost(parsed);
        setError(null);
      } else {
        setPost((current) => {
          if (!current) {
            setError(res.error || "Story not found or unpublished.");
          }
          return current;
        });
      }
    } catch (e: any) {
      console.log("[Post Detail Load Error]", e?.message);
      setPost((current) => {
        if (!current) {
          setError("Unable to load story. Pull down to retry.");
        }
        return current;
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPostDetail();
  }, [fetchPostDetail]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPostDetail(true);
  };

  const handleShare = async () => {
    if (!post) return;
    try {
      await Share.share({
        title: post.title,
        message: `${post.title}\n\nRead this seva story on Prayas Sanstha: https://prayas-sanstha.org/posts/${post.slug}`,
      });
    } catch (e) {
      console.log(e);
    }
  };

  if (loading && !post) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Fetching story...</Text>
      </SafeAreaView>
    );
  }

  if (error && !post) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <Ionicons name="alert-circle-outline" size={48} color="#DC2626" />
        <Text style={styles.errorTitle}>Story Unavailable</Text>
        <Text style={styles.errorSubtitle}>{error}</Text>
        <TouchableOpacity
          style={styles.retryBtn}
          onPress={() => {
            setLoading(true);
            fetchPostDetail(true);
          }}
        >
          <Text style={styles.retryBtnText}>Retry Connection</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backLink} onPress={() => router.back()}>
          <Text style={styles.backLinkText}>← Go Back to Stories</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!post) return null;

  // Split content into clean paragraphs
  const paragraphs = post.content
    ? post.content.split(/\n\n+/).map((p) => p.trim()).filter(Boolean)
    : [];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      {/* Floating Top Nav Bar */}
      <SafeAreaView edges={["top"]} style={styles.floatingNavSafe}>
        <View style={styles.floatingNav}>
          <TouchableOpacity
            style={styles.navIconBtn}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.navRightActions}>
            <TouchableOpacity
              style={styles.navIconBtn}
              onPress={handleShare}
              activeOpacity={0.8}
            >
              <Ionicons name="share-social-outline" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

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
          />
        }
      >
        {/* Hero Cover Image */}
        <View style={styles.heroWrap}>
          {post.coverImage ? (
            <Image
              source={resolveImageUrl(post.coverImage)}
              style={styles.heroImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.heroFallback}>
              <Ionicons name="sparkles" size={48} color="#FFFFFF" />
            </View>
          )}
          <View style={styles.heroGradientOverlay} />

          {/* Category Chip */}
          <View
            style={[
              styles.heroCategoryBadge,
              { backgroundColor: post.categoryBg },
            ]}
          >
            <Text
              style={[
                styles.heroCategoryText,
                { color: post.categoryColor },
              ]}
            >
              {post.category}
            </Text>
          </View>
        </View>

        {/* Main Article Body Card */}
        <View style={styles.articleCard}>
          {/* Metadata Row */}
          <View style={styles.metaRow}>
            <View style={styles.metaBadge}>
              <Ionicons name="calendar-outline" size={12} color={Colors.primary} style={{ marginRight: 4 }} />
              <Text style={styles.metaBadgeText}>{post.date}</Text>
            </View>
            <View style={styles.metaBadge}>
              <Ionicons name="time-outline" size={12} color="#64748B" style={{ marginRight: 4 }} />
              <Text style={[styles.metaBadgeText, { color: "#64748B" }]}>{post.readTime}</Text>
            </View>
            {post.location && (
              <View style={styles.metaBadge}>
                <Ionicons name="location-outline" size={12} color="#16A34A" style={{ marginRight: 4 }} />
                <Text style={[styles.metaBadgeText, { color: "#16A34A" }]}>{post.location}</Text>
              </View>
            )}
          </View>

          {/* Article Title */}
          <Text style={styles.articleTitle}>{post.title}</Text>

          {/* Author Byline */}
          <View style={styles.authorBar}>
            <View style={styles.authorAvatar}>
              <Text style={styles.authorAvatarText}>
                {String(post.author || "P").charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.authorDetails}>
              <Text style={styles.authorName}>{typeof post.author === "string" ? post.author : "Prayas Pariwaar"}</Text>
              <Text style={styles.authorRole}>{post.authorRole}</Text>
            </View>
          </View>

          {/* Excerpt Lead Box if present */}
          {post.excerpt ? (
            <View style={styles.excerptBox}>
              <Ionicons name="bookmark-outline" size={16} color={Colors.primary} style={{ marginRight: 8, marginTop: 1 }} />
              <Text style={styles.excerptText}>{post.excerpt}</Text>
            </View>
          ) : null}

          {/* Content Paragraphs */}
          <View style={styles.paragraphsList}>
            {paragraphs.map((p, i) => (
              <Text key={i} style={styles.paragraphText}>
                {p}
              </Text>
            ))}
          </View>

          {/* Embedded Photo Gallery */}
          {post.images && post.images.length > 0 && (
            <View style={styles.gallerySection}>
              <View style={styles.galleryHeader}>
                <Ionicons name="images-outline" size={18} color={Colors.primary} />
                <Text style={styles.gallerySectionTitle}>Field Photos & Documentation</Text>
              </View>

              <View style={styles.galleryGrid}>
                {post.images.map((img) => (
                  <View key={img.id} style={styles.galleryCard}>
                    <Image
                      source={resolveImageUrl(img.url)}
                      style={styles.galleryImg}
                      resizeMode="cover"
                    />
                    {img.caption && (
                      <Text style={styles.galleryCaption}>{img.caption}</Text>
                    )}
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Support / CTA Seva Card */}
          <View style={styles.ctaCard}>
            <View style={styles.ctaIconCircle}>
              <Ionicons name="heart" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.ctaTitle}>Be a Part of This Seva</Text>
            <Text style={styles.ctaSubtitle}>
              Prayas Pariwaar is 100% volunteer-driven and transparent. Every contribution goes directly into grassroots community impact.
            </Text>

            <View style={styles.ctaButtonsRow}>
              <TouchableOpacity
                style={styles.ctaDonateBtn}
                onPress={() => router.push("/(tabs)/donate")}
                activeOpacity={0.88}
              >
                <Text style={styles.ctaDonateBtnText}>Contribute / 80G Seva</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.ctaVolunteerBtn}
                onPress={() => router.push("/volunteer-form")}
                activeOpacity={0.88}
              >
                <Text style={styles.ctaVolunteerBtnText}>Join as Volunteer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  floatingNavSafe: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
  },
  floatingNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  navIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    alignItems: "center",
    justifyContent: "center",
  },
  navRightActions: {
    flexDirection: "row",
    gap: 8,
  },

  /* Hero Section */
  heroWrap: {
    width: "100%",
    height: 280,
    backgroundColor: "#1E3A8A",
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroFallback: {
    width: "100%",
    height: "100%",
    backgroundColor: "#1D4ED8",
    alignItems: "center",
    justifyContent: "center",
  },
  heroGradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.35)",
  },
  heroCategoryBadge: {
    position: "absolute",
    bottom: 24,
    left: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)",
  },
  heroCategoryText: {
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  /* Article Card */
  articleCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -20,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
    ...Shadows.card,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  metaBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  metaBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.primary,
  },
  articleTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#0F172A",
    lineHeight: 29,
    marginBottom: 16,
    letterSpacing: -0.3,
  },

  /* Author Bar */
  authorBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 18,
  },
  authorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  authorAvatarText: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.primary,
  },
  authorDetails: {
    flex: 1,
  },
  authorName: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1E293B",
  },
  authorRole: {
    fontSize: 11,
    color: "#64748B",
  },

  /* Excerpt */
  excerptBox: {
    flexDirection: "row",
    backgroundColor: "#EFF6FF",
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    padding: 14,
    borderRadius: 10,
    marginBottom: 20,
  },
  excerptText: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: "600",
    color: "#1E3A8A",
    lineHeight: 20,
    fontStyle: "italic",
  },

  /* Paragraphs */
  paragraphsList: {
    gap: 16,
    marginBottom: 28,
  },
  paragraphText: {
    fontSize: 14.5,
    color: "#334155",
    lineHeight: 24,
  },

  /* Gallery */
  gallerySection: {
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingTop: 20,
    marginBottom: 28,
  },
  galleryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  gallerySectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
  },
  galleryGrid: {
    gap: 14,
  },
  galleryCard: {
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  galleryImg: {
    width: "100%",
    height: 190,
  },
  galleryCaption: {
    padding: 10,
    fontSize: 11.5,
    color: "#64748B",
    fontStyle: "italic",
  },

  /* CTA Card */
  ctaCard: {
    backgroundColor: "#1E3A8A",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    ...Shadows.card,
  },
  ctaIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  ctaTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 6,
  },
  ctaSubtitle: {
    fontSize: 12,
    color: "#BFDBFE",
    textAlign: "center",
    lineHeight: 17,
    marginBottom: 16,
  },
  ctaButtonsRow: {
    width: "100%",
    gap: 10,
  },
  ctaDonateBtn: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  ctaDonateBtnText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1D4ED8",
  },
  ctaVolunteerBtn: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  ctaVolunteerBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  /* Loading & Error */
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: "#64748B",
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#FFFFFF",
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 12,
    marginBottom: 6,
  },
  errorSubtitle: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 18,
  },
  retryBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  retryBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },
  backLink: {
    padding: 8,
  },
  backLinkText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: "600",
  },
});
