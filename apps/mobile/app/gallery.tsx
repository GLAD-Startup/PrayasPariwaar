import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  StatusBar,
  Modal,
  Share,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors, Shadows } from "../lib/theme";
import { api, resolveImageUrl } from "../lib/api";
import { getCachedData, setCachedData } from "../lib/cache";
import { prefetchRemoteImages } from "../lib/assetPreloader";
import ActionDialog from "../components/ActionDialog";

const { width } = Dimensions.get("window");
const GRID_ITEM_SIZE = (width - 32 - 16) / 3;

interface Album {
  id: string;
  title: string;
  date: string;
  photoCount: number;
  image: any;
  category: string;
}

interface GalleryPhoto {
  id: string;
  title: string;
  category: string;
  location?: string;
  date: string;
  image: any;
}

const FILTER_TABS = [
  { id: "all", label: "All Photos", icon: "grid", iconType: "ionicons" },
  { id: "Free Education", label: "Education", icon: "school-outline", iconType: "ionicons" },
  { id: "Blood Donation", label: "Blood Seva", icon: "water-outline", iconType: "ionicons" },
  { id: "Plantation", label: "Plantation", icon: "leaf-outline", iconType: "ionicons" },
  { id: "Healthcare", label: "Health Camps", icon: "medical-outline", iconType: "ionicons" },
  { id: "Jeev Jal Seva", label: "Jeev Jal", icon: "bird", iconType: "material" },
  { id: "Vocational Training", label: "Vocational", icon: "cog-outline", iconType: "material" },
];

