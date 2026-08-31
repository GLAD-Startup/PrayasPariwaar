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
  Modal,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { Colors, Shadows } from "../../lib/theme";

const { width } = Dimensions.get("window");

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
  gallery: any[];
  updates: { id: string; title: string; date: string; image: any }[];
  actions: { title: string; subtitle: string; icon: string; bgColor: string; iconColor: string; arrowColor: string }[];
}

const STREAM_DETAILS: Record<string, StreamDetailConfig> = {
  education: {
    id: "education",
    title: "Free Education",
    subtitle: "Providing quality education to underprivileged children and building a brighter future.",
    heroImage: require("../../assets/onboarding/education.jpg"),
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
    gallery: [
      require("../../assets/onboarding/education.jpg"),
      require("../../assets/onboarding/gallery_1.jpg"),
      require("../../assets/onboarding/gallery_2.jpg"),
      require("../../assets/onboarding/plantation.jpg"),
    ],
    updates: [
      {
        id: "up-1",
        title: "New Learning Center Inaugurated in Rohini Village",
        date: "12 May 2024",
        image: require("../../assets/onboarding/gallery_1.jpg"),
      },
      {
        id: "up-2",
        title: "Annual Exam Success: 98% Pass Rate Achieved",
        date: "05 May 2024",
        image: require("../../assets/onboarding/gallery_2.jpg"),
      },
    ],
    actions: [
      { title: "Sponsor a Student", subtitle: "Support a child's education", icon: "school-outline", bgColor: "#F0FDF4", iconColor: "#166534", arrowColor: "#166534" },
      { title: "Volunteer as Teacher", subtitle: "Share your knowledge and inspire", icon: "person-outline", bgColor: "#EFF6FF", iconColor: "#1D4ED8", arrowColor: "#1D4ED8" },
      { title: "Donate Now", subtitle: "Help us educate more children", icon: "heart-outline", bgColor: "#FFFBEB", iconColor: "#D97706", arrowColor: "#D97706" },
    ],
  },
  "blood-donation": {
    id: "blood-donation",
    title: "Blood Donation",
    subtitle: "Organizing voluntary blood donation camps and saving lives through 24/7 rapid hospital dispatch.",
    heroImage: require("../../assets/onboarding/blood.jpg"),
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
    gallery: [
      require("../../assets/onboarding/blood.jpg"),
      require("../../assets/onboarding/education.jpg"),
      require("../../assets/onboarding/gallery_1.jpg"),
      require("../../assets/onboarding/jeev_jal.jpg"),
    ],
    updates: [
      {
        id: "up-b1",
        title: "Successful Blood Donation Camp at City Hospital",
        date: "10 May 2024",
        image: require("../../assets/onboarding/blood.jpg"),
      },
      {
        id: "up-b2",
        title: "50 Units Donated for Thalassemia Child Support",
        date: "02 May 2024",
        image: require("../../assets/onboarding/blood.jpg"),
      },
    ],
    actions: [
      { title: "Register as Donor", subtitle: "Join our rapid response network", icon: "water-outline", bgColor: "#FEF2F2", iconColor: "#DC2626", arrowColor: "#DC2626" },
      { title: "Request Blood", subtitle: "Broadcast urgent requirement", icon: "alert-circle-outline", bgColor: "#FFFBEB", iconColor: "#D97706", arrowColor: "#D97706" },
      { title: "Host a Camp", subtitle: "Partner with our medical team", icon: "business-outline", bgColor: "#F0FDF4", iconColor: "#166534", arrowColor: "#166534" },
    ],
  },
  plantation: {
    id: "plantation",
    title: "Tree Plantation",
    subtitle: "Planting native trees for a greener tomorrow and restoring sacred green groves along Braj.",
    heroImage: require("../../assets/onboarding/plantation.jpg"),
    iconName: "sprout-outline",
    iconType: "material",
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
    gallery: [
      require("../../assets/onboarding/plantation.jpg"),
      require("../../assets/onboarding/jeev_jal.jpg"),
      require("../../assets/onboarding/gallery_1.jpg"),
      require("../../assets/onboarding/education.jpg"),
    ],
    updates: [
      {
        id: "up-p1",
        title: "Tree Plantation Drive at Green Valley Park",
        date: "08 May 2024",
        image: require("../../assets/onboarding/plantation.jpg"),
      },
      {
        id: "up-p2",
        title: "1,000 Neem Saplings Planted on World Earth Day",
        date: "22 Apr 2024",
        image: require("../../assets/onboarding/plantation.jpg"),
      },
    ],
    actions: [
      { title: "Adopt a Tree", subtitle: "Fund lifelong care for a sapling", icon: "leaf-outline", bgColor: "#F0FDF4", iconColor: "#15803D", arrowColor: "#15803D" },
      { title: "Join Weekend Drive", subtitle: "Participate in local planting events", icon: "people-outline", bgColor: "#EFF6FF", iconColor: "#1D4ED8", arrowColor: "#1D4ED8" },
      { title: "Donate for Green Braj", subtitle: "Help plant 5,000 more trees", icon: "heart-outline", bgColor: "#FFFBEB", iconColor: "#D97706", arrowColor: "#D97706" },
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
    gallery: [
      require("../../assets/onboarding/jeev_jal.jpg"),
      require("../../assets/onboarding/plantation.jpg"),
      require("../../assets/onboarding/gallery_1.jpg"),
      require("../../assets/onboarding/blood.jpg"),
    ],
    updates: [
      {
        id: "up-j1",
        title: "Summer Jal Seva Campaign: 500 Bowls Set Up",
        date: "01 May 2024",
        image: require("../../assets/onboarding/jeev_jal.jpg"),
      },
      {
        id: "up-j2",
        title: "New Automated Cattle Water Station Inaugurated",
        date: "25 Apr 2024",
        image: require("../../assets/onboarding/jeev_jal.jpg"),
      },
    ],
    actions: [
      { title: "Request Free Bowl", subtitle: "Install a bird water pot at your home", icon: "water-outline", bgColor: "#EFF6FF", iconColor: "#1D4ED8", arrowColor: "#1D4ED8" },
      { title: "Join Jal Taskforce", subtitle: "Help refill public water bowls", icon: "people-outline", bgColor: "#F0FDF4", iconColor: "#166534", arrowColor: "#166534" },
      { title: "Sponsor Water Station", subtitle: "Build cattle drinking troughs", icon: "heart-outline", bgColor: "#FFFBEB", iconColor: "#D97706", arrowColor: "#D97706" },
    ],
  },
  vocational: {
    id: "vocational",
    title: "Vocational Training",
    subtitle: "Equipping youth with industrial skills, medical equipment training, and self-reliance.",
    heroImage: require("../../assets/onboarding/equipment.jpg"),
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
    gallery: [
      require("../../assets/onboarding/equipment.jpg"),
      require("../../assets/onboarding/education.jpg"),
      require("../../assets/onboarding/gallery_2.jpg"),
      require("../../assets/onboarding/plantation.jpg"),
    ],
    updates: [
      {
        id: "up-v1",
        title: "Graduation Day: 45 Youth Receive Certificates",
        date: "04 May 2024",
        image: require("../../assets/onboarding/equipment.jpg"),
      },
      {
        id: "up-v2",
        title: "Medical Equipment Repair Workshop Launched",
        date: "28 Apr 2024",
        image: require("../../assets/onboarding/equipment.jpg"),
      },
    ],
    actions: [
      { title: "Enroll as Student", subtitle: "Join upcoming free batch", icon: "school-outline", bgColor: "#FAF5FF", iconColor: "#7E22CE", arrowColor: "#7E22CE" },
      { title: "Volunteer as Trainer", subtitle: "Teach technical skills to youth", icon: "construct-outline", bgColor: "#EFF6FF", iconColor: "#1D4ED8", arrowColor: "#1D4ED8" },
      { title: "Sponsor Toolkits", subtitle: "Gift starter toolkits to graduates", icon: "heart-outline", bgColor: "#FFFBEB", iconColor: "#D97706", arrowColor: "#D97706" },
    ],
  },
};

export default function SevaDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const streamKey = typeof id === "string" && STREAM_DETAILS[id] ? id : "education";
  const stream = STREAM_DETAILS[streamKey];

  const [bookmarked, setBookmarked] = useState(false);
  const [supportModalVisible, setSupportModalVisible] = useState(false);

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
              Alert.alert(bookmarked ? "Removed from Favorites" : "Added to Favorites", `You will receive updates for ${stream.title}.`);
            }}
          >
            <Ionicons
              name={bookmarked ? "heart" : "heart-outline"}
              size={22}
              color={bookmarked ? "#DC2626" : "#164E2E"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerActionBtn}
            onPress={() => Alert.alert("Impact Analytics", `${stream.title} has empowered thousands of lives across Mathura & Vrindavan.`)}
          >
            <Ionicons name="trending-up-outline" size={22} color="#164E2E" />
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
                <Ionicons name={stream.iconName as any} size={24} color="#166534" />
              ) : (
                <MaterialCommunityIcons name={stream.iconName as any} size={24} color="#166534" />
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
                <Ionicons name={m.icon as any} size={16} color="#166534" />
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
              <MaterialCommunityIcons name="lightbulb-on-outline" size={22} color="#16A34A" />
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
                  <Ionicons name={item.icon as any} size={22} color="#166534" />
                ) : (
                  <MaterialCommunityIcons name={item.icon as any} size={22} color="#166534" />
                )}
              </View>
              <Text style={styles.whatWeDoTitle}>{item.title}</Text>
              <Text style={styles.whatWeDoSubtitle}>{item.subtitle}</Text>
            </View>
          ))}
        </View>

        {/* Photo Gallery */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>Photo Gallery</Text>
          <TouchableOpacity onPress={() => router.push("/gallery")}>
            <Text style={styles.viewAllText}>View All ›</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.galleryScroll}>
          {stream.gallery.map((img, i) => (
            <View key={i} style={styles.galleryThumb}>
              <Image source={img} style={styles.galleryImage} resizeMode="cover" />
            </View>
          ))}
        </ScrollView>

        {/* Latest Updates */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>Latest Updates</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/volunteer")}>
            <Text style={styles.viewAllText}>View All ›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.updatesContainer}>
          {stream.updates.map((up) => (
            <View key={up.id} style={styles.updateCard}>
              <Image source={up.image} style={styles.updateImage} resizeMode="cover" />
              <View style={styles.updateInfo}>
                <View style={styles.updateTagBadge}>
                  <Text style={styles.updateTagText}>{stream.title}</Text>
                </View>
                <Text style={styles.updateTitle} numberOfLines={2}>{up.title}</Text>
                <View style={styles.updateDateRow}>
                  <Ionicons name="calendar-outline" size={12} color="#94A3B8" style={{ marginRight: 4 }} />
                  <Text style={styles.updateDateText}>{up.date}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Get Involved Action Cards */}
        <Text style={styles.sectionHeading}>Get Involved</Text>
        <View style={styles.actionsList}>
          {stream.actions.map((act, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.actionRowCard, { backgroundColor: act.bgColor }]}
              onPress={() => router.push(act.title.toLowerCase().includes("donate") ? "/(tabs)/donate" : "/(tabs)/volunteer")}
              activeOpacity={0.88}
            >
              <View style={[styles.actionRowIconCircle, { borderColor: act.iconColor + "30" }]}>
                <Ionicons name={act.icon as any} size={20} color={act.iconColor} />
              </View>
              <View style={styles.actionRowContent}>
                <Text style={[styles.actionRowTitle, { color: act.iconColor }]}>{act.title}</Text>
                <Text style={styles.actionRowSubtitle}>{act.subtitle}</Text>
              </View>
              <View style={[styles.actionRowArrow, { backgroundColor: act.arrowColor }]}>
                <Ionicons name="arrow-forward" size={13} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Bottom Dual Action CTAs */}
        <View style={styles.bottomCTAsRow}>
          <TouchableOpacity
            style={styles.upcomingProgramsBtn}
            onPress={() => Alert.alert("Programs Schedule", "Upcoming seva drives are organized every Sunday in Vrindavan.")}
            activeOpacity={0.85}
          >
            <Ionicons name="calendar-outline" size={18} color="#166534" style={{ marginRight: 6 }} />
            <Text style={styles.upcomingProgramsText}>Upcoming Programs</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.supportInitiativeBtn}
            onPress={() => setSupportModalVisible(true)}
            activeOpacity={0.88}
          >
            <MaterialCommunityIcons name="hand-heart-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
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
                  router.push("/(tabs)/volunteer");
                }}
              >
                <Text style={styles.modalActionBtnText}>🤝 Join as Volunteer</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalActionBtn, { backgroundColor: "#164E2E", marginTop: 10 }]}
                onPress={() => {
                  setSupportModalVisible(false);
                  router.push("/(tabs)/volunteer");
                }}
              >
                <Text style={styles.modalActionBtnText}>💚 Make a Contribution</Text>
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
    paddingVertical: 12,
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
  headerRightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  headerActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 30,
  },
  heroCard: {
    height: 200,
    borderRadius: 24,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#0F172A",
    marginBottom: 16,
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
  heroIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.soft,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.2,
  },
  heroSubtitle: {
    fontSize: 12,
    color: "#E2E8F0",
    lineHeight: 16,
    maxWidth: 270,
  },
  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  metricCard: {
    width: (width - 40 - 24) / 4,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    ...Shadows.soft,
  },
  metricIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F0FDF4",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 13,
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
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 16,
    marginBottom: 18,
    ...Shadows.soft,
  },
  aboutHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  aboutIdeaCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F0FDF4",
    alignItems: "center",
    justifyContent: "center",
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 10,
    letterSpacing: -0.2,
  },
  aboutText: {
    fontSize: 12,
    color: "#475569",
    lineHeight: 19,
  },
  whatWeDoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 18,
    gap: 10,
  },
  whatWeDoCard: {
    width: (width - 50) / 2,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 14,
    ...Shadows.soft,
  },
  whatWeDoIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F0FDF4",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  whatWeDoTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 2,
  },
  whatWeDoSubtitle: {
    fontSize: 10,
    color: "#64748B",
    lineHeight: 14,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#166534",
  },
  galleryScroll: {
    gap: 10,
    marginBottom: 18,
  },
  galleryThumb: {
    width: 100,
    height: 80,
    borderRadius: 14,
    overflow: "hidden",
  },
  galleryImage: {
    width: "100%",
    height: "100%",
  },
  updatesContainer: {
    gap: 10,
    marginBottom: 18,
  },
  updateCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
    ...Shadows.soft,
  },
  updateImage: {
    width: 90,
    height: 80,
  },
  updateInfo: {
    flex: 1,
    padding: 10,
    justifyContent: "center",
  },
  updateTagBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  updateTagText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#166534",
  },
  updateTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0F172A",
    lineHeight: 16,
  },
  updateDateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  updateDateText: {
    fontSize: 10,
    color: "#94A3B8",
  },
  actionsList: {
    gap: 10,
    marginBottom: 20,
  },
  actionRowCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    ...Shadows.soft,
  },
  actionRowIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    marginRight: 12,
  },
  actionRowContent: {
    flex: 1,
  },
  actionRowTitle: {
    fontSize: 13,
    fontWeight: "800",
  },
  actionRowSubtitle: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 1,
  },
  actionRowArrow: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomCTAsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 6,
  },
  upcomingProgramsBtn: {
    flex: 1,
    height: 50,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#166534",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  upcomingProgramsText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#166534",
  },
  supportInitiativeBtn: {
    flex: 1,
    height: 50,
    backgroundColor: "#166534",
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.primaryBtn,
  },
  supportInitiativeText: {
    fontSize: 12,
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
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#164E2E",
  },
  modalDesc: {
    fontSize: 13,
    color: "#475569",
    lineHeight: 19,
    marginBottom: 20,
  },
  modalActionBtn: {
    height: 48,
    backgroundColor: "#166534",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  modalActionBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
});
