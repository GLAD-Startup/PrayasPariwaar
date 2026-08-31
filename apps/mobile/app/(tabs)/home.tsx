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
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { Colors, Shadows } from "../../lib/theme";
import { api, resolveImageUrl } from "../../lib/api";

const { width } = Dimensions.get("window");
const HERO_CARD_WIDTH = width - 40;

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
    image: require("../../assets/onboarding/education.jpg"),
    titlePrefix: "Together,\nWe Can Make\n",
    titleHighlight: "a Difference",
    subtitle: "Serving society through education, health, nature and skills.",
    buttonText: "Know More",
    route: "/seva/education",
  },
  {
    id: "2",
    image: require("../../assets/onboarding/blood.jpg"),
    titlePrefix: "Every Drop Can\nSave a Life\n",
    titleHighlight: "Emergency Seva",
    subtitle: "24/7 voluntary blood donor network in Mathura & Vrindavan.",
    buttonText: "Donate Blood",
    route: "/seva/blood-donation",
  },
  {
    id: "3",
    image: require("../../assets/onboarding/plantation.jpg"),
    titlePrefix: "Plant a Tree,\nNurture Life\n",
    titleHighlight: "Harit Kranti",
    subtitle: "Over 10,000 native tree saplings along sacred Braj Parikrama.",
    buttonText: "Join Drive",
    route: "/seva/plantation",
  },
];

const SERVICE_STREAMS = [
  {
    id: "edu",
    title: "Free\nEducation",
    icon: "school-outline",
    iconType: "ionicons",
    bgColor: "#F0FDF4",
    borderColor: "#BBF7D0",
    iconColor: "#16A34A",
    route: "/seva/education",
  },
  {
    id: "blood",
    title: "Blood\nDonation",
    icon: "water-outline",
    iconType: "ionicons",
    bgColor: "#FEF2F2",
    borderColor: "#FECACA",
    iconColor: "#DC2626",
    route: "/seva/blood-donation",
  },
  {
    id: "plant",
    title: "Plantation",
    icon: "sprout-outline",
    iconType: "material",
    bgColor: "#F0FDF4",
    borderColor: "#BBF7D0",
    iconColor: "#15803D",
    route: "/seva/plantation",
  },
  {
    id: "jeev",
    title: "Jeev Jal\nSeva",
    icon: "bird",
    iconType: "material",
    bgColor: "#EFF6FF",
    borderColor: "#BFDBFE",
    iconColor: "#2563EB",
    route: "/seva/jeev-jal",
  },
  {
    id: "equip",
    title: "Vocational\nTraining",
    icon: "cog-outline",
    iconType: "material",
    bgColor: "#FAF5FF",
    borderColor: "#E9D5FF",
    iconColor: "#9333EA",
    route: "/seva/vocational",
  },
];

const LATEST_UPDATES = [
  {
    id: "learning-center-rohini",
    tag: "Education",
    tagBg: "#16A34A",
    title: "New Class Started for Underprivileged Children",
    date: "12 May 2024",
    image: require("../../assets/onboarding/education.jpg"),
  },
  {
    id: "blood-donation-city-hospital",
    tag: "Blood Donation",
    tagBg: "#DC2626",
    title: "Successful Blood Donation Camp at City Hospital",
    date: "10 May 2024",
    image: require("../../assets/onboarding/blood.jpg"),
  },
  {
    id: "tree-plantation-green-valley",
    tag: "Plantation",
    tagBg: "#15803D",
    title: "Tree Plantation Drive at Green Valley Park",
    date: "08 May 2024",
    image: require("../../assets/onboarding/plantation.jpg"),
  },
  {
    id: "vocational-training-youth",
    tag: "Equipment",
    tagBg: "#9333EA",
    title: "10L Oxygen Concentrators Deployed for Free Loan",
    date: "05 May 2024",
    image: require("../../assets/onboarding/equipment.jpg"),
  },
];

