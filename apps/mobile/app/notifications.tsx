import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
  Modal,
  Switch,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors, Shadows } from "../lib/theme";
import { api } from "../lib/api";
import { getItem, setItem } from "../lib/secureStore";
import ActionDialog from "../components/ActionDialog";
import {
  getNotificationPreferences,
  saveNotificationPreferences,
  NotificationPreferences,
} from "../lib/notifications";

const { width } = Dimensions.get("window");

export interface NotificationItem {
  id: string;
  category: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: string;
  route?: string;
  createdAt: string;
}

const FALLBACK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    category: "Emergency Blood",
    title: "🚨 URGENT: O+ Blood Needed at Ramakrishna Mission Hospital",
    message: "2 units of O-Positive blood needed urgently for emergency patient in Vrindavan. Call +91 99270 81650.",
    time: "Just now",
    read: false,
    type: "BLOOD_REQUEST",
    route: "/blood-request",
    createdAt: new Date().toISOString(),
  },
  {
    id: "notif-2",
    category: "Tree Plantation",
    title: "🌱 Vrindavan Harit Kranti - 350 Native Saplings Drive",
    message: "Join our volunteers this Sunday morning at 7:00 AM along Parikrama Marg for planting native Neem & Peepal trees.",
    time: "2h ago",
    read: false,
    type: "EVENT",
    route: "/seva/plantation",
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: "notif-3",
    category: "Free Health Camp",
    title: "🩺 Jan Swasthya Free Health & Eye Camp",
    message: "Free pediatric, dental, and cataract screening camp at Chhatikara Village with free essential medicine distribution.",
    time: "1d ago",
    read: true,
    type: "HEALTH_CAMP",
    route: "/seva/health",
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
  {
    id: "notif-4",
    category: "Equipment Bank",
    title: "📦 10 New Oxygen Concentrators Added to Seva Bank",
    message: "24/7 free medical equipment loans (Oxygen Concentrators, Fowler Beds, Wheelchairs) available at Raman Reti Center.",
    time: "2d ago",
    read: true,
    type: "EQUIPMENT",
    route: "/medical-request",
    createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
  },
  {
    id: "notif-5",
    category: "Free Education",
    title: "🎓 Project Aashayein Remedial Evening Batches",
    message: "New evening tutoring batches started for underprivileged children. Sponsor a student kit for ₹500/month (100% Direct Aid).",
    time: "3d ago",
    read: true,
    type: "EDUCATION",
    route: "/seva/education",
    createdAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
  },
];

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>(FALLBACK_NOTIFICATIONS);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"ALL" | "EMERGENCY" | "SEVA" | "EQUIPMENT">("ALL");

  // Push Notification Settings state
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [dialogState, setDialogState] = useState<{
    visible: boolean;
    title: string;
    description: string;
    type: "success" | "warning" | "danger" | "primary" | "info";
    icon: string;
    badge?: string;
  }>({
    visible: false,
    title: "",
    description: "",
    type: "primary",
    icon: "information-circle-outline",
  });
  const [prefs, setPrefs] = useState<NotificationPreferences>({
    pushEnabled: true,
    emergencyBloodAlerts: true,
    sevaDrivesAnnouncements: true,
    soundEnabled: true,
  });

  const fetchNotifications = useCallback(async () => {
    try {
      // 1. Load preferences
      const currentPrefs = await getNotificationPreferences();
      setPrefs(currentPrefs);

      // 2. Load read IDs from storage
      const readIdsStr = await getItem("prayas_read_notification_ids");
      const readIds = new Set<string>(readIdsStr ? JSON.parse(readIdsStr) : []);

      // 3. Fetch live notifications from backend API
      const res = await api.get<any>("/notifications");
      if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
        const liveItems: NotificationItem[] = res.data.data.map((item: any) => {
          const type = item.type || "GENERAL";
          let category = "Seva Announcement";
          let route = "/(tabs)/home";

          if (type === "BLOOD_REQUEST" || item.title.includes("Blood") || item.title.includes("🚨")) {
            category = "Emergency Blood";
            route = "/blood-request";
          } else if (type === "EVENT" || item.title.includes("Plantation") || item.title.includes("Harit")) {
            category = "Tree Plantation";
            route = "/seva/plantation";
          } else if (type === "HEALTH_CAMP" || item.title.includes("Health") || item.title.includes("Swasthya")) {
            category = "Free Health Camp";
            route = "/seva/health";
          } else if (type === "EQUIPMENT_UPDATE" || item.title.includes("Equipment") || item.title.includes("Oxygen")) {
            category = "Equipment Bank";
            route = "/medical-request";
          } else if (item.title.includes("Aashayein") || item.title.includes("Education")) {
            category = "Free Education";
            route = "/seva/education";
          }

          const diffMs = Date.now() - new Date(item.createdAt).getTime();
          const diffMins = Math.floor(diffMs / 60000);
          const diffHours = Math.floor(diffMins / 60);
          const diffDays = Math.floor(diffHours / 24);

          let timeStr = "Just now";
          if (diffDays > 0) timeStr = `${diffDays}d ago`;
          else if (diffHours > 0) timeStr = `${diffHours}h ago`;
          else if (diffMins > 0) timeStr = `${diffMins}m ago`;

          return {
            id: item.id,
            category,
            title: item.title,
            message: item.body || item.message,
            time: timeStr,
            read: readIds.has(item.id),
            type,
            route,
            createdAt: item.createdAt,
          };
        });

        setNotifications(liveItems);
      }
    } catch (e) {
      console.log("[Notifications Load Notice]", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const markAllAsRead = async () => {
    const allIds = notifications.map((n) => n.id);
    await setItem("prayas_read_notification_ids", JSON.stringify(allIds));
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setDialogState({
      visible: true,
      title: "All Caught Up!",
      description: "All broadcasts, alerts, and field updates have been marked as read.",
      type: "success",
      icon: "checkmark-done-circle-outline",
      badge: "NOTIFICATIONS CLEARED",
    });
  };

  const handleNotificationPress = async (notif: NotificationItem) => {
    const readIdsStr = await getItem("prayas_read_notification_ids");
    const readIds = new Set<string>(readIdsStr ? JSON.parse(readIdsStr) : []);
    readIds.add(notif.id);
    await setItem("prayas_read_notification_ids", JSON.stringify(Array.from(readIds)));

    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
    );

    if (notif.route) {
      router.push(notif.route as any);
    }
  };

  const handleTogglePreference = async (key: keyof NotificationPreferences, value: boolean) => {
    const updated = { ...prefs, [key]: value };
    setPrefs(updated);
    await saveNotificationPreferences(updated);
  };

  const filteredNotifications = notifications.filter((item) => {
    if (activeFilter === "EMERGENCY") return item.category.includes("Blood") || item.type === "BLOOD_REQUEST";
    if (activeFilter === "SEVA") return item.category.includes("Plantation") || item.category.includes("Education") || item.category.includes("Health");
    if (activeFilter === "EQUIPMENT") return item.category.includes("Equipment");
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIconConfig = (category: string) => {
    if (category.includes("Blood")) {
      return {
        icon: "water" as const,
        color: "#DC2626",
        bg: "#FEF2F2",
        border: "#FECACA",
      };
    }
    if (category.includes("Plantation")) {
      return {
        icon: "leaf" as const,
        color: "#16A34A",
        bg: "#F0FDF4",
        border: "#BBF7D0",
      };
    }
    if (category.includes("Health")) {
      return {
        icon: "medkit" as const,
        color: "#0284C7",
        bg: "#F0F9FF",
        border: "#BAE6FD",
      };
    }
    if (category.includes("Equipment")) {
      return {
        icon: "fitness" as const,
        color: "#7C3AED",
        bg: "#FAF5FF",
        border: "#E9D5FF",
      };
    }
    if (category.includes("Education")) {
      return {
        icon: "school" as const,
        color: Colors.primary,
        bg: "#EFF6FF",
        border: "#BFDBFE",
      };
    }
    return {
      icon: "notifications" as const,
      color: Colors.primary,
      bg: "#EFF6FF",
      border: "#BFDBFE",
    };
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
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>

        <View style={styles.headerTitleCenter}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>{unreadCount} new</Text>
            </View>
          )}
        </View>

        {/* Action Controls: Settings Cog & Clear */}
        <View style={styles.headerRightActions}>
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={() => setSettingsModalVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="settings-outline" size={20} color={Colors.primary} />
          </TouchableOpacity>

          {unreadCount > 0 && (
            <TouchableOpacity onPress={markAllAsRead} style={styles.markReadHeaderBtn}>
              <Text style={styles.markReadHeaderText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Push Status Banner if turned off */}
      {!prefs.pushEnabled && (
        <TouchableOpacity
          style={styles.pushDisabledBanner}
          onPress={() => setSettingsModalVisible(true)}
          activeOpacity={0.9}
        >
          <Ionicons name="notifications-off" size={16} color="#D97706" style={{ marginRight: 8 }} />
          <Text style={styles.pushDisabledBannerText}>
            Push alerts are paused. Tap to configure settings.
          </Text>
          <Ionicons name="chevron-forward" size={16} color="#D97706" />
        </TouchableOpacity>
      )}

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {[
            { id: "ALL", label: `All (${notifications.length})` },
            { id: "EMERGENCY", label: "🚨 Blood Alerts" },
            { id: "SEVA", label: "🌱 Seva Drives" },
            { id: "EQUIPMENT", label: "📦 Medical Bank" },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.filterChip,
                activeFilter === tab.id && styles.filterChipActive,
              ]}
              onPress={() => setActiveFilter(tab.id as any)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.filterChipText,
                  activeFilter === tab.id && styles.filterChipTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Fetching live notifications...</Text>
        </View>
      ) : (
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
          {filteredNotifications.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="notifications-off-outline" size={36} color={Colors.primary} />
              </View>
              <Text style={styles.emptyTitle}>All Caught Up!</Text>
              <Text style={styles.emptySubtitle}>
                No notifications in this category right now. You will receive real-time alerts for emergency blood requests and seva drives.
              </Text>
            </View>
          ) : (
            <View style={styles.list}>
              {filteredNotifications.map((item) => {
                const iconCfg = getIconConfig(item.category);
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.notifCard,
                      !item.read && styles.notifCardUnread,
                    ]}
                    onPress={() => handleNotificationPress(item)}
                    activeOpacity={0.85}
                  >
                    {/* Left Icon Badge */}
                    <View
                      style={[
                        styles.iconCircle,
                        { backgroundColor: iconCfg.bg, borderColor: iconCfg.border },
                      ]}
                    >
                      <Ionicons name={iconCfg.icon} size={20} color={iconCfg.color} />
                    </View>

                    {/* Middle Content */}
                    <View style={styles.cardContent}>
                      <View style={styles.cardHeaderRow}>
                        <Text style={[styles.cardCategory, { color: iconCfg.color }]}>
                          {item.category}
                        </Text>
                        <Text style={styles.cardTime}>{item.time}</Text>
                      </View>
                      <Text style={[styles.cardTitle, !item.read && styles.cardTitleUnread]} numberOfLines={2}>
                        {item.title}
                      </Text>
                      <Text style={styles.cardMessage} numberOfLines={3}>
                        {item.message}
                      </Text>
                    </View>

                    {/* Unread Blue Indicator Dot */}
                    {!item.read && <View style={styles.unreadDot} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </ScrollView>
      )}

      {/* Push Notification Settings Modal */}
      <Modal
        visible={settingsModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSettingsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject}
            onPress={() => setSettingsModalVisible(false)}
          />
          <View style={styles.settingsModalCard}>
            <View style={styles.settingsModalHeader}>
              <View style={styles.settingsHeaderLeft}>
                <Ionicons name="notifications" size={22} color={Colors.primary} />
                <Text style={styles.settingsModalTitle}>Push Notification Settings</Text>
              </View>
              <TouchableOpacity onPress={() => setSettingsModalVisible(false)}>
                <Ionicons name="close-circle" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.settingsModalDesc}>
              Control which alerts and push notifications you receive on this device:
            </Text>

            <View style={styles.settingsTogglesList}>
              {/* Master Push Switch */}
              <View style={styles.toggleRow}>
                <View style={styles.toggleTextCol}>
                  <Text style={styles.toggleTitle}>Allow Push Notifications</Text>
                  <Text style={styles.toggleSubtitle}>
                    Master toggle for lockscreen banners and emergency alerts
                  </Text>
                </View>
                <Switch
                  value={prefs.pushEnabled}
                  onValueChange={(val) => handleTogglePreference("pushEnabled", val)}
                  trackColor={{ false: "#CBD5E1", true: "#BFDBFE" }}
                  thumbColor={prefs.pushEnabled ? Colors.primary : "#94A3B8"}
                />
              </View>

              {/* Emergency Blood Alerts */}
              <View style={styles.toggleRow}>
                <View style={styles.toggleTextCol}>
                  <Text style={styles.toggleTitle}>🚨 Emergency Blood Alerts</Text>
                  <Text style={styles.toggleSubtitle}>
                    Critical hospital requirements and matched donor requests
                  </Text>
                </View>
                <Switch
                  value={prefs.emergencyBloodAlerts}
                  disabled={!prefs.pushEnabled}
                  onValueChange={(val) => handleTogglePreference("emergencyBloodAlerts", val)}
                  trackColor={{ false: "#CBD5E1", true: "#FECACA" }}
                  thumbColor={prefs.emergencyBloodAlerts && prefs.pushEnabled ? "#DC2626" : "#94A3B8"}
                />
              </View>

              {/* Seva Drives & Health Camps */}
              <View style={styles.toggleRow}>
                <View style={styles.toggleTextCol}>
                  <Text style={styles.toggleTitle}>🌱 Seva Drives & Events</Text>
                  <Text style={styles.toggleSubtitle}>
                    Plantation, education batches, and health camp schedules
                  </Text>
                </View>
                <Switch
                  value={prefs.sevaDrivesAnnouncements}
                  disabled={!prefs.pushEnabled}
                  onValueChange={(val) => handleTogglePreference("sevaDrivesAnnouncements", val)}
                  trackColor={{ false: "#CBD5E1", true: "#BBF7D0" }}
                  thumbColor={prefs.sevaDrivesAnnouncements && prefs.pushEnabled ? "#166534" : "#94A3B8"}
                />
              </View>

              {/* Sound & Vibration */}
              <View style={[styles.toggleRow, { borderBottomWidth: 0 }]}>
                <View style={styles.toggleTextCol}>
                  <Text style={styles.toggleTitle}>🔔 Sound & Vibration</Text>
                  <Text style={styles.toggleSubtitle}>
                    Play notification chime when high-priority alert arrives
                  </Text>
                </View>
                <Switch
                  value={prefs.soundEnabled}
                  disabled={!prefs.pushEnabled}
                  onValueChange={(val) => handleTogglePreference("soundEnabled", val)}
                  trackColor={{ false: "#CBD5E1", true: "#BFDBFE" }}
                  thumbColor={prefs.soundEnabled && prefs.pushEnabled ? Colors.primary : "#94A3B8"}
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.settingsDoneBtn}
              onPress={() => setSettingsModalVisible(false)}
            >
              <Text style={styles.settingsDoneBtnText}>Save & Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Universal ActionDialog */}
      <ActionDialog
        visible={dialogState.visible}
        onClose={() => setDialogState({ ...dialogState, visible: false })}
        title={dialogState.title}
        description={dialogState.description}
        type={dialogState.type}
        icon={dialogState.icon}
        badge={dialogState.badge}
        confirmText="Got It"
        showCancel={false}
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitleCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1E3A8A",
    letterSpacing: -0.3,
  },
  headerBadge: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  headerBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.primary,
  },
  headerRightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  markReadHeaderBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  markReadHeaderText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.primary,
  },

  /* Disabled Push Banner */
  pushDisabledBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFBEB",
    borderBottomWidth: 1,
    borderBottomColor: "#FDE68A",
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  pushDisabledBannerText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
    color: "#B45309",
  },

  /* Filter Tabs */
  filterRow: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    paddingVertical: 8,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
  },
  filterChipTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  /* List & Content */
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 34,
  },
  list: {
    gap: 10,
  },
  notifCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 14,
    position: "relative",
    ...Shadows.card,
  },
  notifCardUnread: {
    backgroundColor: "#FFFFFF",
    borderColor: "#BFDBFE",
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    marginTop: 2,
  },
  cardContent: {
    flex: 1,
    paddingRight: 12,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  cardCategory: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  cardTime: {
    fontSize: 10,
    color: "#94A3B8",
    fontWeight: "600",
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 3,
    lineHeight: 18,
  },
  cardTitleUnread: {
    color: "#0F172A",
    fontWeight: "800",
  },
  cardMessage: {
    fontSize: 12,
    color: "#64748B",
    lineHeight: 17,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    position: "absolute",
    top: 14,
    right: 14,
  },

  /* Empty State */
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1E3A8A",
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 19,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: "#64748B",
  },

  /* Settings Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  settingsModalCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 34,
    ...Shadows.card,
  },
  settingsModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  settingsHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  settingsModalTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
  },
  settingsModalDesc: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 16,
    lineHeight: 17,
  },
  settingsTogglesList: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 16,
    marginBottom: 18,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  toggleTextCol: {
    flex: 1,
    paddingRight: 12,
  },
  toggleTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 2,
  },
  toggleSubtitle: {
    fontSize: 11,
    color: "#64748B",
    lineHeight: 15,
  },
  settingsDoneBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  settingsDoneBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
