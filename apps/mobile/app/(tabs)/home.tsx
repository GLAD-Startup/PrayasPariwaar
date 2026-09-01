import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  FlatList,
  RefreshControl,
  StatusBar,
  Modal,
  Alert,
  Linking,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { Colors, Shadows } from "../../lib/theme";
import { api, resolveImageUrl } from "../../lib/api";
import { getCachedData, setCachedData } from "../../lib/cache";
import { prefetchRemoteImages } from "../../lib/assetPreloader";
import SidebarDrawer from "../../components/SidebarDrawer";
import ActionDialog from "../../components/ActionDialog";

const { width } = Dimensions.get("window");
const HERO_CARD_WIDTH = width - 32;

interface HeroSlide {
  id: string;
  image: any;
  titlePrefix: string;
  titleHighlight: string;
  subtitle: string;
  buttonText: string;
  route: string;
}

const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  {
    id: "1",
    image: require("../../assets/images/hero-education-vrindavan.jpg"),
    titlePrefix: "Together,\nWe Can Make\n",
    titleHighlight: "a Difference",
    subtitle: "Serving society through education, health, nature and skills.",
    buttonText: "Know More",
    route: "/seva/education",
  },
  {
    id: "2",
    image: require("../../assets/images/medical-blood-seva.jpg"),
    titlePrefix: "Every Drop Can\nSave a Life\n",
    titleHighlight: "Emergency Seva",
    subtitle: "24/7 voluntary blood donor network in Mathura & Vrindavan.",
    buttonText: "Donate Blood",
    route: "/seva/blood-donation",
  },
  {
    id: "3",
    image: require("../../assets/images/vrindavan-plantation.jpg"),
    titlePrefix: "Plant a Tree,\nNurture Life\n",
    titleHighlight: "Harit Kranti",
    subtitle: "Over 10,000 native tree saplings along sacred Braj Parikrama.",
    buttonText: "Join Drive",
    route: "/seva/plantation",
  },
];

const SERVICE_STREAMS = [
  {
    id: "education",
    title: "Free\nEducation",
    label: "Education",
    icon: "school-outline",
    iconType: "ionicons",
    bgColor: "#F0FDF4",
    borderColor: "#86EFAC",
    iconColor: "#16A34A",
    route: "/seva/education",
  },
  {
    id: "blood-donation",
    title: "Blood\nDonation",
    label: "Blood Seva",
    icon: "water-outline",
    iconType: "ionicons",
    bgColor: "#FEF2F2",
    borderColor: "#FCA5A5",
    iconColor: "#DC2626",
    route: "/seva/blood-donation",
  },
  {
    id: "plantation",
    title: "Tree\nPlantation",
    label: "Plantation",
    icon: "sprout-outline",
    iconType: "material",
    bgColor: "#F0FDF4",
    borderColor: "#86EFAC",
    iconColor: "#15803D",
    route: "/seva/plantation",
  },
  {
    id: "jeev-jal",
    title: "Jeev Jal\nSeva",
    label: "Jeev Jal",
    icon: "bird",
    iconType: "material",
    bgColor: "#EFF6FF",
    borderColor: "#93C5FD",
    iconColor: "#2563EB",
    route: "/seva/jeev-jal",
  },
  {
    id: "vocational",
    title: "Vocational\nTraining",
    label: "Vocational",
    icon: "cog-outline",
    iconType: "material",
    bgColor: "#FAF5FF",
    borderColor: "#D8B4FE",
    iconColor: "#9333EA",
    route: "/seva/vocational",
  },
];

