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
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors, Shadows } from "../lib/theme";
import { api, resolveImageUrl } from "../lib/api";

const { width } = Dimensions.get("window");
const GRID_ITEM_SIZE = (width - 40 - 16) / 3;

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
  date: string;
  image: any;
}

const DEFAULT_ALBUMS: Album[] = [
  {
    id: "alb-1",
    title: "Free Education",
    date: "24 May 2024",
    photoCount: 128,
    image: require("../assets/onboarding/education.jpg"),
    category: "Free Education",
  },
  {
    id: "alb-2",
    title: "Blood Donation Camps",
    date: "18 May 2024",
    photoCount: 86,
    image: require("../assets/onboarding/blood.jpg"),
    category: "Blood Donation",
  },
  {
    id: "alb-3",
    title: "Plantation Drives",
    date: "10 May 2024",
    photoCount: 112,
    image: require("../assets/onboarding/plantation.jpg"),
    category: "Plantation",
  },
  {
    id: "alb-4",
    title: "Jeev Jal Seva",
    date: "05 May 2024",
    photoCount: 64,
    image: require("../assets/onboarding/jeev_jal.jpg"),
    category: "Jeev Jal Seva",
  },
  {
    id: "alb-5",
    title: "Vocational Training",
    date: "02 May 2024",
    photoCount: 78,
    image: require("../assets/onboarding/equipment.jpg"),
    category: "Vocational Training",
  },
];

const DEFAULT_PHOTOS: GalleryPhoto[] = [
  {
    id: "p-1",
    title: "Children with creative drawing books at Rohini Center",
    category: "Free Education",
    date: "24 May 2024",
    image: require("../assets/onboarding/gallery_1.jpg"),
  },
  {
    id: "p-2",
    title: "Voluntary donor participating at City Hospital Camp",
    category: "Blood Donation",
    date: "18 May 2024",
    image: require("../assets/onboarding/blood.jpg"),
  },
  {
    id: "p-3",
    title: "Planting native saplings in Green Valley corridor",
    category: "Plantation",
    date: "10 May 2024",
    image: require("../assets/onboarding/plantation.jpg"),
  },
  {
    id: "p-4",
    title: "Youth volunteers with 'Plant Today Save Tomorrow' banner",
    category: "Plantation",
    date: "09 May 2024",
    image: require("../assets/onboarding/banner_plantation.jpg"),
  },
  {
    id: "p-5",
    title: "Sparrows drinking from terracotta water pot",
    category: "Jeev Jal Seva",
    date: "06 May 2024",
    image: require("../assets/onboarding/jeev_jal.jpg"),
  },
  {
    id: "p-6",
    title: "Young woman mastering garment sewing in tailoring wing",
    category: "Vocational Training",
    date: "04 May 2024",
    image: require("../assets/onboarding/tailoring.jpg"),
  },
  {
    id: "p-7",
    title: "Teacher providing dedicated notebook guidance",
    category: "Free Education",
    date: "02 May 2024",
    image: require("../assets/onboarding/gallery_2.jpg"),
  },
  {
    id: "p-8",
    title: "Primary school classroom in session",
    category: "Free Education",
    date: "28 Apr 2024",
    image: require("../assets/onboarding/classroom.jpg"),
  },
  {
    id: "p-9",
    title: "Vocational training workshop with machinery",
    category: "Vocational Training",
    date: "25 Apr 2024",
    image: require("../assets/onboarding/equipment.jpg"),
  },
];

const FILTER_TABS = [
  { id: "all", label: "All", icon: "grid", iconType: "ionicons" },
  { id: "Free Education", label: "Free Education", icon: "book-outline", iconType: "ionicons" },
  { id: "Blood Donation", label: "Blood Donation", icon: "water-outline", iconType: "ionicons" },
  { id: "Plantation", label: "Plantation", icon: "sprout-outline", iconType: "material" },
  { id: "Jeev Jal Seva", label: "Jeev Jal Seva", icon: "bird", iconType: "material" },
  { id: "Vocational Training", label: "Vocational Training", icon: "cog-outline", iconType: "material" },
];