export default function MobileHomeScreen() {
  const router = useRouter();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [eventModalVisible, setEventModalVisible] = useState(false);
  const heroListRef = useRef<FlatList>(null);

  // Dynamic schema states
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(DEFAULT_HERO_SLIDES);
  const [latestUpdates, setLatestUpdates] = useState<any[]>(LATEST_UPDATES);
  const [galleryPhotos, setGalleryPhotos] = useState<any[]>([]);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      // 1. Fetch live Projects
      const projectsRes = await api.get<any>("/projects");
      if (projectsRes.data?.success && Array.isArray(projectsRes.data.data) && projectsRes.data.data.length > 0) {
        const liveProjects = projectsRes.data.data;
        const slides: HeroSlide[] = liveProjects.slice(0, 4).map((p: any) => ({
          id: p.id,
          image: resolveImageUrl(p.coverImage, require("../../assets/onboarding/education.jpg")),
          titlePrefix: `${p.title}\n`,
          titleHighlight: p.category ? p.category.replace("_", " ") : "Seva Initiative",
          subtitle: p.description ? `${p.description.substring(0, 75)}...` : "Serving humanity in Vrindavan & Mathura.",
          buttonText: "Know More",
          route: `/seva/${p.slug || p.id}`,
        }));
        setHeroSlides(slides);
      }

      // 2. Fetch live Posts / Dispatches
      const postsRes = await api.get<any>("/posts");
      if (postsRes.data?.success && Array.isArray(postsRes.data.data) && postsRes.data.data.length > 0) {
        const livePosts = postsRes.data.data;
        const updates = livePosts.slice(0, 6).map((post: any) => ({
          id: post.id || post.slug,
          tag: post.category || "Dispatch",
          tagBg: post.category === "EDUCATION" ? "#16A34A" : post.category === "HEALTH" ? "#DC2626" : "#15803D",
          title: post.title,
          date: post.createdAt
            ? new Date(post.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
            : "Ongoing",
          image: resolveImageUrl(
            post.images?.[0]?.url || post.coverImage,
            require("../../assets/onboarding/education.jpg")
          ),
        }));
        setLatestUpdates(updates);
      }

      // 3. Fetch live Gallery
      const galleryRes = await api.get<any>("/gallery");
      if (galleryRes.data?.success && galleryRes.data.data) {
        const photos = galleryRes.data.data.recentPhotos || [];
        if (photos.length > 0) {
          setGalleryPhotos(photos);
        }
      }
    } catch (e) {
      console.warn("Failed to load home data from API:", e);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHomeData();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Header Bar */}
      <View style={styles.header}>
        {/* Hamburger Menu */}
        <TouchableOpacity
          style={styles.headerIconButton}
          onPress={() => router.push("/(tabs)/profile")}
          activeOpacity={0.8}
        >
          <Ionicons name="menu" size={26} color="#1E293B" />
        </TouchableOpacity>

        {/* Center Brand Logo & Title */}
        <View style={styles.headerBrandCenter}>
          <View style={styles.headerEmblem}>
            <Ionicons name="sunny-outline" size={20} color="#F59E0B" style={styles.headerSun} />
            <MaterialCommunityIcons name="hand-heart" size={16} color="#166534" />
          </View>
          <View style={styles.headerTextCol}>
            <Text style={styles.headerOrgName}>Prayas Pariwaar</Text>
            <Text style={styles.headerTagline}>Serving Humanity • Vrindavan</Text>
          </View>
        </View>

        {/* Notification Bell with Badge */}
        <TouchableOpacity
          style={styles.headerIconButton}
          onPress={() => router.push("/notifications")}
          activeOpacity={0.8}
        >
          <View style={styles.bellWrapper}>
            <Ionicons name="notifications-outline" size={24} color="#1E293B" />
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
                {/* Dark Gradient / Scrim Overlay */}
                <View style={styles.heroOverlay} />

                {/* Hero Text Content */}
                <View style={styles.heroContent}>
                  <Text style={styles.heroTitle}>
                    {item.titlePrefix}
                    <Text style={styles.heroTitleHighlight}>{item.titleHighlight}</Text>
                  </Text>
                  <Text style={styles.heroSubtitle}>{item.subtitle}</Text>

                  {/* Know More Button */}
                  <TouchableOpacity
                    style={styles.heroButton}
                    onPress={() => router.push(item.route as any)}
                    activeOpacity={0.88}
                  >
                    <Text style={styles.heroButtonText}>{item.buttonText}</Text>
                    <View style={styles.heroButtonArrowCircle}>
                      <Ionicons name="arrow-forward" size={13} color="#FFFFFF" />
                    </View>
                  </TouchableOpacity>
                </View>

                {/* Pagination Dots at Bottom of Hero */}
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

        {/* Section: Our Service Streams */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Our Service Streams</Text>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/seva")}
            style={styles.viewAllRow}
          >
            <Text style={styles.viewAllText}>View All</Text>
            <Ionicons name="chevron-forward" size={14} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.servicesGrid}>
          {SERVICE_STREAMS.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.serviceItem}
              onPress={() => router.push(item.route as any)}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.serviceBox,
                  { backgroundColor: item.bgColor, borderColor: item.borderColor },
                ]}
              >
                {item.iconType === "ionicons" ? (
                  <Ionicons name={item.icon as any} size={24} color={item.iconColor} />
                ) : (
                  <MaterialCommunityIcons name={item.icon as any} size={24} color={item.iconColor} />
                )}
              </View>
              <Text style={styles.serviceItemLabel}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Section: Latest Updates */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Latest Updates</Text>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/blogs")}
            style={styles.viewAllRow}
          >
            <Text style={styles.viewAllText}>View All</Text>
            <Ionicons name="chevron-forward" size={14} color={Colors.primary} />
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
                  <Ionicons name="calendar-outline" size={13} color="#94A3B8" style={{ marginRight: 4 }} />
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
              >
                <Text style={styles.viewAllText}>View All ({galleryPhotos.length})</Text>
                <Ionicons name="chevron-forward" size={14} color={Colors.primary} />
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
                  style={[styles.updateCard, { width: 140 }]}
                  onPress={() => router.push("/gallery")}
                  activeOpacity={0.88}
                >
                  <View style={[styles.updateImageWrapper, { height: 110 }]}>
                    <Image
                      source={resolveImageUrl(photo.url)}
                      style={styles.updateImage}
                      resizeMode="cover"
                    />
                    <View style={[styles.updatePill, { backgroundColor: "rgba(0,0,0,0.6)" }]}>
                      <Text style={styles.updatePillText}>{photo.category || "Seva"}</Text>
                    </View>
                  </View>
                  <View style={[styles.updateContent, { padding: 8 }]}>
                    <Text style={[styles.updateTitle, { fontSize: 11 }]} numberOfLines={1}>
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
              <Ionicons name="calendar-outline" size={24} color="#F59E0B" />
            </View>

            <View style={styles.eventInfo}>
              <Text style={styles.eventTag}>Upcoming Event</Text>
              <Text style={styles.eventTitle}>Mega Blood Donation Camp</Text>
              <Text style={styles.eventTime}>26 May 2024 | 9:00 AM Onwards</Text>
              <View style={styles.eventLocRow}>
                <Ionicons name="location-outline" size={12} color="#64748B" style={{ marginRight: 3 }} />
                <Text style={styles.eventLocation}>Community Hall, Civil Lines</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.eventDetailsBtn}
            onPress={() => setEventModalVisible(true)}
            activeOpacity={0.88}
          >
            <Text style={styles.eventDetailsBtnText}>View Details</Text>
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
              <MaterialCommunityIcons name="hand-heart" size={22} color="#166534" />
            </View>
            <View style={styles.actionBannerContent}>
              <Text style={[styles.actionBannerTitle, { color: "#166534" }]}>Donate</Text>
              <Text style={styles.actionBannerSubtitle}>
                Your small contribution creates a big change.
              </Text>
            </View>
            <View style={[styles.actionArrowCircle, { backgroundColor: "#166534" }]}>
              <Ionicons name="arrow-forward" size={13} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          {/* Volunteer Card */}
          <TouchableOpacity
            style={[styles.actionBannerCard, styles.volunteerBannerCard]}
            onPress={() => router.push("/volunteer-form")}
            activeOpacity={0.85}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: "#EFF6FF", borderColor: "#BFDBFE" }]}>
              <MaterialCommunityIcons name="hand-heart-outline" size={22} color="#1D4ED8" />
            </View>
            <View style={styles.actionBannerContent}>
              <Text style={[styles.actionBannerTitle, { color: "#1D4ED8" }]}>Volunteer</Text>
              <Text style={styles.actionBannerSubtitle}>
                Be a part of our mission. Serve with us.
              </Text>
            </View>
            <View style={[styles.actionArrowCircle, { backgroundColor: "#1D4ED8" }]}>
              <Ionicons name="arrow-forward" size={13} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Event Details Modal */}
        <Modal visible={eventModalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Event Information</Text>
                <TouchableOpacity onPress={() => setEventModalVisible(false)}>
                  <Ionicons name="close-circle" size={24} color="#64748B" />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalEventHeading}>🩸 Mega Voluntary Blood Donation Camp</Text>
              <Text style={styles.modalEventText}>
                Organized by Seva Dham Trust (Prayas Pariwaar) in collaboration with District Hospital Mathura. All donors will receive healthy refreshments and voluntary donor recognition cards.
              </Text>

              <View style={styles.modalMetaBox}>
                <Text style={styles.modalMetaItem}>📅 Date: Sunday, 26 May 2024</Text>
                <Text style={styles.modalMetaItem}>⏰ Time: 9:00 AM – 4:00 PM</Text>
                <Text style={styles.modalMetaItem}>📍 Venue: Community Hall, Civil Lines</Text>
                <Text style={styles.modalMetaItem}>📞 Helpline: +91 98765 43210</Text>
              </View>

              <TouchableOpacity
                style={styles.modalRegisterBtn}
                onPress={() => {
                  setEventModalVisible(false);
                  router.push("/(tabs)/blood-donation");
                }}
              >
                <Text style={styles.modalRegisterBtnText}>Register as Donor →</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerBrandCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerEmblem: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#FFFBEB",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  headerSun: {
    position: "absolute",
    opacity: 0.6,
  },
  headerTextCol: {
    alignItems: "flex-start",
  },
  headerOrgName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#164E2E",
    letterSpacing: -0.2,
  },
  headerTagline: {
    fontSize: 10,
    color: "#6B7280",
    fontWeight: "600",
  },
  bellWrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  redBadgeDot: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  scrollContent: {
    paddingBottom: 30,
  },
  heroSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
  },
  heroCard: {
    height: 195,
    borderRadius: 24,
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
    padding: 18,
    justifyContent: "space-between",
  },
  heroTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#FFFFFF",
    lineHeight: 23,
    letterSpacing: -0.2,
  },
  heroTitleHighlight: {
    color: "#FBBF24",
    fontWeight: "900",
  },
  heroSubtitle: {
    fontSize: 11,
    color: "#E2E8F0",
    marginTop: -4,
    maxWidth: 220,
    lineHeight: 15,
  },
  heroButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    alignSelf: "flex-start",
    gap: 6,
    ...Shadows.soft,
  },
  heroButtonText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#166534",
  },
  heroButtonArrowCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#166534",
    alignItems: "center",
    justifyContent: "center",
  },
  heroPagination: {
    position: "absolute",
    bottom: 12,
    right: 18,
    flexDirection: "row",
    gap: 5,
  },
  heroDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
  },
  heroDotActive: {
    width: 16,
    backgroundColor: "#FFFFFF",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 18,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.2,
  },
  viewAllRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#166534",
  },
  servicesGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  serviceItem: {
    alignItems: "center",
    width: (width - 40) / 5,
  },
  serviceBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    marginBottom: 6,
    ...Shadows.soft,
  },
  serviceItemLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#334155",
    textAlign: "center",
    lineHeight: 13,
  },
  updatesScroll: {
    paddingLeft: 20,
    paddingRight: 10,
    paddingBottom: 4,
    gap: 12,
  },
  updateCard: {
    width: 175,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
    ...Shadows.soft,
  },
  updateImageWrapper: {
    height: 105,
    position: "relative",
  },
  updateImage: {
    width: "100%",
    height: "100%",
  },
  updatePill: {
    position: "absolute",
    bottom: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  updatePillText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  updateContent: {
    padding: 10,
  },
  updateTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0F172A",
    lineHeight: 16,
    height: 32,
  },
  updateDateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  updateDateText: {
    fontSize: 10,
    color: "#94A3B8",
    fontWeight: "600",
  },
  eventCard: {
    backgroundColor: "#FFFBEB",
    marginHorizontal: 20,
    marginTop: 18,
    borderRadius: 20,
    padding: 16,
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
    marginRight: 10,
  },
  eventCalendarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  eventInfo: {
    flex: 1,
  },
  eventTag: {
    fontSize: 10,
    fontWeight: "800",
    color: "#D97706",
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  eventTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1E293B",
  },
  eventTime: {
    fontSize: 10,
    color: "#64748B",
    marginTop: 2,
    fontWeight: "600",
  },
  eventLocRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  eventLocation: {
    fontSize: 10,
    color: "#64748B",
  },
  eventDetailsBtn: {
    backgroundColor: "#226B3E",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.soft,
  },
  eventDetailsBtnText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },
  dualActionRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginTop: 16,
    gap: 12,
  },
  actionBannerCard: {
    flex: 1,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    flexDirection: "column",
    justifyContent: "space-between",
    minHeight: 115,
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
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    marginBottom: 8,
  },
  actionBannerContent: {
    flex: 1,
  },
  actionBannerTitle: {
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 3,
  },
  actionBannerSubtitle: {
    fontSize: 10,
    color: "#64748B",
    lineHeight: 14,
  },
  actionArrowCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-end",
    marginTop: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#164E2E",
  },
  modalEventHeading: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 8,
  },
  modalEventText: {
    fontSize: 13,
    color: "#475569",
    lineHeight: 20,
    marginBottom: 14,
  },
  modalMetaBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    padding: 14,
    gap: 6,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  modalMetaItem: {
    fontSize: 12,
    color: "#334155",
    fontWeight: "600",
  },
  modalRegisterBtn: {
    backgroundColor: "#166534",
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.primaryBtn,
  },
  modalRegisterBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
});
