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
  Alert,
  Modal,
  ActivityIndicator,
  Share,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors, Shadows } from "../../lib/theme";
import { api, resolveImageUrl } from "../../lib/api";
import ActionDialog from "../../components/ActionDialog";

const { width } = Dimensions.get("window");

interface StreamAction {
  title: string;
  subtitle: string;
  icon: string;
  route: string;
  bgColor: string;
  iconColor: string;
  arrowColor: string;
}

interface StreamDetailConfig {
  id: string;
  title: string;
  subtitle: string;
  heroImage: any;
  iconName: string;
  iconType: "ionicons" | "material";
  color: string;
  metrics: { value: string; label: string; icon: string }[];
  aboutText: string;
  whatWeDo: { title: string; subtitle: string; icon: string; iconType: "ionicons" | "material" }[];
  actions: StreamAction[];
}

const STREAM_DETAILS: Record<string, StreamDetailConfig> = {
  education: {
    id: "education",
    title: "Free Education",
    subtitle: "Providing quality education to underprivileged children and building a brighter future.",
    heroImage: require("../../assets/images/hero-education-vrindavan.jpg"),
    iconName: "school-outline",
    iconType: "ionicons",
    color: "#166534",
    metrics: [
      { value: "2,450+", label: "Students\nSupported", icon: "people" },
      { value: "28", label: "Education\nCenters", icon: "business" },
      { value: "150+", label: "Volunteers &\nTeachers", icon: "book" },
      { value: "95%", label: "Continue to\nHigh Studies", icon: "school" },
    ],
    aboutText:
      "We run free evening learning centers, provide study materials, uniforms, school kits, and career guidance to children from rural and underprivileged communities across Mathura & Vrindavan.",
    whatWeDo: [
      { title: "Free Classes", subtitle: "Regular tuition for academic excellence", icon: "school-outline", iconType: "ionicons" },
      { title: "Study Materials", subtitle: "Books, notebooks and learning resources", icon: "book-outline", iconType: "ionicons" },
      { title: "School Support", subtitle: "Uniforms, bags and stationery support", icon: "bag-handle-outline", iconType: "ionicons" },
      { title: "Career Guidance", subtitle: "Mentorship and career counselling", icon: "person-outline", iconType: "ionicons" },
    ],
    actions: [
      {
        title: "Sponsor a Student",
        subtitle: "Fund uniforms, school kits & tuition for a rural child",
        icon: "school-outline",
        route: "/(tabs)/donate",
        bgColor: "#F0FDF4",
        iconColor: "#166534",
        arrowColor: "#166534",
      },
      {
        title: "Volunteer as Teacher",
        subtitle: "Share your knowledge with evening study batches in Vrindavan",
        icon: "person-add-outline",
        route: "/volunteer-form",
        bgColor: "#EFF6FF",
        iconColor: "#1D4ED8",
        arrowColor: "#1D4ED8",
      },
      {
        title: "Donate Study Kits",
        subtitle: "Contribute for textbooks, stationery & learning tools",
        icon: "heart-outline",
        route: "/(tabs)/donate",
        bgColor: "#FFFBEB",
        iconColor: "#D97706",
        arrowColor: "#D97706",
      },
    ],
  },
  "blood-donation": {
    id: "blood-donation",
    title: "Blood Donation",
    subtitle: "Organizing voluntary blood donation camps and saving lives through 24/7 rapid hospital dispatch.",
    heroImage: require("../../assets/images/medical-blood-seva.jpg"),
    iconName: "water-outline",
    iconType: "ionicons",
    color: "#DC2626",
    metrics: [
      { value: "3,800+", label: "Units\nCollected", icon: "water" },
      { value: "2,400+", label: "Registered\nDonors", icon: "people" },
      { value: "15 min", label: "Average\nResponse", icon: "flash" },
      { value: "100%", label: "Voluntary &\nFree", icon: "shield-checkmark" },
    ],
    aboutText:
      "Our voluntary blood donation network connects critical patients, accident trauma victims, and Thalassemia children with immediate matched voluntary donors in Mathura and Vrindavan hospitals.",
    whatWeDo: [
      { title: "Emergency Desk", subtitle: "24/7 instant blood donor matching", icon: "water-outline", iconType: "ionicons" },
      { title: "Mobile Camps", subtitle: "Regular camps at community centers", icon: "medkit-outline", iconType: "ionicons" },
      { title: "Donor Network", subtitle: "Direct verified WhatsApp & Push alerts", icon: "notifications-outline", iconType: "ionicons" },
      { title: "Rare Groups", subtitle: "Specialized registry for rare blood types", icon: "heart-outline", iconType: "ionicons" },
    ],
    actions: [
      {
        title: "Register as Blood Donor",
        subtitle: "Join 2,400+ voluntary donor rapid response network",
        icon: "water-outline",
        route: "/blood-donor-registration",
        bgColor: "#FEF2F2",
        iconColor: "#DC2626",
        arrowColor: "#DC2626",
      },
      {
        title: "Request Emergency Blood",
        subtitle: "Broadcast urgent requirement to matched donors in Mathura",
        icon: "alert-circle-outline",
        route: "/blood-request",
        bgColor: "#FFFBEB",
        iconColor: "#D97706",
        arrowColor: "#D97706",
      },
      {
        title: "Donate for Blood Camps",
        subtitle: "Help fund test kits, donor refreshments & 24/7 coordination",
        icon: "heart-outline",
        route: "/(tabs)/donate",
        bgColor: "#F0FDF4",
        iconColor: "#166534",
        arrowColor: "#166534",
      },
    ],
  },
  plantation: {
    id: "plantation",
    title: "Tree Plantation",
    subtitle: "Planting native trees for a greener tomorrow and restoring sacred green groves along Braj.",
    heroImage: require("../../assets/images/vrindavan-plantation.jpg"),
    iconName: "leaf-outline",
    iconType: "ionicons",
    color: "#15803D",
    metrics: [
      { value: "10,000+", label: "Native Trees\nPlanted", icon: "leaf" },
      { value: "18", label: "Sacred Braj\nGroves", icon: "earth" },
      { value: "85%", label: "Sapling\nSurvival Rate", icon: "shield-checkmark" },
      { value: "1,200+", label: "Green Seva\nVolunteers", icon: "people" },
    ],
    aboutText:
      "Harit Braj is dedicated to planting Neem, Peepal, Banyan, and Kadamb trees along the 84-Kos Parikrama Marg, reviving sacred groves and fighting pollution in Mathura & Vrindavan.",
    whatWeDo: [
      { title: "Parikrama Drives", subtitle: "Sapling plantation along pilgrimage paths", icon: "leaf-outline", iconType: "ionicons" },
      { title: "Tree Adoption", subtitle: "Community maintenance and drip watering", icon: "water-outline", iconType: "ionicons" },
      { title: "Native Species", subtitle: "Preserving biodiversity with sacred flora", icon: "flower-outline", iconType: "ionicons" },
      { title: "School Nurseries", subtitle: "Educating students about eco-conservation", icon: "school-outline", iconType: "ionicons" },
    ],
    actions: [
      {
        title: "Adopt a Sacred Tree",
        subtitle: "Fund planting & 3-year tree guard maintenance",
        icon: "leaf-outline",
        route: "/(tabs)/donate",
        bgColor: "#F0FDF4",
        iconColor: "#15803D",
        arrowColor: "#15803D",
      },
      {
        title: "Join Plantation Drive",
        subtitle: "Plant native Neem & Peepal saplings along Parikrama Marg",
        icon: "people-outline",
        route: "/volunteer-form",
        bgColor: "#EFF6FF",
        iconColor: "#1D4ED8",
        arrowColor: "#1D4ED8",
      },
      {
        title: "Donate for Green Braj",
        subtitle: "Help plant 5,000 more native trees across Mathura",
        icon: "heart-outline",
        route: "/(tabs)/donate",
        bgColor: "#FFFBEB",
        iconColor: "#D97706",
        arrowColor: "#D97706",
      },
    ],
  },
  "jeev-jal": {
    id: "jeev-jal",
    title: "Jeev Jal Seva",
    subtitle: "Providing water for birds, cows, and street animals with pure love and community compassion.",
    heroImage: require("../../assets/onboarding/jeev_jal.jpg"),
    iconName: "bird",
    iconType: "material",
    color: "#1D4ED8",
    metrics: [
      { value: "4,500+", label: "Water Bowls\nDistributed", icon: "water" },
      { value: "35+", label: "Gaushala Water\nTroughs Built", icon: "home" },
      { value: "100%", label: "Summer\nCoverage", icon: "sunny" },
      { value: "800+", label: "Community\nCaretakers", icon: "people" },
    ],
    aboutText:
      "During peak summer months in Braj, temperatures exceed 46°C. Jeev Jal Seva installs terracotta earthen water bowls and automatic water feeders for birds, monkeys, cows, and street animals.",
    whatWeDo: [
      { title: "Clay Bowl Drive", subtitle: "Free distribution of bird water bowls", icon: "water-outline", iconType: "ionicons" },
      { title: "Gaushala Tanks", subtitle: "Building clean cattle drinking troughs", icon: "home-outline", iconType: "ionicons" },
      { title: "Daily Refill", subtitle: "Volunteer teams keeping bowls filled", icon: "refresh-outline", iconType: "ionicons" },
      { title: "Medical Rescue", subtitle: "First aid for dehydrated street animals", icon: "medkit-outline", iconType: "ionicons" },
    ],
    actions: [
      {
        title: "Join Jal Taskforce",
        subtitle: "Volunteer to refill public bird bowls & gaushala tanks",
        icon: "people-outline",
        route: "/volunteer-form",
        bgColor: "#F0FDF4",
        iconColor: "#166534",
        arrowColor: "#166534",
      },
      {
        title: "Sponsor Water Feeders",
        subtitle: "Sponsor 50 terracotta bowls & clean cattle drinking troughs",
        icon: "water-outline",
        route: "/(tabs)/donate",
        bgColor: "#EFF6FF",
        iconColor: "#1D4ED8",
        arrowColor: "#1D4ED8",
      },
      {
        title: "Donate for Summer Jal Seva",
        subtitle: "Ensure continuous clean drinking water in peak summer",
        icon: "heart-outline",
        route: "/(tabs)/donate",
        bgColor: "#FFFBEB",
        iconColor: "#D97706",
        arrowColor: "#D97706",
      },
    ],
  },
  vocational: {
    id: "vocational",
    title: "Vocational Training",
    subtitle: "Equipping youth with industrial skills, medical equipment training, and self-reliance.",
    heroImage: require("../../assets/images/youth-skills-vrindavan.jpg"),
    iconName: "cog-outline",
    iconType: "material",
    color: "#7E22CE",
    metrics: [
      { value: "1,200+", label: "Youth Trained\n& Certified", icon: "school" },
      { value: "85%", label: "Job Placement\nRate", icon: "briefcase" },
      { value: "6", label: "Technical\nLaboratories", icon: "construct" },
      { value: "100%", label: "Free Training\n& Tools", icon: "gift" },
    ],
    aboutText:
      "We provide skill development courses in electrical repair, medical equipment maintenance, tailoring, and computer fundamentals to empower rural youth with sustainable livelihoods.",
    whatWeDo: [
      { title: "Technical Skills", subtitle: "Hands-on machine and electrical training", icon: "construct-outline", iconType: "ionicons" },
      { title: "Medical Tech", subtitle: "Oxygen concentrator & ICU bed maintenance", icon: "medkit-outline", iconType: "ionicons" },
      { title: "Women Tailoring", subtitle: "Sewing machines & garment manufacturing", icon: "cut-outline", iconType: "ionicons" },
      { title: "Job Placement", subtitle: "Direct placement with regional employers", icon: "briefcase-outline", iconType: "ionicons" },
    ],
    actions: [
      {
        title: "Enroll for Free Training",
        subtitle: "Join upcoming technical repair or women tailoring batch",
        icon: "school-outline",
        route: "/volunteer-form",
        bgColor: "#FAF5FF",
        iconColor: "#7E22CE",
        arrowColor: "#7E22CE",
      },
      {
        title: "Volunteer as Skill Trainer",
        subtitle: "Teach technical skills or digital literacy to youth",
        icon: "construct-outline",
        route: "/volunteer-form",
        bgColor: "#EFF6FF",
        iconColor: "#1D4ED8",
        arrowColor: "#1D4ED8",
      },
      {
        title: "Sponsor Starter Toolkits",
        subtitle: "Gift sewing machines & toolkits to certified graduates",
        icon: "heart-outline",
        route: "/(tabs)/donate",
        bgColor: "#FFFBEB",
        iconColor: "#D97706",
        arrowColor: "#D97706",
      },
    ],
  },
};