const LATEST_UPDATES = [
  {
    id: "learning-center-rohini",
    tag: "Education",
    tagBg: "#16A34A",
    title: "Remedial Study Center Active in Raman Reti",
    date: "12 May 2024",
    image: require("../../assets/images/banyan-study-vrindavan.jpg"),
  },
  {
    id: "blood-donation-city-hospital",
    tag: "Blood Donation",
    tagBg: "#DC2626",
    title: "Rapid Emergency Blood Dispatch at City Hospital",
    date: "10 May 2024",
    image: require("../../assets/images/medical-blood-seva.jpg"),
  },
  {
    id: "tree-plantation-green-valley",
    tag: "Plantation",
    tagBg: "#15803D",
    title: "Neem & Peepal Sapling Plantation Drive on Parikrama Marg",
    date: "08 May 2024",
    image: require("../../assets/images/vrindavan-plantation.jpg"),
  },
  {
    id: "free-health-camp-chhatikara",
    tag: "Healthcare",
    tagBg: "#0284C7",
    title: "Free Pediatric & Eye Screening Camp in Village Chhatikara",
    date: "05 May 2024",
    image: require("../../assets/images/health-camp-vrindavan.jpg"),
  },
];

export default function MobileHomeScreen() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [eventModalVisible, setEventModalVisible] = useState(false);
  const [helplineModalVisible, setHelplineModalVisible] = useState(false);
  const heroListRef = useRef<FlatList>(null);

  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(DEFAULT_HERO_SLIDES);
  const [latestUpdates, setLatestUpdates] = useState<any[]>(LATEST_UPDATES);
  const [galleryPhotos, setGalleryPhotos] = useState<any[]>([]);
  const [isReady, setIsReady] = useState(false);
  const pageFadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      // 1. Instant 0ms cache read from disk on startup
      const [cachedProjects, cachedPosts, cachedGallery] = await Promise.all([
        getCachedData<any[]>("prayas_projects"),
        getCachedData<any[]>("prayas_blog_posts"),
        getCachedData<any[]>("prayas_gallery"),
      ]);

      if (cachedProjects && Array.isArray(cachedProjects) && cachedProjects.length > 0) {
        const slides: HeroSlide[] = cachedProjects.slice(0, 4).map((p: any) => ({
          id: p.id,
          image: resolveImageUrl(p.coverImage, require("../../assets/images/hero-education-vrindavan.jpg")),
          titlePrefix: `${p.title}\n`,
          titleHighlight: p.category ? p.category.replace("_", " ") : "Seva Initiative",
          subtitle: p.description ? `${p.description.substring(0, 75)}...` : "Serving humanity in Vrindavan & Mathura.",
          buttonText: "Know More",
          route: `/seva/${p.slug || p.id}`,
        }));
        setHeroSlides(slides);
      }

      if (cachedPosts && Array.isArray(cachedPosts) && cachedPosts.length > 0) {
        const updates = cachedPosts.slice(0, 6).map((post: any) => ({
          id: post.id || post.slug,
          tag: post.category || "Dispatch",
          tagBg: Colors.primary,
          title: post.title,
          date: new Date(post.createdAt || Date.now()).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
          image: resolveImageUrl(post.coverImage, require("../../assets/images/banyan-study-vrindavan.jpg")),
        }));
        setLatestUpdates(updates);
      }

      if (cachedGallery && Array.isArray(cachedGallery) && cachedGallery.length > 0) {
        setGalleryPhotos(cachedGallery.slice(0, 6));
      }

      // 2. Fetch live updates in parallel
      const [projectsResult, postsResult, galleryResult] = await Promise.allSettled([
        api.get<any>("/projects"),
        api.get<any>("/posts"),
        api.get<any>("/gallery"),
      ]);

      const remoteImageUrlsToPrefetch: string[] = [];
      let nextHeroSlides: HeroSlide[] | null = null;
      let nextUpdates: any[] | null = null;
      let nextGallery: any[] | null = null;

      // 1. Process Projects
      if (projectsResult.status === "fulfilled" && projectsResult.value.data?.success && Array.isArray(projectsResult.value.data.data)) {
        const liveProjects = projectsResult.value.data.data;
        if (liveProjects.length > 0) {
          await setCachedData("prayas_projects", liveProjects);
          nextHeroSlides = liveProjects.slice(0, 4).map((p: any) => {
            const resolvedImg = resolveImageUrl(p.coverImage, require("../../assets/images/hero-education-vrindavan.jpg"));
            if (typeof resolvedImg === "object" && resolvedImg.uri) {
              remoteImageUrlsToPrefetch.push(resolvedImg.uri);
            }
            return {
              id: p.id,
              image: resolvedImg,
              titlePrefix: `${p.title}\n`,
              titleHighlight: p.category ? p.category.replace("_", " ") : "Seva Initiative",
              subtitle: p.description ? `${p.description.substring(0, 75)}...` : "Serving humanity in Vrindavan & Mathura.",
              buttonText: "Know More",
              route: `/seva/${p.slug || p.id}`,
            };
          });
        }
      }

      // 2. Process Posts / Dispatches
      if (postsResult.status === "fulfilled" && postsResult.value.data?.success && Array.isArray(postsResult.value.data.data)) {
        const livePosts = postsResult.value.data.data;
        if (livePosts.length > 0) {
          await setCachedData("prayas_blog_posts", livePosts);
          nextUpdates = livePosts.slice(0, 6).map((post: any) => {
            const resolvedImg = resolveImageUrl(post.coverImage, require("../../assets/images/banyan-study-vrindavan.jpg"));
            if (typeof resolvedImg === "object" && resolvedImg.uri) {
              remoteImageUrlsToPrefetch.push(resolvedImg.uri);
            }
            return {
              id: post.id || post.slug,
              tag: post.category || "Dispatch",
              tagBg: Colors.primary,
              title: post.title,
              date: new Date(post.createdAt).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }),
              image: resolvedImg,
            };
          });
        }
      }

      // 3. Process Gallery
      if (galleryResult.status === "fulfilled" && galleryResult.value.data?.success && Array.isArray(galleryResult.value.data.data)) {
        const photos = galleryResult.value.data.data.slice(0, 6);
        if (photos.length > 0) {
          await setCachedData("prayas_gallery", photos);
          nextGallery = photos;
          photos.forEach((p: any) => {
            if (p.url && p.url.startsWith("http")) {
              remoteImageUrlsToPrefetch.push(p.url);
            }
          });
        }
      }

      // Prefetch all extracted remote URLs in parallel so they don't pop-in
      if (remoteImageUrlsToPrefetch.length > 0) {
        await prefetchRemoteImages(remoteImageUrlsToPrefetch);
      }

      // Atomically commit all state changes together
      if (nextHeroSlides) setHeroSlides(nextHeroSlides);
      if (nextUpdates) setLatestUpdates(nextUpdates);
      if (nextGallery) setGalleryPhotos(nextGallery);
    } catch (e) {
      console.warn("Failed to load home data from API:", e);
    } finally {
      setIsReady(true);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHomeData();
    setRefreshing(false);
  };

  const handleCallEmergency = () => {
    Linking.openURL("tel:+919412279001").catch(() => {
      setHelplineModalVisible(true);
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Header Bar */}
      <View style={styles.header}>
        {/* Sidebar Navigation Hamburger Menu */}
        <TouchableOpacity
          style={styles.headerIconButton}
          onPress={() => setSidebarOpen(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="menu" size={24} color="#1E293B" />
        </TouchableOpacity>

        {/* Center Brand Logo & Title */}
        <View style={styles.headerBrandCenter}>
          <Image
            source={require("../../assets/images/prayas-logo-blue.png")}
            style={styles.headerLogoImg}
            resizeMode="contain"
          />
          <View style={styles.headerTextCol}>
            <Text style={styles.headerOrgName}>PRAYAS</Text>
            <Text style={styles.headerTagline}>A Trial to Move Ahead</Text>
          </View>
        </View>

        {/* Notification Bell with Badge */}
        <TouchableOpacity
          style={styles.headerIconButton}
          onPress={() => router.push("/notifications")}
          activeOpacity={0.8}
        >
          <View style={styles.bellWrapper}>
            <Ionicons name="notifications-outline" size={22} color="#1E293B" />
            <View style={styles.redBadgeDot} />
          </View>
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
        {/* Featured Hero Carousel Banner */}
        <View style={styles.heroSection}>
          <FlatList
            ref={heroListRef}
            data={heroSlides}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / HERO_CARD_WIDTH);
              setCurrentSlideIndex(index);
            }}
            renderItem={({ item }) => (
              <View style={[styles.heroCard, { width: HERO_CARD_WIDTH }]}>
                <Image
                  source={typeof item.image === "string" ? { uri: item.image } : item.image}
                  style={styles.heroImage}
                  resizeMode="cover"
                />
                <View style={styles.heroOverlay} />

                {/* Hero Text Content */}
                <View style={styles.heroContent}>
                  <Text style={styles.heroTitle}>
                    {item.titlePrefix}
                    <Text style={styles.heroTitleHighlight}>{item.titleHighlight}</Text>
                  </Text>
                  <Text style={styles.heroSubtitle}>{item.subtitle}</Text>

                  {/* CTA Button */}
                  <TouchableOpacity
                    style={styles.heroButton}
                    onPress={() => router.push(item.route as any)}
                    activeOpacity={0.88}
                  >
                    <Text style={styles.heroButtonText}>{item.buttonText}</Text>
                    <View style={styles.heroButtonArrowCircle}>
                      <Ionicons name="arrow-forward" size={12} color="#FFFFFF" />
                    </View>
                  </TouchableOpacity>
                </View>

                {/* Pagination Dots */}
                <View style={styles.heroPagination}>
                  {heroSlides.map((_, i) => (
                    <View
                      key={i}
                      style={[
                        styles.heroDot,
                        currentSlideIndex === i && styles.heroDotActive,
                      ]}
                    />
                  ))}
                </View>
              </View>
            )}
            keyExtractor={(item) => item.id}
          />
        </View>

        {/* ===================== ENHANCED SERVICE STREAMS (COMPACT CARDS ONLY) ===================== */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Our Service Streams</Text>
            <View style={styles.streamCountBadge}>
              <Text style={styles.streamCountBadgeText}>5 Pillars</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/seva")}
            style={styles.viewAllRow}
            activeOpacity={0.7}
          >
            <Text style={styles.viewAllText}>All Projects</Text>
            <Ionicons name="chevron-forward" size={13} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* 5 Prominent Enhanced Small Stream Cards */}
        <View style={styles.servicesGrid}>
          {SERVICE_STREAMS.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.serviceItem}
              onPress={() => router.push(item.route as any)}
              activeOpacity={0.82}
            >
              <View
                style={[
                  styles.serviceBox,
                  { backgroundColor: item.bgColor, borderColor: item.borderColor },
                ]}
              >
                {item.iconType === "ionicons" ? (
                  <Ionicons name={item.icon as any} size={28} color={item.iconColor} />
                ) : (
                  <MaterialCommunityIcons name={item.icon as any} size={28} color={item.iconColor} />
                )}
              </View>
              <Text style={styles.serviceItemLabel} numberOfLines={2}>
                {item.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Section: Latest Updates */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Latest Seva Dispatches</Text>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/blogs")}
            style={styles.viewAllRow}
            activeOpacity={0.7}
          >
            <Text style={styles.viewAllText}>View All</Text>
            <Ionicons name="chevron-forward" size={13} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.updatesScroll}
        >
          {latestUpdates.map((card) => (
            <TouchableOpacity
              key={card.id}
              style={styles.updateCard}
              onPress={() => router.push(`/blog/${card.id}` as any)}
              activeOpacity={0.88}
            >
              <View style={styles.updateImageWrapper}>
                <Image
                  source={typeof card.image === "string" ? { uri: card.image } : card.image}
                  style={styles.updateImage}
                  resizeMode="cover"
                />
                <View style={[styles.updatePill, { backgroundColor: card.tagBg }]}>
                  <Text style={styles.updatePillText}>{card.tag}</Text>
                </View>
              </View>

              <View style={styles.updateContent}>
                <Text style={styles.updateTitle} numberOfLines={2}>
                  {card.title}
                </Text>
                <View style={styles.updateDateRow}>
                  <Ionicons name="calendar-outline" size={12} color="#94A3B8" style={{ marginRight: 4 }} />
                  <Text style={styles.updateDateText}>{card.date}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Dynamic Field Photo Gallery Strip */}
        {galleryPhotos.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Field Photo Gallery</Text>
              <TouchableOpacity
                onPress={() => router.push("/gallery")}
                style={styles.viewAllRow}
                activeOpacity={0.7}
              >
                <Text style={styles.viewAllText}>View All ({galleryPhotos.length})</Text>
                <Ionicons name="chevron-forward" size={13} color={Colors.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.updatesScroll}
            >
              {galleryPhotos.map((photo: any) => (
                <TouchableOpacity
                  key={photo.id}
                  style={[styles.updateCard, { width: 145 }]}
                  onPress={() => router.push("/gallery")}
                  activeOpacity={0.88}
                >
                  <View style={[styles.updateImageWrapper, { height: 105 }]}>
                    <Image
                      source={resolveImageUrl(photo.url)}
                      style={styles.updateImage}
                      resizeMode="cover"
                    />
                    <View style={[styles.updatePill, { backgroundColor: "rgba(0,0,0,0.7)" }]}>
                      <Text style={styles.updatePillText}>{photo.category || "Seva"}</Text>
                    </View>
                  </View>
                  <View style={[styles.updateContent, { padding: 9 }]}>
                    <Text style={[styles.updateTitle, { fontSize: 11, height: 32, color: "#0F172A", fontWeight: "700" }]} numberOfLines={2}>
                      {photo.title || "Seva Moment"}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        {/* Upcoming Event Featured Card */}
        <View style={styles.eventCard}>
          <View style={styles.eventLeft}>
            <View style={styles.eventCalendarCircle}>
              <Ionicons name="calendar-outline" size={22} color="#D97706" />
            </View>

            <View style={styles.eventInfo}>
              <Text style={styles.eventTag}>Upcoming Event</Text>
              <Text style={styles.eventTitle}>Mega Blood Donation Camp</Text>
              <Text style={styles.eventTime}>Sunday, 9:00 AM – 4:00 PM</Text>
              <View style={styles.eventLocRow}>
                <Ionicons name="location-outline" size={11} color="#64748B" style={{ marginRight: 3 }} />
                <Text style={styles.eventLocation}>District Hospital, Mathura</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.eventDetailsBtn}
            onPress={() => setEventModalVisible(true)}
            activeOpacity={0.88}
          >
            <Text style={styles.eventDetailsBtnText}>Details</Text>
          </TouchableOpacity>
        </View>

        {/* Dual Action Cards (Donate & Volunteer) */}
        <View style={styles.dualActionRow}>
          {/* Donate Card */}
          <TouchableOpacity
            style={[styles.actionBannerCard, styles.donateBannerCard]}
            onPress={() => router.push("/(tabs)/donate")}
            activeOpacity={0.85}
          >
            <View style={styles.actionIconCircle}>
              <MaterialCommunityIcons name="hand-heart" size={20} color="#166534" />
            </View>
            <View style={styles.actionBannerContent}>
              <Text style={[styles.actionBannerTitle, { color: "#166534" }]}>Donate Seva</Text>
              <Text style={styles.actionBannerSubtitle}>
                Support rural education, blood camps & tree plantation.
              </Text>
            </View>
            <View style={[styles.actionArrowCircle, { backgroundColor: "#166534" }]}>
              <Ionicons name="arrow-forward" size={12} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          {/* Volunteer Card */}
          <TouchableOpacity
            style={[styles.actionBannerCard, styles.volunteerBannerCard]}
            onPress={() => router.push("/volunteer-form")}
            activeOpacity={0.85}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: "#EFF6FF", borderColor: "#BFDBFE" }]}>
              <MaterialCommunityIcons name="account-group" size={20} color="#1D4ED8" />
            </View>
            <View style={styles.actionBannerContent}>
              <Text style={[styles.actionBannerTitle, { color: "#1D4ED8" }]}>Join Seva</Text>
              <Text style={styles.actionBannerSubtitle}>
                Be a part of 850+ volunteer taskforce in Braj.
              </Text>
            </View>
            <View style={[styles.actionArrowCircle, { backgroundColor: "#1D4ED8" }]}>
              <Ionicons name="arrow-forward" size={12} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        </View>

        {/* ===================== REQUEST MEDICAL EQUIPMENT BANK SECTION ===================== */}
        <View style={styles.medicalEquipmentSection}>
          <View style={styles.medicalEquipmentCard}>
            {/* Top Badge & Header */}
            <View style={styles.medicalCardTopRow}>
              <View style={styles.medicalPillBadge}>
                <MaterialCommunityIcons name="hospital-box" size={13} color="#0D9488" style={{ marginRight: 4 }} />
                <Text style={styles.medicalPillBadgeText}>FREE MEDICAL AID</Text>
              </View>
              <View style={styles.medical24Badge}>
                <Text style={styles.medical24BadgeText}>24/7 Helpline</Text>
              </View>
            </View>

            <Text style={styles.medicalCardTitle}>Medical Equipment Bank</Text>
            <Text style={styles.medicalCardSubtitle}>
              Need medical equipment for a recovering or homebound patient in Mathura / Vrindavan? Borrow for free with zero rental charges.
            </Text>

            {/* Quick Equipment Tags */}
            <View style={styles.equipmentTagsGrid}>
              <View style={styles.equipmentTagItem}>
                <Ionicons name="checkmark-circle" size={13} color="#0D9488" style={{ marginRight: 4 }} />
                <Text style={styles.equipmentTagText}>10L Oxygen Concentrators</Text>
              </View>
              <View style={styles.equipmentTagItem}>
                <Ionicons name="checkmark-circle" size={13} color="#0D9488" style={{ marginRight: 4 }} />
                <Text style={styles.equipmentTagText}>Foldable Wheelchairs</Text>
              </View>
              <View style={styles.equipmentTagItem}>
                <Ionicons name="checkmark-circle" size={13} color="#0D9488" style={{ marginRight: 4 }} />
                <Text style={styles.equipmentTagText}>Adjustable Hospital Beds</Text>
              </View>
              <View style={styles.equipmentTagItem}>
                <Ionicons name="checkmark-circle" size={13} color="#0D9488" style={{ marginRight: 4 }} />
                <Text style={styles.equipmentTagText}>Anti-Bedsore Air Mattresses</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.medicalActionsRow}>
              <TouchableOpacity
                style={styles.medicalRequestBtn}
                onPress={() => router.push("/medical-request")}
                activeOpacity={0.88}
              >
                <MaterialCommunityIcons name="clipboard-pulse-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.medicalRequestBtnText}>Request Equipment</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.medicalCallBtn}
                onPress={handleCallEmergency}
                activeOpacity={0.85}
              >
                <Ionicons name="call" size={15} color="#0D9488" style={{ marginRight: 5 }} />
                <Text style={styles.medicalCallBtnText}>Call Desk</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Event Details Modal */}
        <Modal visible={eventModalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Event Information</Text>
                <TouchableOpacity onPress={() => setEventModalVisible(false)}>
                  <Ionicons name="close-circle" size={22} color="#64748B" />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalEventHeading}>🩸 Mega Voluntary Blood Donation Camp</Text>
              <Text style={styles.modalEventText}>
                Organized by Seva Dham Trust (Prayas Pariwaar) in collaboration with District Hospital Mathura. All donors will receive healthy refreshments and voluntary donor recognition cards.
              </Text>

              <View style={styles.modalMetaBox}>
                <Text style={styles.modalMetaItem}>📅 Date: Sunday, 26 May 2024</Text>
                <Text style={styles.modalMetaItem}>⏰ Time: 9:00 AM – 4:00 PM</Text>
                <Text style={styles.modalMetaItem}>📍 Venue: District Hospital, Mathura</Text>
                <Text style={styles.modalMetaItem}>📞 Helpline: +91 94122 79001</Text>
              </View>

              <TouchableOpacity
                style={styles.modalRegisterBtn}
                onPress={() => {
                  setEventModalVisible(false);
                  router.push("/blood-donor-registration");
                }}
                activeOpacity={0.88}
              >
                <Text style={styles.modalRegisterBtnText}>Register as Donor →</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>

      {/* Helpline ActionDialog */}
      <ActionDialog
        visible={helplineModalVisible}
        onClose={() => setHelplineModalVisible(false)}
        title="24/7 Seva Helpline Desk"
        badge="EMERGENCY SUPPORT"
        description="Connect with Prayas Seva Coordination Desk for immediate emergency blood, ambulance, or medical oxygen support in Vrindavan & Mathura."
        icon="call-outline"
        type="primary"
        confirmText="Call +91 94122 79001"
        onConfirm={() => {
          setHelplineModalVisible(false);
          Linking.openURL("tel:+919412279001");
        }}
        cancelText="Close"
        showCancel={true}
      />

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
  headerIconButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  headerBrandCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerLogoImg: {
    width: 36,
    height: 36,
    borderRadius: 8,
  },
  headerTextCol: {
    alignItems: "flex-start",
  },
  headerOrgName: {
    fontSize: 16,
    fontWeight: "900",
    color: "#1E3A8A",
    letterSpacing: 0.8,
  },
  headerTagline: {
    fontSize: 10,
    color: "#1D4ED8",
    fontWeight: "700",
  },
  bellWrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  redBadgeDot: {
    position: "absolute",
    top: 1,
    right: 1,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#EF4444",
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
  },
  heroCard: {
    height: 185,
    borderRadius: 14,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#0F172A",
    ...Shadows.card,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
  },
  heroContent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    justifyContent: "space-between",
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
    lineHeight: 22,
    letterSpacing: -0.2,
  },
  heroTitleHighlight: {
    color: "#FBBF24",
    fontWeight: "900",
  },
  heroSubtitle: {
    fontSize: 11,
    color: "#E2E8F0",
    marginTop: -3,
    maxWidth: 240,
    lineHeight: 15,
  },
  heroButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: "flex-start",
    gap: 5,
    ...Shadows.soft,
  },
  heroButtonText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#166534",
  },
  heroButtonArrowCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#166534",
    alignItems: "center",
    justifyContent: "center",
  },
  heroPagination: {
    position: "absolute",
    bottom: 10,
    right: 14,
    flexDirection: "row",
    gap: 4,
  },
  heroDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
  },
  heroDotActive: {
    width: 14,
    backgroundColor: "#FFFFFF",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 10,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.2,
  },
  streamCountBadge: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  streamCountBadgeText: {
    color: "#166534",
    fontSize: 10,
    fontWeight: "800",
  },
  viewAllRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  viewAllText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#166534",
  },

  /* Enhanced Service Stream Small Cards Grid */
  servicesGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  serviceItem: {
    alignItems: "center",
    width: (width - 32) / 5,
  },
  serviceBox: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    marginBottom: 6,
    ...Shadows.card,
  },
  serviceItemLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#1E293B",
    textAlign: "center",
    lineHeight: 13,
  },

  /* Updates */
  updatesScroll: {
    paddingLeft: 16,
    paddingRight: 8,
    paddingBottom: 4,
    gap: 10,
  },
  updateCard: {
    width: 170,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
    ...Shadows.soft,
  },
  updateImageWrapper: {
    height: 100,
    position: "relative",
  },
  updateImage: {
    width: "100%",
    height: "100%",
  },
  updatePill: {
    position: "absolute",
    bottom: 6,
    left: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
  },
  updatePillText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "800",
  },
  updateContent: {
    padding: 10,
  },
  updateTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0F172A",
    lineHeight: 15,
    height: 30,
  },
  updateDateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  updateDateText: {
    fontSize: 10,
    color: "#94A3B8",
    fontWeight: "600",
  },

  /* Event Card */
  eventCard: {
    backgroundColor: "#FFFBEB",
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#FDE68A",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...Shadows.soft,
  },
  eventLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  eventCalendarCircle: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  eventInfo: {
    flex: 1,
  },
  eventTag: {
    fontSize: 9,
    fontWeight: "800",
    color: "#D97706",
    letterSpacing: 0.4,
    marginBottom: 1,
  },
  eventTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#1E293B",
  },
  eventTime: {
    fontSize: 10,
    color: "#64748B",
    marginTop: 1,
    fontWeight: "600",
  },
  eventLocRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 1,
  },
  eventLocation: {
    fontSize: 9,
    color: "#64748B",
  },
  eventDetailsBtn: {
    backgroundColor: "#166534",
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.soft,
  },
  eventDetailsBtnText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },

  /* Dual Action */
  dualActionRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginTop: 12,
    gap: 10,
  },
  actionBannerCard: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    flexDirection: "column",
    justifyContent: "space-between",
    minHeight: 110,
    ...Shadows.soft,
  },
  donateBannerCard: {
    backgroundColor: "#F0FDF4",
    borderColor: "#BBF7D0",
  },
  volunteerBannerCard: {
    backgroundColor: "#EFF6FF",
    borderColor: "#BFDBFE",
  },
  actionIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    marginBottom: 6,
  },
  actionBannerContent: {
    flex: 1,
  },
  actionBannerTitle: {
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 2,
  },
  actionBannerSubtitle: {
    fontSize: 10,
    color: "#64748B",
    lineHeight: 13,
  },
  actionArrowCircle: {
    width: 20,
    height: 20,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-end",
    marginTop: 4,
  },

  /* Medical Equipment Bank Section */
  medicalEquipmentSection: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  medicalEquipmentCard: {
    backgroundColor: "#F0FDFA",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#99F6E4",
    padding: 14,
    ...Shadows.card,
  },
  medicalCardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  medicalPillBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#CCFBF1",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  medicalPillBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#0F766E",
    letterSpacing: 0.3,
  },
  medical24Badge: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#99F6E4",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  medical24BadgeText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#0D9488",
  },
  medicalCardTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#134E4A",
    marginBottom: 3,
  },
  medicalCardSubtitle: {
    fontSize: 11,
    color: "#475569",
    lineHeight: 15,
    marginBottom: 10,
  },
  equipmentTagsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 12,
  },
  equipmentTagItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CCFBF1",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  equipmentTagText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#115E59",
  },
  medicalActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  medicalRequestBtn: {
    flex: 1.4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0D9488",
    paddingVertical: 10,
    borderRadius: 8,
    ...Shadows.soft,
  },
  medicalRequestBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  medicalCallBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#99F6E4",
    paddingVertical: 10,
    borderRadius: 8,
  },
  medicalCallBtnText: {
    color: "#0D9488",
    fontSize: 12,
    fontWeight: "800",
  },

  /* Modals */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#164E2E",
  },
  modalEventHeading: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 6,
  },
  modalEventText: {
    fontSize: 12,
    color: "#475569",
    lineHeight: 18,
    marginBottom: 12,
  },
  modalMetaBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    padding: 12,
    gap: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  modalMetaItem: {
    fontSize: 11,
    color: "#334155",
    fontWeight: "600",
  },
  modalRegisterBtn: {
    backgroundColor: "#166534",
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.primaryBtn,
  },
  modalRegisterBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
});