export default function GalleryScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [albums, setAlbums] = useState<Album[]>([]);
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState<GalleryPhoto | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadGalleryData();
  }, [selectedCategory]);

  const loadGalleryData = async () => {
    try {
      setLoading(true);
      // Fetch live gallery data directly from database API
      const url = selectedCategory === "all" ? "/gallery" : `/gallery?category=${encodeURIComponent(selectedCategory)}`;
      const res = await api.get<any>(url);

      if (res.data?.success && res.data.data) {
        const dbAlbums = (res.data.data.albums || []).filter(
          (a: any) => !a.coverImage || !a.coverImage.includes("unsplash.com")
        );
        const dbPhotos = (res.data.data.recentPhotos || []).filter(
          (p: any) => p.url && !p.url.includes("unsplash.com")
        );
        const imageUrlsToPrefetch: string[] = [];

        const mappedAlbums: Album[] = dbAlbums.map((a: any) => {
          const resolvedImg = resolveImageUrl(a.coverImage);
          if (typeof resolvedImg === "object" && resolvedImg.uri) {
            imageUrlsToPrefetch.push(resolvedImg.uri);
          }
          return {
            id: a.id,
            title: a.title,
            date: a.location || "Vrindavan & Mathura",
            photoCount: a.photoCount || (a.photos ? a.photos.length : 0),
            image: resolvedImg,
            category: a.category || "Free Education",
          };
        });

        const mappedPhotos: GalleryPhoto[] = dbPhotos.map((p: any) => {
          const resolvedImg = resolveImageUrl(p.url);
          if (typeof resolvedImg === "object" && resolvedImg.uri) {
            imageUrlsToPrefetch.push(resolvedImg.uri);
          }
          return {
            id: p.id,
            title: p.title || p.caption || "Seva Photo",
            category: p.category || "Free Education",
            location: p.location || "Vrindavan Seva",
            date: p.createdAt ? new Date(p.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }) : "Recent",
            image: resolvedImg,
          };
        });

        if (imageUrlsToPrefetch.length > 0) {
          prefetchRemoteImages(imageUrlsToPrefetch).catch(() => {});
        }

        setAlbums(mappedAlbums);
        setPhotos(mappedPhotos);
      } else {
        setAlbums([]);
        setPhotos([]);
      }
    } catch (e) {
      console.warn("Failed to load gallery from database:", e);
      setAlbums([]);
      setPhotos([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadGalleryData();
    setRefreshing(false);
  };

  const filteredAlbums = albums.filter(
    (alb) => selectedCategory === "all" || alb.category === selectedCategory || (selectedCategory === "Healthcare" && alb.category.toLowerCase().includes("health"))
  );

  const filteredPhotos = photos.filter(
    (p) => selectedCategory === "all" || p.category === selectedCategory || (selectedCategory === "Healthcare" && p.category.toLowerCase().includes("health"))
  );

  const handleShareGallery = async () => {
    try {
      await Share.share({
        message: "Explore inspiring real photos of Prayas Pariwaar grassroots seva across Mathura and Vrindavan!",
      });
    } catch (e) {
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
          onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)/home"))}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={22} color="#164E2E" />
        </TouchableOpacity>

        <View style={styles.headerTitleCol}>
          <Text style={styles.headerTitle}>Seva Photo Gallery</Text>
          <Text style={styles.headerSubtitle}>Real Ground Captures • Mathura & Vrindavan</Text>
        </View>

        <TouchableOpacity
          style={styles.headerActionBtn}
          onPress={handleShareGallery}
          activeOpacity={0.8}
        >
          <Ionicons name="share-social-outline" size={20} color="#164E2E" />
        </TouchableOpacity>
      </View>

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
        {/* Filter Category Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterTabsScroll}
        >
          {FILTER_TABS.map((tab) => {
            const isActive = selectedCategory === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.filterTab, isActive && styles.filterTabActive]}
                onPress={() => setSelectedCategory(tab.id)}
                activeOpacity={0.8}
              >
                {tab.icon && (
                  <View style={{ marginRight: 5 }}>
                    {tab.iconType === "ionicons" ? (
                      <Ionicons
                        name={tab.icon as any}
                        size={14}
                        color={isActive ? "#FFFFFF" : "#166534"}
                      />
                    ) : (
                      <MaterialCommunityIcons
                        name={tab.icon as any}
                        size={14}
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

        {/* Section: Featured Albums */}
        {filteredAlbums.length > 0 && (
          <>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionHeadingWrapper}>
                <Text style={styles.sectionHeading}>Featured Albums</Text>
                <Text style={styles.sectionCountBadge}>{filteredAlbums.length}</Text>
              </View>
              <Text style={styles.viewAllText}>Authentic Drives</Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.albumsScroll}
            >
              {filteredAlbums.map((album) => (
                <TouchableOpacity
                  key={album.id}
                  style={styles.albumCard}
                  onPress={() => setSelectedAlbum(album)}
                  activeOpacity={0.88}
                >
                  <View style={styles.albumImageWrapper}>
                    <Image
                      source={resolveImageUrl(album.image)}
                      style={styles.albumImage}
                      resizeMode="cover"
                    />
                    <View style={styles.albumOverlayGradient} />
                    <View style={styles.albumBadge}>
                      <Ionicons name="images-outline" size={11} color="#FFFFFF" style={{ marginRight: 3 }} />
                      <Text style={styles.albumBadgeText}>{album.photoCount}</Text>
                    </View>
                    <View style={styles.albumCategoryPill}>
                      <Text style={styles.albumCategoryPillText}>{album.category}</Text>
                    </View>
                  </View>

                  {/* High Contrast Clear Album Text */}
                  <View style={styles.albumTextBox}>
                    <Text style={styles.albumTitle} numberOfLines={2}>
                      {album.title}
                    </Text>
                    <View style={styles.albumDateRow}>
                      <Ionicons name="location-outline" size={11} color="#166534" style={{ marginRight: 3 }} />
                      <Text style={styles.albumDate}>{album.date}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        {/* Section: Field Photos (3-Column Grid) */}
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionHeadingWrapper}>
            <Text style={styles.sectionHeading}>Recent Field Captures</Text>
            <Text style={styles.sectionCountBadge}>{filteredPhotos.length}</Text>
          </View>
          <Text style={styles.viewAllText}>Tap to enlarge</Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#166534" />
            <Text style={styles.loadingText}>Fetching gallery from database...</Text>
          </View>
        ) : filteredPhotos.length === 0 ? (
          <View style={styles.emptyGalleryBox}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="images-outline" size={32} color="#166534" />
            </View>
            <Text style={styles.emptyGalleryTitle}>No Photos in this Category</Text>
            <Text style={styles.emptyGallerySubtitle}>
              All photos are linked directly to database uploads. Verified field captures will appear here once added.
            </Text>
          </View>
        ) : (
          <View style={styles.photosGrid}>
            {filteredPhotos.map((photo) => (
              <TouchableOpacity
                key={photo.id}
                style={[styles.gridPhotoWrapper, { width: GRID_ITEM_SIZE, height: GRID_ITEM_SIZE }]}
                onPress={() => setActivePhoto(photo)}
                activeOpacity={0.85}
              >
                <Image
                  source={resolveImageUrl(photo.image)}
                  style={styles.gridPhotoImage}
                  resizeMode="cover"
                />
                <View style={styles.gridPhotoOverlay}>
                  <Ionicons name="expand-outline" size={13} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Bottom Impact Banner */}
        <View style={styles.bottomBanner}>
          <View style={styles.bottomBannerLeft}>
            <View style={styles.photoStackIconWrapper}>
              <Ionicons name="camera" size={22} color="#166534" />
            </View>
            <View style={styles.bottomBannerTextCol}>
              <Text style={styles.bottomBannerTitle}>100% Real Seva Moments</Text>
              <Text style={styles.bottomBannerSubtitle}>
                Every photograph documents our selfless field work across Mathura & Vrindavan.
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.shareGalleryBtn}
            onPress={handleShareGallery}
            activeOpacity={0.88}
          >
            <Ionicons name="share-social-outline" size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
            <Text style={styles.shareGalleryBtnText}>Share</Text>
          </TouchableOpacity>
        </View>

        {/* Fullscreen Photo Lightbox Modal with High-Contrast Visible Bottom Caption */}
        {activePhoto && (
          <Modal visible={!!activePhoto} transparent animationType="fade">
            <View style={styles.lightboxOverlay}>
              <SafeAreaView style={styles.lightboxSafeArea}>
                {/* Modal Top Bar */}
                <View style={styles.lightboxTopBar}>
                  <TouchableOpacity
                    style={styles.lightboxCloseBtn}
                    onPress={() => setActivePhoto(null)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="close" size={24} color="#FFFFFF" />
                  </TouchableOpacity>

                  <View style={styles.lightboxTagBadge}>
                    <Text style={styles.lightboxTagText}>{activePhoto.category}</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.lightboxCloseBtn}
                    onPress={() => {
                      Share.share({ message: `${activePhoto.title} - Prayas Pariwaar Seva in Vrindavan` });
                    }}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="share-social-outline" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>

                {/* Modal Main Image */}
                <View style={styles.lightboxImageContainer}>
                  <Image
                    source={resolveImageUrl(activePhoto.image)}
                    style={styles.lightboxImage}
                    resizeMode="contain"
                  />
                </View>

                {/* High-Contrast Clear Bottom Caption Box */}
                <View style={styles.lightboxCaptionContainer}>
                  <View style={styles.lightboxCaptionBox}>
                    <Text style={styles.lightboxTitle}>{activePhoto.title}</Text>
                    <View style={styles.lightboxMetaRow}>
                      <View style={styles.lightboxLocationPill}>
                        <Ionicons name="location" size={12} color="#FDE047" style={{ marginRight: 4 }} />
                        <Text style={styles.lightboxLocationText}>
                          {activePhoto.location || "Mathura & Vrindavan Seva"}
                        </Text>
                      </View>
                      <View style={styles.lightboxDatePill}>
                        <Ionicons name="calendar-outline" size={12} color="#86EFAC" style={{ marginRight: 4 }} />
                        <Text style={styles.lightboxDateText}>{activePhoto.date}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </SafeAreaView>
            </View>
          </Modal>
        )}
      </ScrollView>

      {/* Album Detail ActionDialog */}
      <ActionDialog
        visible={!!selectedAlbum}
        onClose={() => setSelectedAlbum(null)}
        title={selectedAlbum?.title || "Field Album"}
        badge={selectedAlbum?.category.toUpperCase() || "GALLERY"}
        description={`Ground photographic documentation covering ${selectedAlbum?.category || "Seva"} in Mathura & Vrindavan (${selectedAlbum?.photoCount || 0} high-resolution field captures).`}
        icon="images-outline"
        type="primary"
        confirmText="Filter This Category"
        onConfirm={() => {
          if (selectedAlbum?.category) {
            setSelectedCategory(selectedAlbum.category);
          }
          setSelectedAlbum(null);
        }}
        cancelText="Close"
        showCancel={true}
      />
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
  headerBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  headerTitleCol: {
    flex: 1,
    marginHorizontal: 12,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#164E2E",
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 11,
    color: "#475569",
    fontWeight: "700",
    marginTop: 1,
  },
  headerActionBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0FDF4",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
  },
  filterTabsScroll: {
    gap: 8,
    paddingBottom: 10,
  },
  filterTab: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    ...Shadows.soft,
  },
  filterTabActive: {
    backgroundColor: "#166534",
    borderColor: "#166534",
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#334155",
  },
  filterTabTextActive: {
    color: "#FFFFFF",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
    marginBottom: 10,
  },
  sectionHeadingWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.2,
  },
  sectionCountBadge: {
    fontSize: 11,
    fontWeight: "700",
    color: "#166534",
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  viewAllText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#475569",
  },
  albumsScroll: {
    gap: 12,
    paddingBottom: 6,
  },
  albumCard: {
    width: 145,
  },
  albumImageWrapper: {
    width: 145,
    height: 155,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#E2E8F0",
    marginBottom: 4,
    ...Shadows.card,
  },
  albumImage: {
    width: "100%",
    height: "100%",
  },
  albumOverlayGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.18)",
  },
  albumBadge: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.75)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
  },
  albumBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },
  albumCategoryPill: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(22, 101, 52, 0.92)",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  albumCategoryPillText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "800",
  },
  albumTextBox: {
    paddingTop: 4,
  },
  albumTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 2,
    lineHeight: 17,
  },
  albumDateRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  albumDate: {
    fontSize: 11,
    color: "#475569",
    fontWeight: "700",
  },
  photosGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 18,
  },
  gridPhotoWrapper: {
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#E2E8F0",
    position: "relative",
    ...Shadows.soft,
  },
  gridPhotoImage: {
    width: "100%",
    height: "100%",
  },
  gridPhotoOverlay: {
    position: "absolute",
    bottom: 4,
    right: 4,
    backgroundColor: "rgba(0,0,0,0.6)",
    width: 22,
    height: 22,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomBanner: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BBF7D0",
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...Shadows.card,
  },
  bottomBannerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  photoStackIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  bottomBannerTextCol: {
    flex: 1,
  },
  bottomBannerTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#164E2E",
  },
  bottomBannerSubtitle: {
    fontSize: 11,
    color: "#334155",
    fontWeight: "600",
    marginTop: 2,
    lineHeight: 15,
  },
  shareGalleryBtn: {
    backgroundColor: "#166534",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    ...Shadows.soft,
  },
  shareGalleryBtnText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },

  /* Lightbox Modal High-Contrast Clear Text */
  lightboxOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.96)",
  },
  lightboxSafeArea: {
    flex: 1,
    justifyContent: "space-between",
  },
  lightboxTopBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  lightboxCloseBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  lightboxTagBadge: {
    backgroundColor: "rgba(22, 101, 52, 0.95)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  lightboxTagText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  lightboxImageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  lightboxImage: {
    width: width - 16,
    height: "100%",
  },
  lightboxCaptionContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  lightboxCaptionBox: {
    backgroundColor: "rgba(15, 23, 42, 0.94)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    padding: 14,
    ...Shadows.card,
  },
  lightboxTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 8,
    lineHeight: 21,
  },
  lightboxMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  lightboxLocationPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  lightboxLocationText: {
    fontSize: 12,
    color: "#FDE047",
    fontWeight: "700",
  },
  lightboxDatePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  lightboxDateText: {
    fontSize: 12,
    color: "#86EFAC",
    fontWeight: "700",
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
  },
  emptyGalleryBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 12,
    ...Shadows.card,
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  emptyGalleryTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 6,
    textAlign: "center",
  },
  emptyGallerySubtitle: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 18,
    maxWidth: 280,
  },
});
