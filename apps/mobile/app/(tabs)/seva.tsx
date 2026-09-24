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
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { Colors, Shadows } from "../../lib/theme";
import { api, resolveImageUrl } from "../../lib/api";
import { getCachedData, setCachedData } from "../../lib/cache";
import { prefetchRemoteImages } from "../../lib/assetPreloader";
import SidebarDrawer from "../../components/SidebarDrawer";
import PageSkeletonLoader from "../../components/PageSkeletonLoader";

const { width } = Dimensions.get("window");

export interface SevaProject {
  id: string;
  title: string;
  slug: string;
  category: string;
  status: "ACTIVE" | "COMPLETED" | "UPCOMING";
  description: string;
  coverImage: any;
  goalAmount: number;
  raisedAmount: number;
  startDate?: string;
  images?: string[];
}

export interface SevaStreamItem {
  id: string;
  number: string;
  title: string;
  color: string;
  description: string;
  tag: string;
  tagIcon: any;
  iconName: string;
  iconType: "ionicons" | "material";
  iconBg: string;
  iconBorder: string;
  iconColor: string;
  image: any;
}

const SEVA_STREAMS_DATA: SevaStreamItem[] = [
  {
    id: "education",
    number: "1",
    title: "Free Education",
    color: "#164E2E",
    description: "Providing quality education to underprivileged children and building a better future.",
    tag: "Empowering Minds",
    tagIcon: "people",
    iconName: "school-outline",
    iconType: "ionicons",
    iconBg: "#F0FDF4",
    iconBorder: "#BBF7D0",
    iconColor: "#16A34A",
    image: require("../../assets/images/hero-education-vrindavan.jpg"),
  },
  {
    id: "blood-donation",
    number: "2",
    title: "Blood Donation",
    color: "#DC2626",
    description: "Organizing blood donation camps and saving lives through 24/7 rapid emergency dispatch.",
    tag: "Donate Blood, Save Lives",
    tagIcon: "heart",
    iconName: "water-outline",
    iconType: "ionicons",
    iconBg: "#FEF2F2",
    iconBorder: "#FECACA",
    iconColor: "#DC2626",
    image: require("../../assets/images/medical-blood-seva.jpg"),
  },
  {
    id: "plantation",
    number: "3",
    title: "Plantation",
    color: "#15803D",
    description: "Planting native trees for a greener tomorrow and restoring sacred Braj groves.",
    tag: "Plant Today, Protect Tomorrow",
    tagIcon: "leaf",
    iconName: "leaf-outline",
    iconType: "ionicons",
    iconBg: "#F0FDF4",
    iconBorder: "#BBF7D0",
    iconColor: "#15803D",
    image: require("../../assets/images/vrindavan-plantation.jpg"),
  },
  {
    id: "jeev-jal",
    number: "4",
    title: "Jeev Jal Seva",
    color: "#1D4ED8",
    description: "Providing water for animals and birds and serving the community with pure compassion.",
    tag: "Water is Life, Service is Duty",
    tagIcon: "water",
    iconName: "bird",
    iconType: "material",
    iconBg: "#EFF6FF",
    iconBorder: "#BFDBFE",
    iconColor: "#2563EB",
    image: require("../../assets/onboarding/jeev_jal.jpg"),
  },
  {
    id: "vocational",
    number: "5",
    title: "Vocational Training",
    color: "#7E22CE",
    description: "Equipping youth with technical skills and tailoring to build self-reliance and dignity.",
    tag: "Skill Today, Success Tomorrow",
    tagIcon: "briefcase",
    iconName: "cog-outline",
    iconType: "material",
    iconBg: "#FAF5FF",
    iconBorder: "#E9D5FF",
    iconColor: "#9333EA",
    image: require("../../assets/images/youth-skills-vrindavan.jpg"),
  },
];

