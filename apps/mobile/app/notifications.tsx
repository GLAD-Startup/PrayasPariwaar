import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors, Shadows } from "../lib/theme";

interface NotificationItem {
  id: string;
  category: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  iconName: string;
  iconType: "ionicons" | "material";
  iconColor: string;
  iconBg: string;
  iconBorder: string;
  route?: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    category: "Upcoming Event",
    title: "Upcoming Event",
    message: "Tree Plantation Drive is on 24 May 2024 at Braj Parikrama Marg.",
    time: "10m ago",
    read: false,
    iconName: "leaf-outline",
    iconType: "ionicons",
    iconColor: "#D97706",
    iconBg: "#FFFBEB",
    iconBorder: "#FDE68A",
    route: "/(tabs)/home",
  },
  {
    id: "notif-2",
    category: "Donation Thank You",
    title: "Donation Thank You",
    message: "Thank you for your donation. Your support makes a difference.",
    time: "2h ago",
    read: false,
    iconName: "shield-checkmark-outline",
    iconType: "ionicons",
    iconColor: "#16A34A",
    iconBg: "#F0FDF4",
    iconBorder: "#BBF7D0",
    route: "/my-donations",
  },
  {
    id: "notif-3",
    category: "New Blog Published",
    title: "New Blog Published",
    message: "Check out our latest blog 'Education for All' in Rohini Center.",
    time: "1d ago",
    read: true,
    iconName: "book-outline",
    iconType: "ionicons",
    iconColor: "#9333EA",
    iconBg: "#FAF5FF",
    iconBorder: "#E9D5FF",
    route: "/(tabs)/blogs",
  },
  {
    id: "notif-4",
    category: "Blood Donation Camp",
    title: "Blood Donation Camp",
    message: "Camp on 02 Jun 2024 at City Hospital. Register now!",
    time: "2d ago",
    read: true,
    iconName: "water-outline",
    iconType: "ionicons",
    iconColor: "#DC2626",
    iconBg: "#FEF2F2",
    iconBorder: "#FECACA",
    route: "/blood-request",
  },
  {
    id: "notif-5",
    category: "Volunteer Opportunity",
    title: "Volunteer Opportunity",
    message: "Teaching volunteers needed for our free evening learning center.",
    time: "3d ago",
    read: true,
    iconName: "school-outline",
    iconType: "ionicons",
    iconColor: "#D97706",
    iconBg: "#FFFBEB",
    iconBorder: "#FDE68A",
    route: "/volunteer-form",
  },
];

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    Alert.alert("All Caught Up", "All notifications marked as read.");
  };

  const handleNotificationPress = (notif: NotificationItem) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
    );
    if (notif.route) {
      router.push(notif.route as any);
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

        <Text style={styles.headerTitle}>Notifications</Text>

        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.list}>
          {notifications.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.notifCard,
                !item.read && styles.notifCardUnread,
              ]}
              onPress={() => handleNotificationPress(item)}
              activeOpacity={0.85}
            >
              {/* Left Icon */}
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: item.iconBg, borderColor: item.iconBorder },
                ]}
              >
                {item.iconType === "ionicons" ? (
                  <Ionicons name={item.iconName as any} size={20} color={item.iconColor} />
                ) : (
                  <MaterialCommunityIcons name={item.iconName as any} size={20} color={item.iconColor} />
                )}
              </View>

              {/* Middle Content */}
              <View style={styles.cardContent}>
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.cardCategory}>{item.category}</Text>
                  <Text style={styles.cardTime}>{item.time}</Text>
                </View>
                <Text style={styles.cardMessage}>{item.message}</Text>
              </View>

              {/* Unread Indicator Dot */}
              {!item.read && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          ))}
        </View>

        {/* Mark All as Read Button */}
        <TouchableOpacity
          style={styles.markAllBtn}
          onPress={markAllAsRead}
          activeOpacity={0.8}
        >
          <Text style={styles.markAllText}>Mark all as read</Text>
        </TouchableOpacity>
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 34,
  },
  list: {
    gap: 12,
    marginBottom: 20,
  },
  notifCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 14,
    position: "relative",
    ...Shadows.soft,
  },
  notifCardUnread: {
    backgroundColor: "#FAFAF9",
    borderColor: "#CBD5E1",
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
    paddingRight: 6,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 3,
  },
  cardCategory: {
    fontSize: 13,
    fontWeight: "800",
    color: "#164E2E",
  },
  cardTime: {
    fontSize: 10,
    color: "#94A3B8",
    fontWeight: "600",
  },
  cardMessage: {
    fontSize: 11,
    color: "#475569",
    lineHeight: 16,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#166534",
    position: "absolute",
    top: 14,
    right: 14,
  },
  markAllBtn: {
    alignItems: "center",
    paddingVertical: 14,
    marginTop: 6,
  },
  markAllText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#166534",
  },
});