const PILLAR_CATEGORY_MAP: Record<string, string[]> = {
  education: ["Free Education", "Education"],
  "blood-donation": ["Blood Donation", "Blood", "Health", "Healthcare", "Medical"],
  plantation: ["Plantation", "Plantation & Ecology"],
  "jeev-jal": ["Jeev Jal Seva", "Jeev Jal"],
  vocational: ["Vocational Training", "Vocational"],
};

interface LivePhotoItem {
  id: string;
  title?: string;
  url: string;
  category?: string;
  location?: string;
}

export default function SevaDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const streamKey = typeof id === "string" && STREAM_DETAILS[id] ? id : "education";
  const stream = STREAM_DETAILS[streamKey];

  const [bookmarked, setBookmarked] = useState(false);
  const [supportModalVisible, setSupportModalVisible] = useState(false);
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
  const [bookmarkModalVisible, setBookmarkModalVisible] = useState(false);
  const [livePhotos, setLivePhotos] = useState<LivePhotoItem[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(true);
  const [activePhoto, setActivePhoto] = useState<LivePhotoItem | null>(null);

  useEffect(() => {
    loadLiveGallery();
  }, [streamKey]);

  const loadLiveGallery = async () => {
    try {
      setLoadingPhotos(true);
      const res = await api.get<any>("/gallery");
      if (res.data?.success && res.data.data) {
        const allowed = PILLAR_CATEGORY_MAP[streamKey] || [];
        const recentPhotos: any[] = res.data.data.recentPhotos || [];
        const albums: any[] = res.data.data.albums || [];
        const collected: LivePhotoItem[] = [];

        // 1. Check recent photos
        for (const p of recentPhotos) {
          const cat = (p.category || "").toLowerCase();
          const title = (p.title || "").toLowerCase();
          const matches = allowed.some((c) => cat.includes(c.toLowerCase()) || title.includes(c.toLowerCase()));
          if (matches && p.url && !p.url.includes("unsplash.com")) {
            if (!collected.some((existing) => existing.id === p.id || existing.url === p.url)) {
              collected.push({
                id: p.id,
                title: p.title || p.caption || "Seva Moment",
                url: p.url,
                category: p.category,
                location: p.location,
              });
            }
          }
        }

        // 2. Check albums
        for (const a of albums) {
          const aCat = (a.category || "").toLowerCase();
          const aTitle = (a.title || "").toLowerCase();
          const aMatches = allowed.some((c) => aCat.includes(c.toLowerCase()) || aTitle.includes(c.toLowerCase()));
          if (aMatches && Array.isArray(a.photos)) {
            for (const ap of a.photos) {
              if (ap.url && !ap.url.includes("unsplash.com") && !collected.some((existing) => existing.id === ap.id || existing.url === ap.url)) {
                collected.push({
                  id: ap.id,
                  title: ap.title || ap.caption || a.title || "Seva Moment",
                  url: ap.url,
                  category: ap.category || a.category,
                  location: ap.location,
                });
              }
            }
          }
        }

        setLivePhotos(collected);
      }
    } catch (e) {
      console.warn("Failed to load live gallery for pillar:", e);
    } finally {
      setLoadingPhotos(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)/seva"))}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={22} color="#164E2E" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{stream.title}</Text>

        <View style={styles.headerRightActions}>
          <TouchableOpacity
            style={styles.headerActionBtn}
            onPress={() => {
              setBookmarked(!bookmarked);
              setBookmarkModalVisible(true);
            }}
            activeOpacity={0.8}
          >
            <Ionicons
              name={bookmarked ? "heart" : "heart-outline"}
              size={20}
              color={bookmarked ? "#DC2626" : "#164E2E"}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Banner Card */}
        <View style={styles.heroCard}>
          <Image source={stream.heroImage} style={styles.heroImage} resizeMode="cover" />
          <View style={styles.heroOverlay} />

          <View style={styles.heroContent}>
            <View style={styles.heroIconBadge}>
              {stream.iconType === "ionicons" ? (
                <Ionicons name={stream.iconName as any} size={22} color="#166534" />
              ) : (
                <MaterialCommunityIcons name={stream.iconName as any} size={22} color="#166534" />
              )}
            </View>

            <Text style={styles.heroTitle}>{stream.title}</Text>
            <Text style={styles.heroSubtitle}>{stream.subtitle}</Text>
          </View>
        </View>

        {/* 4 Impact Statistics */}
        <View style={styles.metricsRow}>
          {stream.metrics.map((m, i) => (
            <View key={i} style={styles.metricCard}>
              <View style={styles.metricIconCircle}>
                <Ionicons name={m.icon as any} size={15} color="#166534" />
              </View>
              <Text style={styles.metricValue}>{m.value}</Text>
              <Text style={styles.metricLabel}>{m.label}</Text>
            </View>
          ))}
        </View>

        {/* About This Initiative */}
        <View style={styles.aboutCard}>
          <View style={styles.aboutHeaderRow}>
            <Text style={styles.sectionHeading}>About This Initiative</Text>
            <View style={styles.aboutIdeaCircle}>
              <MaterialCommunityIcons name="lightbulb-on-outline" size={20} color="#16A34A" />
            </View>
          </View>
          <Text style={styles.aboutText}>{stream.aboutText}</Text>
        </View>

        {/* What We Do Grid */}
        <Text style={styles.sectionHeading}>What We Do</Text>
        <View style={styles.whatWeDoGrid}>
          {stream.whatWeDo.map((item, i) => (
            <View key={i} style={styles.whatWeDoCard}>
              <View style={styles.whatWeDoIconCircle}>
                {item.iconType === "ionicons" ? (
                  <Ionicons name={item.icon as any} size={20} color="#166534" />
                ) : (
                  <MaterialCommunityIcons name={item.icon as any} size={20} color="#166534" />
                )}
              </View>
              <Text style={styles.whatWeDoTitle}>{item.title}</Text>
              <Text style={styles.whatWeDoSubtitle}>{item.subtitle}</Text>
            </View>
          ))}
        </View>

        {/* Live Photo Gallery (Only Live Uploaded Data) */}
        <View style={styles.sectionHeaderRow}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.sectionHeading}>Live Photo Gallery</Text>
            {livePhotos.length > 0 && (
              <View style={styles.liveCountBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveCountText}>{livePhotos.length} Live</Text>
              </View>
            )}
          </View>
          <TouchableOpacity onPress={() => router.push("/gallery")} activeOpacity={0.7}>
            <Text style={styles.viewAllText}>View All ›</Text>
          </TouchableOpacity>
        </View>

        {loadingPhotos ? (
          <View style={styles.galleryLoadingBox}>
            <ActivityIndicator size="small" color="#166534" />
            <Text style={styles.galleryLoadingText}>Loading live field photos...</Text>
          </View>
        ) : livePhotos.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.galleryScroll}>
            {livePhotos.map((photo) => (
              <TouchableOpacity
                key={photo.id}
                style={styles.galleryThumb}
                onPress={() => setActivePhoto(photo)}
                activeOpacity={0.88}
              >
                <Image source={resolveImageUrl(photo.url)} style={styles.galleryImage} resizeMode="cover" />
                <View style={styles.galleryExpandBadge}>
                  <Ionicons name="expand-outline" size={11} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyGalleryBox}>
            <Ionicons name="camera-outline" size={24} color="#94A3B8" />
            <Text style={styles.emptyGalleryTitle}>No live photos uploaded yet</Text>
            <Text style={styles.emptyGallerySub}>
              Real field photos uploaded for this pillar will appear here automatically.
            </Text>
            <TouchableOpacity
              style={styles.emptyGalleryBtn}
              onPress={() => router.push("/gallery")}
              activeOpacity={0.8}
            >
              <Text style={styles.emptyGalleryBtnText}>Explore All Seva Photos ›</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Get Involved Action Cards (Properly Implemented for Each Pillar) */}
        <Text style={styles.sectionHeading}>Get Involved</Text>
        <View style={styles.actionsList}>
          {stream.actions.map((act, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.actionRowCard, { backgroundColor: act.bgColor }]}
              onPress={() => router.push(act.route as any)}
              activeOpacity={0.88}
            >
              <View style={[styles.actionRowIconCircle, { borderColor: act.iconColor + "30" }]}>
                <Ionicons name={act.icon as any} size={18} color={act.iconColor} />
              </View>
              <View style={styles.actionRowContent}>
                <Text style={[styles.actionRowTitle, { color: act.iconColor }]}>{act.title}</Text>
                <Text style={styles.actionRowSubtitle}>{act.subtitle}</Text>
              </View>
              <View style={[styles.actionRowArrow, { backgroundColor: act.arrowColor }]}>
                <Ionicons name="arrow-forward" size={12} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Bottom Dual Action CTAs */}
        <View style={styles.bottomCTAsRow}>
          <TouchableOpacity
            style={styles.upcomingProgramsBtn}
            onPress={() => setScheduleModalVisible(true)}
            activeOpacity={0.85}
          >
            <Ionicons name="calendar-outline" size={16} color="#166534" style={{ marginRight: 6 }} />
            <Text style={styles.upcomingProgramsText}>Upcoming Drives</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.supportInitiativeBtn}
            onPress={() => setSupportModalVisible(true)}
            activeOpacity={0.88}
          >
            <MaterialCommunityIcons name="hand-heart-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.supportInitiativeText}>Support Initiative</Text>
          </TouchableOpacity>
        </View>

        {/* Support Initiative Modal */}
        <Modal visible={supportModalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Support {stream.title}</Text>
                <TouchableOpacity onPress={() => setSupportModalVisible(false)}>
                  <Ionicons name="close-circle" size={24} color="#64748B" />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalDesc}>
                Your support directly sponsors students, tree saplings, blood camps, and free healthcare across Braj.
              </Text>

              <TouchableOpacity
                style={styles.modalActionBtn}
                onPress={() => {
                  setSupportModalVisible(false);
                  router.push("/volunteer-form");
                }}
                activeOpacity={0.88}
              >
                <Text style={styles.modalActionBtnText}>🤝 Join as Volunteer</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalActionBtn, { backgroundColor: "#164E2E", marginTop: 10 }]}
                onPress={() => {
                  setSupportModalVisible(false);
                  router.push("/(tabs)/donate");
                }}
                activeOpacity={0.88}
              >
                <Text style={styles.modalActionBtnText}>💚 Make a Contribution</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Weekly Seva Schedule Custom ActionDialog */}
        <ActionDialog
          visible={scheduleModalVisible}
          onClose={() => setScheduleModalVisible(false)}
          onConfirm={() => {
            setScheduleModalVisible(false);
            router.push("/volunteer-form");
          }}
          title="Programs Schedule"
          badge="VRINDAVAN SEVA CALENDAR"
          description={`Upcoming seva drives for ${stream.title} are organized on a regular schedule in Mathura & Vrindavan:`}
          icon="calendar-outline"
          type="info"
          confirmText="Join Next Drive"
          cancelText="Close"
          showCancel={true}
        >
          <View style={styles.scheduleInfoBox}>
            <View style={styles.scheduleInfoRow}>
              <Ionicons name="time-outline" size={16} color="#166534" />
              <Text style={styles.scheduleInfoLabel}>When:</Text>
              <Text style={styles.scheduleInfoVal}>Every Sunday (8:00 AM – 11:30 AM)</Text>
            </View>
            <View style={styles.scheduleInfoRow}>
              <Ionicons name="location-outline" size={16} color="#166534" />
              <Text style={styles.scheduleInfoLabel}>Meeting:</Text>
              <Text style={styles.scheduleInfoVal}>Prayas Kendra, Raman Reti, Vrindavan</Text>
            </View>
            <View style={[styles.scheduleInfoRow, { borderBottomWidth: 0 }]}>
              <Ionicons name="people-outline" size={16} color="#166534" />
              <Text style={styles.scheduleInfoLabel}>Volunteers:</Text>
              <Text style={styles.scheduleInfoVal}>Open for youth, donors & devotees</Text>
            </View>
          </View>
        </ActionDialog>

        {/* Bookmark Status ActionDialog */}
        <ActionDialog
          visible={bookmarkModalVisible}
          onClose={() => setBookmarkModalVisible(false)}
          title={bookmarked ? "Added to Favorites" : "Removed from Favorites"}
          badge="SEVA PREFERENCES"
          description={
            bookmarked
              ? `You will receive priority updates, field stories, and urgent notifications for ${stream.title}.`
              : `You have unsubscribed from specific notifications for ${stream.title}.`
          }
          icon={bookmarked ? "heart" : "heart-dislike-outline"}
          type={bookmarked ? "success" : "warning"}
          confirmText="Got It"
          showCancel={false}
        />

        {/* Fullscreen Live Photo Lightbox */}
        {activePhoto && (
          <Modal visible={!!activePhoto} transparent animationType="fade">
            <View style={styles.lightboxOverlay}>
              <SafeAreaView style={styles.lightboxSafeArea}>
                <View style={styles.lightboxTopBar}>
                  <TouchableOpacity
                    style={styles.lightboxCloseBtn}
                    onPress={() => setActivePhoto(null)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="close" size={24} color="#FFFFFF" />
                  </TouchableOpacity>

                  <View style={styles.lightboxBadge}>
                    <Text style={styles.lightboxBadgeText}>{activePhoto.category || stream.title}</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.lightboxCloseBtn}
                    onPress={() => {
                      Share.share({
                        message: `${activePhoto.title || stream.title} - Prayas Pariwaar Seva in Vrindavan`,
                      });
                    }}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="share-social-outline" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>

                <View style={styles.lightboxImageWrapper}>
                  <Image
                    source={resolveImageUrl(activePhoto.url)}
                    style={styles.lightboxFullImage}
                    resizeMode="contain"
                  />
                </View>

                {activePhoto.title ? (
                  <View style={styles.lightboxCaptionBox}>
                    <Text style={styles.lightboxCaptionText}>{activePhoto.title}</Text>
                    {activePhoto.location ? (
                      <Text style={styles.lightboxLocationText}>📍 {activePhoto.location}</Text>
                    ) : null}
                  </View>
                ) : null}
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
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9",
  },
  headerTitle: {
    fontSize: 17,
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
    paddingBottom: 36,
  },
  heroCard: {
    height: 185,
    borderRadius: 14,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#0F172A",
    marginBottom: 14,
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
  heroIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.soft,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.2,
  },
  heroSubtitle: {
    fontSize: 11,
    color: "#E2E8F0",
    lineHeight: 15,
    maxWidth: 270,
  },
  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  metricCard: {
    width: (width - 32 - 18) / 4,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 4,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    ...Shadows.soft,
  },
  metricIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: "#F0FDF4",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 3,
  },
  metricValue: {
    fontSize: 12,
    fontWeight: "800",
    color: "#164E2E",
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: "600",
    color: "#64748B",
    textAlign: "center",
    lineHeight: 11,
    marginTop: 2,
  },
  aboutCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 14,
    marginBottom: 14,
    ...Shadows.soft,
  },
  aboutHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  aboutIdeaCircle: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#F0FDF4",
    alignItems: "center",
    justifyContent: "center",
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  aboutText: {
    fontSize: 11,
    color: "#475569",
    lineHeight: 17,
  },
  whatWeDoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 14,
    gap: 8,
  },
  whatWeDoCard: {
    width: (width - 40) / 2,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 12,
    ...Shadows.soft,
  },
  whatWeDoIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: "#F0FDF4",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  whatWeDoTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 2,
  },
  whatWeDoSubtitle: {
    fontSize: 10,
    color: "#64748B",
    lineHeight: 13,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  viewAllText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#166534",
  },
  galleryScroll: {
    gap: 8,
    marginBottom: 16,
  },
  galleryThumb: {
    width: 100,
    height: 80,
    borderRadius: 10,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#F1F5F9",
  },
  galleryImage: {
    width: "100%",
    height: "100%",
  },
  liveCountBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
    marginBottom: 8,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#16A34A",
    marginRight: 4,
  },
  liveCountText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#166534",
  },
  galleryLoadingBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 16,
    gap: 8,
  },
  galleryLoadingText: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
  galleryExpandBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    backgroundColor: "rgba(0,0,0,0.55)",
    padding: 3,
    borderRadius: 4,
  },
  emptyGalleryBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 16,
    borderStyle: "dashed",
  },
  emptyGalleryTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#475569",
    marginTop: 8,
  },
  emptyGallerySub: {
    fontSize: 11,
    color: "#94A3B8",
    textAlign: "center",
    marginTop: 3,
    marginBottom: 10,
    lineHeight: 15,
  },
  emptyGalleryBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: "#DCFCE7",
    borderRadius: 8,
  },
  emptyGalleryBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#166534",
  },
  lightboxOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
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
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  lightboxBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  lightboxBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  lightboxImageWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  lightboxFullImage: {
    width: "100%",
    height: "100%",
  },
  lightboxCaptionBox: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
  },
  lightboxCaptionText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  lightboxLocationText: {
    color: "#A7F3D0",
    fontSize: 11,
    fontWeight: "500",
    textAlign: "center",
    marginTop: 4,
  },
  actionsList: {
    gap: 8,
    marginBottom: 18,
  },
  actionRowCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    ...Shadows.soft,
  },
  actionRowIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    marginRight: 10,
  },
  actionRowContent: {
    flex: 1,
  },
  actionRowTitle: {
    fontSize: 13,
    fontWeight: "800",
  },
  actionRowSubtitle: {
    fontSize: 10,
    color: "#64748B",
    marginTop: 1,
    lineHeight: 13,
  },
  actionRowArrow: {
    width: 22,
    height: 22,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomCTAsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  upcomingProgramsBtn: {
    flex: 1,
    height: 44,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#166534",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  upcomingProgramsText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#166534",
  },
  supportInitiativeBtn: {
    flex: 1,
    height: 44,
    backgroundColor: "#166534",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.primaryBtn,
  },
  supportInitiativeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#FFFFFF",
  },
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
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#164E2E",
  },
  modalDesc: {
    fontSize: 12,
    color: "#475569",
    lineHeight: 18,
    marginBottom: 16,
  },
  modalActionBtn: {
    height: 44,
    backgroundColor: "#166534",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  modalActionBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  scheduleInfoBox: {
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    borderRadius: 14,
    padding: 12,
  },
  scheduleInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#DCFCE7",
    gap: 8,
  },
  scheduleInfoLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#166534",
  },
  scheduleInfoVal: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
    color: "#1E293B",
  },
});