const INITIAL_PROJECTS: SevaProject[] = [
  {
    id: "proj-1",
    title: "Project Aashayein: Rural & Slum Child Education",
    slug: "aashayein-education",
    category: "EDUCATION",
    status: "ACTIVE",
    description:
      "Project Aashayein supports over 300 children from marginalized families in rural Mathura and semi-urban settlements of Vrindavan. We provide free school supplies, textbooks, uniforms, after-school remedial tutoring, and nutritious mid-day snacks.",
    coverImage: require("../../assets/images/hero-education-vrindavan.jpg"),
    goalAmount: 350000,
    raisedAmount: 215000,
  },
  {
    id: "proj-2",
    title: "Vrindavan Harit Kranti: Native Tree Plantation",
    slug: "vrindavan-harit-kranti",
    category: "PLANTATION",
    status: "ACTIVE",
    description:
      "Rapid urban development in Vrindavan has depleted traditional groves. Prayas leads community plantation drives of deep-rooted native species — Neem, Peepal, Banyan, and Pilu — along the Parikrama Marg with geo-tagging and tree-guard maintenance.",
    coverImage: require("../../assets/images/vrindavan-plantation.jpg"),
    goalAmount: 200000,
    raisedAmount: 180000,
  },
  {
    id: "proj-3",
    title: "Jan Swasthya Raksha: Free Health & Eye Care Camps",
    slug: "jan-swasthya-raksha",
    category: "HEALTH",
    status: "ACTIVE",
    description:
      "Monthly general health checkups, geriatric eye screening for cataract surgery, diagnostic tests, and free distribution of prescribed medicines for sadhus, widows, and low-income daily wage earners across Vrindavan.",
    coverImage: require("../../assets/images/health-camp-vrindavan.jpg"),
    goalAmount: 250000,
    raisedAmount: 160000,
  },
  {
    id: "proj-4",
    title: "Aadhar Career & Digital Vocational Counseling",
    slug: "aadhar-career-counseling",
    category: "AWARENESS",
    status: "ACTIVE",
    description:
      "Guiding rural high-school students with computer literacy, vocational aptitude testing, civil service coaching guidance, and anti-substance abuse awareness across government schools in Mathura.",
    coverImage: require("../../assets/images/youth-skills-vrindavan.jpg"),
    goalAmount: 150000,
    raisedAmount: 95000,
  },
  {
    id: "proj-5",
    title: "Emergency Blood Lifeline & Medical Bank",
    slug: "emergency-blood-lifeline",
    category: "HEALTH",
    status: "ACTIVE",
    description:
      "24/7 volunteer blood coordination desk, emergency donor mobilization for trauma patients, and free circulation of oxygen concentrators, wheelchairs, and fowler hospital beds across Braj region.",
    coverImage: require("../../assets/images/medical-blood-seva.jpg"),
    goalAmount: 200000,
    raisedAmount: 120000,
  },
  {
    id: "proj-6",
    title: "Jeev Jal Seva & Bird Sanctuaries",
    slug: "jeev-jal-seva-mission",
    category: "JEEV_JAL",
    status: "ACTIVE",
    description:
      "Installing terracotta earthen water bowls and cattle drinking troughs across the 84-Kos Parikrama Marg to protect cows, monkeys, and birds during peak summer heat in Vrindavan.",
    coverImage: require("../../assets/onboarding/jeev_jal.jpg"),
    goalAmount: 100000,
    raisedAmount: 75000,
  },
];

const CATEGORY_TABS = [
  { id: "ALL", label: "All Projects", icon: "apps-outline" },
  { id: "EDUCATION", label: "Education", icon: "school-outline" },
  { id: "HEALTH", label: "Healthcare", icon: "medkit-outline" },
  { id: "PLANTATION", label: "Plantation", icon: "leaf-outline" },
  { id: "AWARENESS", label: "Awareness", icon: "bulb-outline" },
  { id: "JEEV_JAL", label: "Jeev Jal", icon: "water-outline" },
  { id: "VOCATIONAL", label: "Vocational", icon: "briefcase-outline" },
];

