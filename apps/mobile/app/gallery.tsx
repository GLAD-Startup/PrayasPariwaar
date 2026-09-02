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

const REAL_ALBUMS: Album[] = [
  {
    id: "alb-1",
    title: "Free Education & Tutoring",
    date: "Vrindavan & Mathura",
    photoCount: 140,
    image: require("../assets/images/hero-education-vrindavan.jpg"),
    category: "Free Education",
  },
  {
    id: "alb-2",
    title: "Emergency Blood Seva",
    date: "24/7 Hospital Desk",
    photoCount: 86,
    image: require("../assets/images/medical-blood-seva.jpg"),
    category: "Blood Donation",
  },
  {
    id: "alb-3",
    title: "Harit Kranti Plantation",
    date: "Parikrama Marg Drives",
    photoCount: 112,
    image: require("../assets/images/vrindavan-plantation.jpg"),
    category: "Plantation",
  },
  {
    id: "alb-4",
    title: "Free Healthcare & Eye Camps",
    date: "Rural Health Camps",
    photoCount: 95,
    image: require("../assets/images/health-camp-vrindavan.jpg"),
    category: "Healthcare",
  },
  {
    id: "alb-5",
    title: "Jeev Jal Seva & Bird Bowls",
    date: "Summer Water Mission",
    photoCount: 64,
    image: require("../assets/onboarding/jeev_jal.jpg"),
    category: "Jeev Jal Seva",
  },
  {
    id: "alb-6",
    title: "Youth Vocational Training",
    date: "Skill & Computer Center",
    photoCount: 78,
    image: require("../assets/images/youth-skills-vrindavan.jpg"),
    category: "Vocational Training",
  },
];

const REAL_PHOTOS: GalleryPhoto[] = [
  {
    id: "rp-1",
    title: "Children studying under ancient banyan tree in Vrindavan",
    category: "Free Education",
    location: "Vrindavan, Mathura",
    date: "Project Aashayein",
    image: require("../assets/images/banyan-study-vrindavan.jpg"),
  },
  {
    id: "rp-2",
    title: "Remedial evening tutoring batch at Raman Reti center",
    category: "Free Education",
    location: "Raman Reti, Vrindavan",
    date: "Daily Classes",
    image: require("../assets/images/hero-education-vrindavan.jpg"),
  },
  {
    id: "rp-3",
    title: "Inspiring rural student with school textbook",
    category: "Free Education",
    location: "Village Chhatikara",
    date: "Child Education",
    image: require("../assets/images/child-hero-portrait.jpg"),
  },
  {
    id: "rp-4",
    title: "Happy young girl with free school learning kit",
    category: "Free Education",
    location: "Mathura District",
    date: "Kit Distribution",
    image: require("../assets/images/child-hope-vrindavan.jpg"),
  },
  {
    id: "rp-5",
    title: "Voluntary donor participating at Mathura emergency blood desk",
    category: "Blood Donation",
    location: "Mathura City Hospital",
    date: "Emergency Seva",
    image: require("../assets/images/medical-blood-seva.jpg"),
  },
  {
    id: "rp-6",
    title: "Elderly patient diagnostic checkup at Chhatikara health camp",
    category: "Healthcare",
    location: "Chhatikara Village",
    date: "Free Health Camp",
    image: require("../assets/images/health-camp-vrindavan.jpg"),
  },
  {
    id: "rp-7",
    title: "Native Neem and Peepal sapling plantation along Parikrama Marg",
    category: "Plantation",
    location: "Parikrama Marg, Vrindavan",
    date: "Harit Kranti",
    image: require("../assets/images/vrindavan-plantation.jpg"),
  },
  {
    id: "rp-8",
    title: "Youth digital literacy and career vocational workshop",
    category: "Vocational Training",
    location: "Mathura Skill Center",
    date: "Project Aadhar",
    image: require("../assets/images/youth-skills-vrindavan.jpg"),
  },
  {
    id: "rp-9",
    title: "Earthen terracotta water bowl installed for thirsty birds in summer",
    category: "Jeev Jal Seva",
    location: "Vrindavan Raman Reti",
    date: "Jeev Jal Seva",
    image: require("../assets/onboarding/jeev_jal.jpg"),
  },
  {
    id: "rp-10",
    title: "Women mastering tailoring and garment manufacturing",
    category: "Vocational Training",
    location: "Vrindavan Skill Center",
    date: "Women Empowerment",
    image: require("../assets/onboarding/tailoring.jpg"),
  },
  {
    id: "rp-11",
    title: "Youth volunteers with Harit Kranti plantation banner",
    category: "Plantation",
    location: "Govardhan Road",
    date: "Afforestation Drive",
    image: require("../assets/onboarding/banner_plantation.jpg"),
  },
];

