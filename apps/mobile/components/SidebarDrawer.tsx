import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Modal,
  Image,
  ScrollView,
  Linking,
  Alert,
  Share,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { Colors, Shadows } from "../lib/theme";
import { getStoredUser, clearAuthSession } from "../lib/secureStore";
import ActionDialog from "./ActionDialog";

const { width, height } = Dimensions.get("window");
const DRAWER_WIDTH = Math.min(width * 0.82, 320);

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MenuItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  iconType: "ionicons" | "material" | "fa5";
  route?: string;
  badge?: string;
  badgeBg?: string;
  badgeColor?: string;
  onPress?: () => void;
}

export default function SidebarDrawer({ isOpen, onClose }: SidebarDrawerProps) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isOpen) {
      loadUserData();
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -DRAWER_WIDTH,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isOpen]);

  const loadUserData = async () => {
    try {
      const stored = await getStoredUser();
      setUser(stored);
    } catch (e) {
      setUser(null);
    }
  };

  const handleNavigate = (route?: string) => {
    onClose();
    if (route) {
      router.push(route as any);
    }
  };

  const handleCallDesk = () => {
    onClose();
    Linking.openURL("tel:+919927081650").catch(() => {
      Alert.alert("Helpline", "Prayas 24/7 Seva Coordination Desk: +91 99270 81650");
    });
  };

  const handleShareApp = async () => {
    try {
      await Share.share({
        message: "Join Prayas Pariwaar in serving humanity across education, emergency blood donation, tree plantation & free healthcare in Vrindavan! Download the app today.",
      });
    } catch (e) {
      // ignore
    }
  };

  const handleLogout = () => {
    setLogoutDialogOpen(true);
  };

  const confirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await clearAuthSession();
      setUser(null);
      setLogoutDialogOpen(false);
      onClose();
      router.replace("/(auth)/login" as any);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const SEVA_STREAMS_MENU: MenuItem[] = [
    {
      id: "home",
      title: "Home Overview",
      subtitle: "Dashboard & Live Highlights",
      icon: "home-outline",
      iconType: "ionicons",
      route: "/(tabs)/home",
    },
    {
      id: "all-seva",
      title: "All Seva Projects",
      subtitle: "6 Active Grassroots Drives",
      icon: "grid-outline",
      iconType: "ionicons",
      route: "/(tabs)/seva",
    },
    {
      id: "blood",
      title: "Emergency Blood Desk",
      subtitle: "Donor Network & Rapid Request",
      icon: "water-outline",
      iconType: "ionicons",
      badge: "24/7",
      badgeBg: "#FEE2E2",
      badgeColor: "#DC2626",
      route: "/blood-donor-registration",
    },
    {
      id: "medical-bank",
      title: "Medical Equipment Bank",
      subtitle: "Free Oxygen, Beds & Wheelchairs",
      icon: "medkit-outline",
      iconType: "ionicons",
      badge: "Free",
      badgeBg: "#CCFBF1",
      badgeColor: "#0F766E",
      route: "/medical-request",
    },
    {
      id: "education",
      title: "Free Education",
      subtitle: "Tuition & Learning Centers",
      icon: "school-outline",
      iconType: "ionicons",
      route: "/seva/education",
    },
    {
      id: "plantation",
      title: "Tree Plantation",
      subtitle: "Harit Kranti Braj Parikrama",
      icon: "leaf-outline",
      iconType: "ionicons",
      route: "/seva/plantation",
    },
    {
      id: "jeev-jal",
      title: "Jeev Jal Seva",
      subtitle: "Bird Bowls & Animal Feeders",
      icon: "bird",
      iconType: "material",
      route: "/seva/jeev-jal",
    },
    {
      id: "vocational",
      title: "Vocational Skills",
      subtitle: "Youth Skills & Women Tailoring",
      icon: "cog-outline",
      iconType: "material",
      route: "/seva/vocational",
    },
  ];

  const ENGAGEMENT_MENU: MenuItem[] = [
    {
      id: "gallery",
      title: "Seva Photo Gallery",
      subtitle: "Authentic Field Documentation",
      icon: "images-outline",
      iconType: "ionicons",
      route: "/gallery",
    },
    {
      id: "blogs",
      title: "Dispatches & Stories",
      subtitle: "Field Reports & Milestones",
      icon: "newspaper-outline",
      iconType: "ionicons",
      route: "/(tabs)/blogs",
    },
    {
      id: "volunteer",
      title: "Join as Volunteer",
      subtitle: "850+ Taskforce in Braj",
      icon: "people-outline",
      iconType: "ionicons",
      route: "/volunteer-form",
    },
    {
      id: "donate",
      title: "Support / Donate",
      subtitle: "Empower Grassroots Seva",
      icon: "heart-outline",
      iconType: "ionicons",
      badge: "100% Direct Seva",
      badgeBg: "#DCFCE7",
      badgeColor: "#166534",
      route: "/(tabs)/donate",
    },
  ];

  const SUPPORT_MENU: MenuItem[] = [
    {
      id: "notifications",
      title: "Notifications & Alerts",
      subtitle: "Broadcasts & Status Updates",
      icon: "notifications-outline",
      iconType: "ionicons",
      route: "/notifications",
    },
    {
      id: "contact",
      title: "Contact & Centers",
      subtitle: "Office Locations in Mathura",
      icon: "location-outline",
      iconType: "ionicons",
      route: "/contact-us",
    },
    {
      id: "helpline",
      title: "Emergency Helpline Desk",
      subtitle: "One-Tap Call (+91 99270 81650)",
      icon: "call-outline",
      iconType: "ionicons",
      badge: "Direct Line",
      badgeBg: "#F0FDF4",
      badgeColor: "#166534",
      onPress: handleCallDesk,
    },
  ];

  const renderIcon = (item: MenuItem, color = "#1D4ED8") => {
    if (item.iconType === "material") {
      return <MaterialCommunityIcons name={item.icon as any} size={20} color={color} />;
    }
    if (item.iconType === "fa5") {
      return <FontAwesome5 name={item.icon as any} size={18} color={color} />;
    }
    return <Ionicons name={item.icon as any} size={20} color={color} />;
  };

  return (
    <>
      <Modal visible={isOpen} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        {/* Animated Dim Backdrop */}
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
          <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={onClose} activeOpacity={1} />
        </Animated.View>

        {/* Sliding Drawer Container */}
        <Animated.View style={[styles.drawerContainer, { transform: [{ translateX: slideAnim }] }]}>
          <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
            {/* Drawer Header Brand Bar */}
            <View style={styles.drawerHeader}>
              <View style={styles.drawerBrandRow}>
                <Image
                  source={require("../assets/images/prayas-logo-blue.png")}
                  style={styles.drawerLogo}
                  resizeMode="contain"
                />
                <View style={styles.drawerBrandTextCol}>
                  <Text style={styles.drawerBrandName}>PRAYAS</Text>
                  <Text style={styles.drawerTagline}>A TRIAL TO MOVE AHEAD</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.8}>
                <Ionicons name="close" size={22} color="#1E293B" />
              </TouchableOpacity>
            </View>

            {/* User Profile / Guest Card */}
            <TouchableOpacity
              style={styles.userCard}
              onPress={() => handleNavigate(user ? "/(tabs)/profile" : "/(auth)/login")}
              activeOpacity={0.85}
            >
              <View style={styles.userAvatarBox}>
                {user?.avatarUrl || user?.avatar ? (
                  <Image
                    source={{ uri: user.avatarUrl || user.avatar }}
                    style={styles.userAvatarImg}
                  />
                ) : user?.name ? (
                  <Text style={styles.userAvatarInitials}>
                    {user.name.substring(0, 2).toUpperCase()}
                  </Text>
                ) : (
                  <MaterialCommunityIcons name="account" size={24} color="#1D4ED8" />
                )}
              </View>

              <View style={styles.userInfoCol}>
                <Text style={styles.userName} numberOfLines={1}>
                  {user?.name || "Seva Supporter"}
                </Text>
                <Text style={styles.userEmail} numberOfLines={1}>
                  {user?.email || "Tap to sign in / manage account"}
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
            </TouchableOpacity>

            {/* Scrollable Navigation Menu */}
            <ScrollView
              style={styles.menuScroll}
              contentContainerStyle={styles.menuScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* SECTION: SEVA STREAMS */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>SEVA INITIATIVES</Text>
                <View style={styles.sectionDivider} />
              </View>

              {SEVA_STREAMS_MENU.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.menuItem}
                  onPress={() => (item.onPress ? item.onPress() : handleNavigate(item.route))}
                  activeOpacity={0.75}
                >
                  <View style={styles.menuIconCircle}>
                    {renderIcon(item, "#1D4ED8")}
                  </View>
                  <View style={styles.menuTextCol}>
                    <Text style={styles.menuTitle}>{item.title}</Text>
                    {item.subtitle ? <Text style={styles.menuSubtitle}>{item.subtitle}</Text> : null}
                  </View>
                  {item.badge ? (
                    <View style={[styles.badgePill, { backgroundColor: item.badgeBg }]}>
                      <Text style={[styles.badgeText, { color: item.badgeColor }]}>{item.badge}</Text>
                    </View>
                  ) : (
                    <Ionicons name="chevron-forward" size={14} color="#CBD5E1" />
                  )}
                </TouchableOpacity>
              ))}

              {/* SECTION: COMMUNITY & FIELDWORK */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>COMMUNITY & DRIVES</Text>
                <View style={styles.sectionDivider} />
              </View>

              {ENGAGEMENT_MENU.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.menuItem}
                  onPress={() => (item.onPress ? item.onPress() : handleNavigate(item.route))}
                  activeOpacity={0.75}
                >
                  <View style={[styles.menuIconCircle, { backgroundColor: "#F0FDF4" }]}>
                    {renderIcon(item, "#166534")}
                  </View>
                  <View style={styles.menuTextCol}>
                    <Text style={styles.menuTitle}>{item.title}</Text>
                    {item.subtitle ? <Text style={styles.menuSubtitle}>{item.subtitle}</Text> : null}
                  </View>
                  {item.badge ? (
                    <View style={[styles.badgePill, { backgroundColor: item.badgeBg }]}>
                      <Text style={[styles.badgeText, { color: item.badgeColor }]}>{item.badge}</Text>
                    </View>
                  ) : (
                    <Ionicons name="chevron-forward" size={14} color="#CBD5E1" />
                  )}
                </TouchableOpacity>
              ))}

              {/* SECTION: HELP & SUPPORT */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>SUPPORT & HELPLINE</Text>
                <View style={styles.sectionDivider} />
              </View>

              {SUPPORT_MENU.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.menuItem}
                  onPress={() => (item.onPress ? item.onPress() : handleNavigate(item.route))}
                  activeOpacity={0.75}
                >
                  <View style={[styles.menuIconCircle, { backgroundColor: "#EFF6FF" }]}>
                    {renderIcon(item, "#1D4ED8")}
                  </View>
                  <View style={styles.menuTextCol}>
                    <Text style={styles.menuTitle}>{item.title}</Text>
                    {item.subtitle ? <Text style={styles.menuSubtitle}>{item.subtitle}</Text> : null}
                  </View>
                  {item.badge ? (
                    <View style={[styles.badgePill, { backgroundColor: item.badgeBg }]}>
                      <Text style={[styles.badgeText, { color: item.badgeColor }]}>{item.badge}</Text>
                    </View>
                  ) : (
                    <Ionicons name="chevron-forward" size={14} color="#CBD5E1" />
                  )}
                </TouchableOpacity>
              ))}

              {/* Quick Social & Share Row */}
              <View style={styles.drawerQuickActionsRow}>
                <TouchableOpacity style={styles.quickActionBtn} onPress={handleCallDesk} activeOpacity={0.8}>
                  <Ionicons name="call" size={16} color="#1D4ED8" />
                  <Text style={styles.quickActionBtnText}>Call Desk</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.quickActionBtn} onPress={handleShareApp} activeOpacity={0.8}>
                  <Ionicons name="share-social" size={16} color="#166534" />
                  <Text style={styles.quickActionBtnText}>Share App</Text>
                </TouchableOpacity>
              </View>

              {/* Sign In / Sign Out Button */}
              {user ? (
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
                  <Ionicons name="log-out-outline" size={18} color="#DC2626" style={{ marginRight: 6 }} />
                  <Text style={styles.logoutBtnText}>Sign Out</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.loginBtn}
                  onPress={() => handleNavigate("/(auth)/login")}
                  activeOpacity={0.8}
                >
                  <Ionicons name="log-in-outline" size={18} color="#1D4ED8" style={{ marginRight: 6 }} />
                  <Text style={styles.loginBtnText}>Sign In / Register</Text>
                </TouchableOpacity>
              )}

              {/* Version & Org Footer */}
              <View style={styles.drawerFooter}>
                <Text style={styles.footerOrgText}>Prayas Sanstha (Regd. NGO)</Text>
                <Text style={styles.footerSubText}>Mathura & Vrindavan • v1.2.0</Text>
              </View>
            </ScrollView>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>

    {/* Sign Out Confirmation Dialog */}
    <ActionDialog
      visible={logoutDialogOpen}
      onClose={() => setLogoutDialogOpen(false)}
      onConfirm={confirmLogout}
      title="Sign Out"
      description="Are you sure you want to sign out from Prayas app?"
      confirmText="Sign Out"
      cancelText="Cancel"
      type="danger"
      icon="log-out-outline"
      loading={isLoggingOut}
    />
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    flexDirection: "row",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
  },
  drawerContainer: {
    width: DRAWER_WIDTH,
    height: "100%",
    backgroundColor: "#FFFFFF",
    ...Shadows.card,
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  drawerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  drawerBrandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  drawerLogo: {
    width: 36,
    height: 36,
    borderRadius: 8,
  },
  drawerBrandTextCol: {
    alignItems: "flex-start",
  },
  drawerBrandName: {
    fontSize: 16,
    fontWeight: "900",
    color: "#1E3A8A",
    letterSpacing: 1,
  },
  drawerTagline: {
    fontSize: 8.5,
    fontWeight: "800",
    color: "#1D4ED8",
    letterSpacing: 0.4,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    marginHorizontal: 14,
    marginTop: 10,
    marginBottom: 6,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  userAvatarBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    overflow: "hidden",
  },
  userAvatarImg: {
    width: "100%",
    height: "100%",
  },
  userAvatarInitials: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1D4ED8",
  },
  userInfoCol: {
    flex: 1,
  },
  userName: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
  },
  userEmail: {
    fontSize: 10,
    color: "#64748B",
    marginTop: 1,
  },
  menuScroll: {
    flex: 1,
  },
  menuScrollContent: {
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: "#94A3B8",
    letterSpacing: 0.6,
    marginRight: 8,
  },
  sectionDivider: {
    flex: 1,
    height: 1,
    backgroundColor: "#F1F5F9",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 9,
    paddingHorizontal: 6,
    borderRadius: 8,
  },
  menuIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  menuTextCol: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 12.5,
    fontWeight: "800",
    color: "#1E293B",
  },
  menuSubtitle: {
    fontSize: 9.5,
    color: "#64748B",
    marginTop: 1,
  },
  badgePill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: "800",
  },
  drawerQuickActionsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
    marginBottom: 10,
  },
  quickActionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  quickActionBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#334155",
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    paddingVertical: 9,
    borderRadius: 8,
    marginTop: 6,
  },
  logoutBtnText: {
    color: "#DC2626",
    fontSize: 12,
    fontWeight: "800",
  },
  loginBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    paddingVertical: 9,
    borderRadius: 8,
    marginTop: 6,
  },
  loginBtnText: {
    color: "#1D4ED8",
    fontSize: 12,
    fontWeight: "800",
  },
  drawerFooter: {
    alignItems: "center",
    marginTop: 18,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  footerOrgText: {
    fontSize: 10.5,
    fontWeight: "800",
    color: "#475569",
  },
  footerSubText: {
    fontSize: 9.5,
    color: "#94A3B8",
    marginTop: 2,
  },
});