export default function SevaScreen() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [projects, setProjects] = useState<SevaProject[]>(INITIAL_PROJECTS);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedProject, setSelectedProject] = useState<SevaProject | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      // 1. Instant 0ms read from disk cache
      const cached = await getCachedData<any[]>("prayas_projects");
      if (cached && Array.isArray(cached) && cached.length > 0) {
        const mappedCached = cached.map((p: any) => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          category: (p.category || "OTHER").toUpperCase(),
          status: p.status || "ACTIVE",
          description: p.description,
          coverImage: resolveImageUrl(p.coverImage, require("../../assets/images/hero-education-vrindavan.jpg")),
          goalAmount: Number(p.goalAmount) || 100000,
          raisedAmount: Number(p.raisedAmount) || 0,
        }));
        setProjects(mappedCached);
      }

      // 2. Fetch live updates
      const res = await api.get<any>("/projects");
      if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
        const imageUrls: string[] = [];
        const mapped = res.data.data.map((p: any) => {
          const resolvedImg = resolveImageUrl(p.coverImage, require("../../assets/images/hero-education-vrindavan.jpg"));
          if (typeof resolvedImg === "object" && resolvedImg.uri) {
            imageUrls.push(resolvedImg.uri);
          }
          return {
            id: p.id,
            title: p.title,
            slug: p.slug,
            category: (p.category || "OTHER").toUpperCase(),
            status: p.status || "ACTIVE",
            description: p.description,
            coverImage: resolvedImg,
            goalAmount: Number(p.goalAmount) || 100000,
            raisedAmount: Number(p.raisedAmount) || 0,
          };
        });

        if (imageUrls.length > 0) {
          await prefetchRemoteImages(imageUrls);
        }

        await setCachedData("prayas_projects", res.data.data);
        setProjects(mapped);
      }
    } catch (e) {
      console.warn("Using offline projects data:", e);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProjects();
    setRefreshing(false);
  };

  const filteredProjects = projects.filter((p) => {
    if (selectedCategory === "ALL") return true;
    if (selectedCategory === "HEALTH") return p.category === "HEALTH" || p.category === "HEALTHCARE";
    if (selectedCategory === "EDUCATION") return p.category === "EDUCATION";
    if (selectedCategory === "PLANTATION") return p.category === "PLANTATION";
    if (selectedCategory === "AWARENESS") return p.category === "AWARENESS";
    if (selectedCategory === "JEEV_JAL") return p.category === "JEEV_JAL" || p.category === "WATER";
    if (selectedCategory === "VOCATIONAL") return p.category === "VOCATIONAL";
    return p.category === selectedCategory;
  });

  const formatCurrency = (val: number) => {
    return `₹${val.toLocaleString("en-IN")}`;
  };

  const handleShareProject = async (proj: SevaProject) => {
    try {
      await Share.share({
        message: `Support ${proj.title} by Prayas Pariwaar Vrindavan. Empower grassroots seva in Braj!\n\n${proj.description.substring(0, 160)}...`,
      });
    } catch (e) {
      // ignore
    }
  };

  const handleDonateProject = (proj: SevaProject) => {
    setSelectedProject(null);
    router.push({
      pathname: "/(tabs)/donate",
      params: { cause: proj.title, project: proj.slug },
    } as any);
  };

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
          <Text style={styles.headerTitle}>Seva & Initiatives</Text>
          <Text style={styles.headerSubtitle}>Grassroots Impact Across Mathura & Vrindavan</Text>
        </View>

        <View style={styles.headerRightActions}>
          <TouchableOpacity
            style={styles.headerActionBtn}
            onPress={() => router.push("/gallery")}
            activeOpacity={0.8}
          >
            <Ionicons name="images-outline" size={20} color="#1D4ED8" />
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
        {/* ===================== SECTION 1: 5 PILLARS OF PRAYAS ===================== */}
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionHeaderLeft}>
            <View style={styles.pillarSectionIconBadge}>
              <Ionicons name="sparkles" size={14} color="#166534" />
            </View>
            <View>
              <Text style={styles.sectionTitle}>5 Pillars of Prayas</Text>
              <Text style={styles.sectionSubtitle}>Core streams of dedicated service • Tap to explore</Text>
            </View>
          </View>
        </View>

        {/* Pillars Horizontal Showcase */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillarsScrollContent}
        >
          {SEVA_STREAMS_DATA.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.pillarCard}
              onPress={() => router.push(`/seva/${item.id}` as any)}
              activeOpacity={0.9}
            >
              <View style={styles.pillarImageContainer}>
                <Image source={item.image} style={styles.pillarImage} resizeMode="cover" />
                <View style={styles.pillarBadge}>
                  <Text style={styles.pillarBadgeText}>Pillar #{item.number}</Text>
                </View>
                <View
                  style={[
                    styles.pillarFloatingIcon,
                    { backgroundColor: item.iconBg, borderColor: item.iconBorder },
                  ]}
                >
                  {item.iconType === "ionicons" ? (
                    <Ionicons name={item.iconName as any} size={16} color={item.iconColor} />
                  ) : (
                    <MaterialCommunityIcons name={item.iconName as any} size={16} color={item.iconColor} />
                  )}
                </View>
              </View>

              <View style={styles.pillarCardBody}>
                <Text style={styles.pillarCardTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.pillarCardDesc} numberOfLines={2}>
                  {item.description}
                </Text>
                <View style={styles.pillarCardFooter}>
                  <View style={styles.pillarCardTag}>
                    <Text style={[styles.pillarCardTagText, { color: item.color }]} numberOfLines={1}>
                      {item.tag}
                    </Text>
                  </View>
                  <Ionicons name="arrow-forward-circle" size={20} color={item.color} />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ===================== SECTION 2: ACTIVE PROJECTS & CAMPAIGNS ===================== */}
        <View style={[styles.sectionHeaderRow, { marginTop: 26 }]}>
          <View style={styles.sectionHeaderLeft}>
            <View style={[styles.pillarSectionIconBadge, { backgroundColor: "#FEF3C7" }]}>
              <MaterialCommunityIcons name="hand-heart" size={15} color="#D97706" />
            </View>
            <View>
              <Text style={styles.sectionTitle}>Active Projects & Drives</Text>
              <Text style={styles.sectionSubtitle}>Funded initiatives & ongoing campaigns in Braj</Text>
            </View>
          </View>
          <View style={styles.projectCountBadge}>
            <Text style={styles.projectCountText}>{filteredProjects.length} Active</Text>
          </View>
        </View>

        {/* Category Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryChipsScroll}
        >
          {CATEGORY_TABS.map((tab) => {
            const isActive = selectedCategory === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.categoryChip, isActive && styles.categoryChipActive]}
                onPress={() => setSelectedCategory(tab.id)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={tab.icon as any}
                  size={14}
                  color={isActive ? "#FFFFFF" : "#166534"}
                  style={{ marginRight: 5 }}
                />
                <Text style={[styles.categoryChipText, isActive && styles.categoryChipTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Projects List */}
        <View style={styles.projectsList}>
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project) => {
              const percent = Math.min(
                Math.round(((project.raisedAmount || 0) / (project.goalAmount || 1)) * 100),
                100
              );
              return (
                <View key={project.id} style={styles.projectCard}>
                  {/* Cover Photo */}
                  <View style={styles.projectImageWrapper}>
                    <Image
                      source={resolveImageUrl(project.coverImage, require("../../assets/images/hero-education-vrindavan.jpg"))}
                      style={styles.projectImage}
                      resizeMode="cover"
                    />
                    <View style={styles.projectCategoryBadge}>
                      <Text style={styles.projectCategoryText}>{project.category}</Text>
                    </View>
                    <View style={styles.projectStatusBadge}>
                      <View style={styles.activeDot} />
                      <Text style={styles.projectStatusText}>Active Seva</Text>
                    </View>
                  </View>

                  {/* Content Section */}
                  <View style={styles.projectContent}>
                    <Text style={styles.projectTitle} numberOfLines={2}>
                      {project.title}
                    </Text>

                    <Text style={styles.projectDesc} numberOfLines={3}>
                      {project.description}
                    </Text>

                    {/* Progress Metrics */}
                    <View style={styles.progressContainer}>
                      <View style={styles.progressHeaderRow}>
                        <Text style={styles.progressRaised}>
                          {formatCurrency(project.raisedAmount)}
                          <Text style={styles.progressGoal}> of {formatCurrency(project.goalAmount)}</Text>
                        </Text>
                        <Text style={styles.progressPercent}>{percent}%</Text>
                      </View>

                      <View style={styles.progressBarTrack}>
                        <View style={[styles.progressBarFill, { width: `${Math.max(percent, 8)}%` }]} />
                      </View>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.cardActionsRow}>
                      <TouchableOpacity
                        style={styles.detailsBtn}
                        onPress={() => setSelectedProject(project)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.detailsBtnText}>View Details</Text>
                        <Ionicons name="arrow-forward" size={14} color="#166534" style={{ marginLeft: 4 }} />
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.donateBtn}
                        onPress={() => handleDonateProject(project)}
                        activeOpacity={0.88}
                      >
                        <MaterialCommunityIcons name="hand-heart" size={15} color="#FFFFFF" style={{ marginRight: 5 }} />
                        <Text style={styles.donateBtnText}>Donate</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })
          ) : (
            <View style={styles.emptyProjectsCard}>
              <Ionicons name="cube-outline" size={38} color="#94A3B8" />
              <Text style={styles.emptyProjectsTitle}>No Projects in this Category</Text>
              <Text style={styles.emptyProjectsSub}>Check back soon or view all active campaigns across Braj.</Text>
              <TouchableOpacity
                style={styles.emptyProjectsBtn}
                onPress={() => setSelectedCategory("ALL")}
                activeOpacity={0.85}
              >
                <Text style={styles.emptyProjectsBtnText}>View All Projects</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Bottom Impact Banner */}
        <View style={styles.bottomBanner}>
          <View style={styles.bottomBannerLeft}>
            <Text style={styles.bottomBannerTitle}>Every contribution creates lasting impact.</Text>
            <Text style={styles.bottomBannerSubtitle}>
              Directly supporting underprivileged children, hospital patients, and Braj groves.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.bottomBannerBtn}
            onPress={() => router.push("/(tabs)/donate")}
            activeOpacity={0.88}
          >
            <Text style={styles.bottomBannerBtnText}>Support Seva</Text>
          </TouchableOpacity>
        </View>

        {/* Project Detail Modal */}
        {selectedProject && (
          <Modal visible={!!selectedProject} transparent animationType="slide">
            <View style={styles.modalOverlay}>
              <View style={styles.modalCard}>
                {/* Modal Header Bar */}
                <View style={styles.modalTopBar}>
                  <View style={styles.modalCategoryBadge}>
                    <Text style={styles.modalCategoryText}>{selectedProject.category}</Text>
                  </View>
                  <View style={styles.modalActionsRow}>
                    <TouchableOpacity
                      style={styles.modalActionBtn}
                      onPress={() => handleShareProject(selectedProject)}
                    >
                      <Ionicons name="share-social-outline" size={20} color="#164E2E" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.modalCloseBtn}
                      onPress={() => setSelectedProject(null)}
                    >
                      <Ionicons name="close" size={22} color="#0F172A" />
                    </TouchableOpacity>
                  </View>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} style={styles.modalBody}>
                  {/* Modal Cover Image */}
                  <Image
                    source={resolveImageUrl(selectedProject.coverImage, require("../../assets/images/hero-education-vrindavan.jpg"))}
                    style={styles.modalImage}
                    resizeMode="cover"
                  />

                  <Text style={styles.modalTitle}>{selectedProject.title}</Text>

                  {/* Modal Progress Info */}
                  <View style={styles.modalProgressBox}>
                    <View style={styles.progressHeaderRow}>
                      <Text style={styles.progressRaised}>
                        {formatCurrency(selectedProject.raisedAmount)}
                        <Text style={styles.progressGoal}> raised of {formatCurrency(selectedProject.goalAmount)}</Text>
                      </Text>
                      <Text style={styles.progressPercent}>
                        {Math.min(
                          Math.round(((selectedProject.raisedAmount || 0) / (selectedProject.goalAmount || 1)) * 100),
                          100
                        )}
                        %
                      </Text>
                    </View>
                    <View style={styles.progressBarTrack}>
                      <View
                        style={[
                          styles.progressBarFill,
                          {
                            width: `${Math.max(
                              Math.min(
                                Math.round(((selectedProject.raisedAmount || 0) / (selectedProject.goalAmount || 1)) * 100),
                                100
                              ),
                              8
                            )}%`,
                          },
                        ]}
                      />
                    </View>
                  </View>

                  <Text style={styles.modalSectionHeading}>About This Initiative</Text>
                  <Text style={styles.modalDescText}>{selectedProject.description}</Text>

                  <View style={styles.modalImpactHighlight}>
                    <Ionicons name="shield-checkmark" size={22} color="#16A34A" style={{ marginRight: 10 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.modalImpactTitle}>100% Direct Grassroots Seva</Text>
                      <Text style={styles.modalImpactSubtitle}>
                        Zero administrative deductions. Official society donation receipts issued.
                      </Text>
                    </View>
                  </View>
                </ScrollView>

                {/* Modal Bottom CTA */}
                <View style={styles.modalBottomBar}>
                  <TouchableOpacity
                    style={styles.modalDonateBtn}
                    onPress={() => handleDonateProject(selectedProject)}
                    activeOpacity={0.88}
                  >
                    <MaterialCommunityIcons name="hand-heart" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.modalDonateBtnText}>Donate to This Project</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        )}
      </ScrollView>

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
  headerTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "500",
    marginTop: 2,
  },
  headerRightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerActionBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  headerActionBtnVolunteer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#166534",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 4,
    ...Shadows.soft,
  },
  volunteerBtnText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  pillarSectionIconBadge: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.2,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 1,
  },
  projectCountBadge: {
    backgroundColor: "#F0FDF4",
    borderColor: "#BBF7D0",
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  projectCountText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#166534",
  },
  pillarsScrollContent: {
    gap: 12,
    paddingBottom: 4,
  },
  pillarCard: {
    width: 220,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
    ...Shadows.card,
  },
  pillarImageContainer: {
    width: "100%",
    height: 115,
    backgroundColor: "#E2E8F0",
    position: "relative",
  },
  pillarImage: {
    width: "100%",
    height: "100%",
  },
  pillarBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  pillarBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },
  pillarFloatingIcon: {
    position: "absolute",
    bottom: -14,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
    ...Shadows.soft,
  },
  pillarCardBody: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
  },
  pillarCardTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 4,
  },
  pillarCardDesc: {
    fontSize: 11,
    color: "#64748B",
    lineHeight: 15,
    marginBottom: 8,
  },
  pillarCardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pillarCardTag: {
    flex: 1,
    marginRight: 6,
  },
  pillarCardTagText: {
    fontSize: 10,
    fontWeight: "700",
  },
  emptyProjectsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 28,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  emptyProjectsTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#334155",
    marginTop: 10,
  },
  emptyProjectsSub: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
    marginTop: 4,
    marginBottom: 12,
  },
  emptyProjectsBtn: {
    backgroundColor: "#166534",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  emptyProjectsBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
  },
  categoryChipsScroll: {
    gap: 8,
    paddingBottom: 12,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    ...Shadows.soft,
  },
  categoryChipActive: {
    backgroundColor: "#166534",
    borderColor: "#166534",
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
  },
  categoryChipTextActive: {
    color: "#FFFFFF",
  },
  projectsList: {
    gap: 14,
  },
  projectCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
    ...Shadows.card,
  },
  projectImageWrapper: {
    width: "100%",
    height: 160,
    position: "relative",
    backgroundColor: "#E2E8F0",
  },
  projectImage: {
    width: "100%",
    height: "100%",
  },
  projectCategoryBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "rgba(22, 101, 52, 0.9)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  projectCategoryText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  projectStatusBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#16A34A",
  },
  projectStatusText: {
    color: "#166534",
    fontSize: 10,
    fontWeight: "800",
  },
  projectContent: {
    padding: 14,
  },
  projectTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 4,
    lineHeight: 20,
    letterSpacing: -0.2,
  },
  projectDesc: {
    fontSize: 11,
    color: "#64748B",
    lineHeight: 16,
    marginBottom: 10,
  },
  progressContainer: {
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  progressHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  progressRaised: {
    fontSize: 12,
    fontWeight: "800",
    color: "#166534",
  },
  progressGoal: {
    fontSize: 11,
    fontWeight: "500",
    color: "#64748B",
  },
  progressPercent: {
    fontSize: 11,
    fontWeight: "800",
    color: "#166534",
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: "#E2E8F0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#16A34A",
    borderRadius: 3,
  },
  cardActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailsBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#DCFCE7",
  },
  detailsBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#166534",
  },
  donateBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: "#166534",
    ...Shadows.soft,
  },
  donateBtnText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  bottomBanner: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#DCFCE7",
    padding: 14,
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...Shadows.soft,
  },
  bottomBannerLeft: {
    flex: 1,
    paddingRight: 10,
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
  bottomBannerBtn: {
    backgroundColor: "#166534",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  bottomBannerBtnText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "88%",
    paddingBottom: 20,
  },
  modalTopBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  modalCategoryBadge: {
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  modalCategoryText: {
    color: "#166534",
    fontSize: 11,
    fontWeight: "800",
  },
  modalActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  modalActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  modalBody: {
    paddingHorizontal: 18,
    paddingTop: 14,
  },
  modalImage: {
    width: "100%",
    height: 180,
    borderRadius: 16,
    marginBottom: 14,
    backgroundColor: "#E2E8F0",
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 10,
    lineHeight: 22,
  },
  modalProgressBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  modalSectionHeading: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 6,
  },
  modalDescText: {
    fontSize: 12,
    color: "#475569",
    lineHeight: 18,
    marginBottom: 14,
  },
  modalImpactHighlight: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#BBF7D0",
    marginBottom: 18,
  },
  modalImpactTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#166534",
  },
  modalImpactSubtitle: {
    fontSize: 10,
    color: "#64748B",
    marginTop: 2,
    lineHeight: 14,
  },
  modalBottomBar: {
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  modalDonateBtn: {
    backgroundColor: "#166534",
    paddingVertical: 13,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.soft,
  },
  modalDonateBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
});