export default function GalleryScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [albums, setAlbums] = useState<Album[]>(DEFAULT_ALBUMS);
  const [photos, setPhotos] = useState<GalleryPhoto[]>(DEFAULT_PHOTOS);
  const [activePhoto, setActivePhoto] = useState<GalleryPhoto | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadGalleryData();
  }, [selectedCategory]);

  const loadGalleryData = async () => {
    try {
      const url = selectedCategory === "all" ? "/gallery" : `/gallery?category=${encodeURIComponent(selectedCategory)}`;
      const res = await api.get<any>(url);
      if (res.data?.success && res.data.data) {
        const dbAlbums = res.data.data.albums || [];
        const dbPhotos = res.data.data.recentPhotos || [];

        if (dbAlbums.length > 0) {
          const mappedAlbums = dbAlbums.map((a: any) => ({
            id: a.id,
            title: a.title,
            date: a.createdAt ? new Date(a.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }) : "Recent",
            photoCount: a.photoCount || (a.photos ? a.photos.length : 12),
            image: resolveImageUrl(a.coverImage, require("../assets/onboarding/education.jpg")),
            category: a.category || "Free Education",
          }));
          setAlbums(mappedAlbums);
        }

        if (dbPhotos.length > 0) {
          const mappedPhotos = dbPhotos.map((p: any) => ({
            id: p.id,
            title: p.title || p.caption || "Seva Photo",
            category: p.category || "Free Education",
            date: p.createdAt ? new Date(p.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" }) : "Recent",
            image: resolveImageUrl(p.url, require("../assets/onboarding/gallery_1.jpg")),
          }));
          setPhotos(mappedPhotos);
        }
      }
    } catch (e) {
      console.warn("Failed to load gallery from API:", e);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadGalleryData();
    setRefreshing(false);
  };

  const filteredAlbums = albums.filter(
    (alb) => selectedCategory === "all" || alb.category === selectedCategory
  );

  const filteredPhotos = photos.filter(
    (p) => selectedCategory === "all" || p.category === selectedCategory
  );

  const handleShareGallery = async () => {
    try {
      await Share.share({
        message: "Explore inspiring photos of Prayas Pariwaar on-ground seva drives across Braj!",
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

        <Text style={styles.headerTitle}>Gallery</Text>

        <View style={styles.headerRightActions}>
          <TouchableOpacity
            style={styles.headerActionBtn}
            onPress={() => Alert.alert("Search Photos", "Search by event, location, or seva date.")}
          >
            <Ionicons name="search-outline" size={20} color="#164E2E" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerActionBtn}
            onPress={() => Alert.alert("Filters", "Filter by year, event type, or stream.")}
          >
            <Ionicons name="options-outline" size={20} color="#164E2E" />
          </TouchableOpacity>
        </View>
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
        {/* Subtitle */}
        <Text style={styles.subtitle}>Moments of service, smiles of change.</Text>

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
                  <View style={{ marginRight: 6 }}>
                    {tab.iconType === "ionicons" ? (
                      <Ionicons
                        name={tab.icon as any}
                        size={16}
                        color={isActive ? "#FFFFFF" : "#166534"}
                      />
                    ) : (
                      <MaterialCommunityIcons
                        name={tab.icon as any}
                        size={16}
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
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>Featured Albums</Text>
          <TouchableOpacity onPress={() => Alert.alert("Albums", `Showing ${filteredAlbums.length} seva photo albums.`)}>
            <Text style={styles.viewAllText}>View All ({filteredAlbums.length}) ›</Text>
          </TouchableOpacity>
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
              onPress={() => Alert.alert(album.title, `Album with ${album.photoCount} high-resolution field photos.`)}
              activeOpacity={0.88}
            >
              <View style={styles.albumImageWrapper}>
                <Image
                  source={typeof album.image === "string" ? { uri: album.image } : album.image}
                  style={styles.albumImage}
                  resizeMode="cover"
                />
                <View style={styles.albumBadge}>
                  <Ionicons name="images-outline" size={11} color="#FFFFFF" style={{ marginRight: 3 }} />
                  <Text style={styles.albumBadgeText}>{album.photoCount}</Text>
                </View>
              </View>
              <Text style={styles.albumTitle} numberOfLines={1}>
                {album.title}
              </Text>
              <Text style={styles.albumDate}>{album.date}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Section: Recent Photos (3-Column Grid) */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>Recent Photos</Text>
          <TouchableOpacity onPress={() => Alert.alert("Recent Photos", `Showing ${filteredPhotos.length} field captures.`)}>
            <Text style={styles.viewAllText}>View All ({filteredPhotos.length}) ›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.photosGrid}>
          {filteredPhotos.map((photo) => (
            <TouchableOpacity
              key={photo.id}
              style={[styles.gridPhotoWrapper, { width: GRID_ITEM_SIZE, height: GRID_ITEM_SIZE }]}
              onPress={() => setActivePhoto(photo)}
              activeOpacity={0.85}
            >
              <Image
                source={typeof photo.image === "string" ? { uri: photo.image } : photo.image}
                style={styles.gridPhotoImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Bottom Banner Card */}
        <View style={styles.bottomBanner}>
          <View style={styles.bottomBannerLeft}>
            <View style={styles.photoStackIconWrapper}>
              <Ionicons name="albums-outline" size={28} color="#166534" />
            </View>
            <View style={styles.bottomBannerTextCol}>
              <Text style={styles.bottomBannerTitle}>Every picture tells a story of hope.</Text>
              <Text style={styles.bottomBannerSubtitle}>
                Swipe through moments that inspire and impact lives every day.
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.shareGalleryBtn}
            onPress={handleShareGallery}
            activeOpacity={0.88}
          >
            <Ionicons name="share-social-outline" size={15} color="#FFFFFF" style={{ marginRight: 5 }} />
            <Text style={styles.shareGalleryBtnText}>Share Gallery</Text>
          </TouchableOpacity>
        </View>

        {/* Fullscreen Photo Lightbox Modal */}
        {activePhoto && (
          <Modal visible={!!activePhoto} transparent animationType="fade">
            <View style={styles.lightboxOverlay}>
              <SafeAreaView style={styles.lightboxSafeArea}>
                {/* Modal Top Bar */}
                <View style={styles.lightboxTopBar}>
                  <TouchableOpacity
                    style={styles.lightboxCloseBtn}
                    onPress={() => setActivePhoto(null)}
                  >
                    <Ionicons name="close" size={24} color="#FFFFFF" />
                  </TouchableOpacity>

                  <View style={styles.lightboxTagBadge}>
                    <Text style={styles.lightboxTagText}>{activePhoto.category}</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.lightboxCloseBtn}
                    onPress={() => {
                      Share.share({ message: `${activePhoto.title} - Prayas Pariwaar Vrindavan` });
                    }}
                  >
                    <Ionicons name="share-social-outline" size={22} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>

                {/* Modal Main Image */}
                <View style={styles.lightboxImageContainer}>
                  <Image
                    source={typeof activePhoto.image === "string" ? { uri: activePhoto.image } : activePhoto.image}
                    style={styles.lightboxImage}
                    resizeMode="contain"
                  />
                </View>

                {/* Modal Bottom Caption */}
                <View style={styles.lightboxCaptionBox}>
                  <Text style={styles.lightboxTitle}>{activePhoto.title}</Text>
                  <Text style={styles.lightboxDate}>📅 {activePhoto.date} • Mathura & Vrindavan Seva</Text>
                </View>
              </SafeAreaView>
            </View>
          </Modal>
        )}
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
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 18,
    marginBottom: 12,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.2,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#166534",
  },
  albumsScroll: {
    gap: 12,
    paddingBottom: 4,
  },
  albumCard: {
    width: 108,
  },
  albumImageWrapper: {
    width: 108,
    height: 140,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#F1F5F9",
    marginBottom: 6,
    ...Shadows.soft,
  },
  albumImage: {
    width: "100%",
    height: "100%",
  },
  albumBadge: {
    position: "absolute",
    bottom: 6,
    right: 6,
    backgroundColor: "rgba(0,0,0,0.65)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
  },
  albumBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  albumTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 2,
  },
  albumDate: {
    fontSize: 9,
    color: "#94A3B8",
    fontWeight: "600",
  },
  photosGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  gridPhotoWrapper: {
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#F1F5F9",
    ...Shadows.soft,
  },
  gridPhotoImage: {
    width: "100%",
    height: "100%",
  },
  bottomBanner: {
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
  bottomBannerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  photoStackIconWrapper: {
    width: 42,
    height: 42,
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
    fontSize: 12,
    fontWeight: "800",
    color: "#164E2E",
  },
  bottomBannerSubtitle: {
    fontSize: 10,
    color: "#64748B",
    marginTop: 2,
    lineHeight: 14,
  },
  shareGalleryBtn: {
    backgroundColor: "#166534",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    ...Shadows.soft,
  },
  shareGalleryBtnText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },
  lightboxOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.92)",
  },
  lightboxSafeArea: {
    flex: 1,
    justifyContent: "space-between",
  },
  lightboxTopBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  lightboxCloseBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  lightboxTagBadge: {
    backgroundColor: "rgba(22, 101, 52, 0.8)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
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
    width: width - 20,
    height: "100%",
  },
  lightboxCaptionBox: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  lightboxTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  lightboxDate: {
    fontSize: 12,
    color: "#94A3B8",
  },
});