const FILTER_TABS = [
  { id: "all", label: "All Photos", icon: "grid", iconType: "ionicons" },
  { id: "Free Education", label: "Education", icon: "school-outline", iconType: "ionicons" },
  { id: "Blood Donation", label: "Blood Seva", icon: "water-outline", iconType: "ionicons" },
  { id: "Plantation", label: "Plantation", icon: "leaf-outline", iconType: "material" },
  { id: "Healthcare", label: "Health Camps", icon: "medical-outline", iconType: "ionicons" },
  { id: "Jeev Jal Seva", label: "Jeev Jal", icon: "bird", iconType: "material" },
  { id: "Vocational Training", label: "Vocational", icon: "cog-outline", iconType: "material" },
];

export default function GalleryScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [albums, setAlbums] = useState<Album[]>(REAL_ALBUMS);
  const [photos, setPhotos] = useState<GalleryPhoto[]>(REAL_PHOTOS);
  const [activePhoto, setActivePhoto] = useState<GalleryPhoto | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadGalleryData();
  }, [selectedCategory]);

  const loadGalleryData = async () => {
    try {
      // 1. Instant 0ms read from disk cache
      const cached = await getCachedData<{ albums: any[]; recentPhotos: any[] }>(`prayas_gallery_${selectedCategory}`);
      if (cached && (cached.albums?.length > 0 || cached.recentPhotos?.length > 0)) {
        if (cached.albums && cached.albums.length > 0) {
          const mappedAlbums = cached.albums.map((a: any) => ({
            id: a.id,
            title: a.title,
            date: a.location || "Vrindavan & Mathura",
            photoCount: a.photoCount || (a.photos ? a.photos.length : 12),
            image: resolveImageUrl(a.coverImage, require("../assets/images/hero-education-vrindavan.jpg")),
            category: a.category || "Free Education",
          }));
          setAlbums(mappedAlbums);
        }
        if (cached.recentPhotos && cached.recentPhotos.length > 0) {
          const mappedPhotos = cached.recentPhotos.map((p: any) => ({
            id: p.id,
            title: p.title || p.caption || "Seva Photo",
            category: p.category || "Free Education",
            location: p.location || "Vrindavan Seva",
            date: p.createdAt ? new Date(p.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }) : "Recent",
            image: resolveImageUrl(p.url, require("../assets/images/banyan-study-vrindavan.jpg")),
          }));
          setPhotos(mappedPhotos);
        }
      }

      // 2. Fetch live updates
      const url = selectedCategory === "all" ? "/gallery" : `/gallery?category=${encodeURIComponent(selectedCategory)}`;
      const res = await api.get<any>(url);
      if (res.data?.success && res.data.data) {
        const dbAlbums = res.data.data.albums || [];
        const dbPhotos = res.data.data.recentPhotos || [];
        const imageUrlsToPrefetch: string[] = [];

        let mappedAlbums: Album[] | null = null;
        let mappedPhotos: GalleryPhoto[] | null = null;

        if (dbAlbums.length > 0) {
          mappedAlbums = dbAlbums.map((a: any) => {
            const resolvedImg = resolveImageUrl(a.coverImage, require("../assets/images/hero-education-vrindavan.jpg"));
            if (typeof resolvedImg === "object" && resolvedImg.uri) {
              imageUrlsToPrefetch.push(resolvedImg.uri);
            }
            return {
              id: a.id,
              title: a.title,
              date: a.location || "Vrindavan & Mathura",
              photoCount: a.photoCount || (a.photos ? a.photos.length : 12),
              image: resolvedImg,
              category: a.category || "Free Education",
            };
          });
        }

        if (dbPhotos.length > 0) {
          mappedPhotos = dbPhotos.map((p: any) => {
            const resolvedImg = resolveImageUrl(p.url, require("../assets/images/banyan-study-vrindavan.jpg"));
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
        }

        if (imageUrlsToPrefetch.length > 0) {
          await prefetchRemoteImages(imageUrlsToPrefetch);
        }

        await setCachedData(`prayas_gallery_${selectedCategory}`, res.data.data);
        if (mappedAlbums) setAlbums(mappedAlbums);
        if (mappedPhotos) setPhotos(mappedPhotos);
      }
    } catch (e) {
      console.warn("Gallery API offline, displaying authentic local assets", e);
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
                      source={typeof album.image === "string" ? { uri: album.image } : album.image}
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
              <View style={styles.gridPhotoOverlay}>
                <Ionicons name="expand-outline" size={13} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

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
                    source={typeof activePhoto.image === "string" ? { uri: activePhoto.image } : activePhoto.image}
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
});
