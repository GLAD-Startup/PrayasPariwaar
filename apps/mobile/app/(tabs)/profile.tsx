import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { getStoredUser, clearAuthSession } from "../../lib/secureStore";
import { registerForPushNotificationsAsync } from "../../lib/notifications";
import { BloodGroupDisplayMap } from "@prayas/utils";

export default function MobileProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [pushStatus, setPushStatus] = useState("Checking...");

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const stored = await getStoredUser();
    setUser(stored);
  };

  const handleTestPush = async () => {
    setPushStatus("Registering...");
    const token = await registerForPushNotificationsAsync(user?.id);
    if (token) {
      setPushStatus("Active & Registered");
      Alert.alert("Push Notification Active", `Token Registered: ${token.substring(0, 20)}...`);
    } else {
      setPushStatus("Permission Denied / Web Sim");
      Alert.alert("Push Status", "Push alerts enabled in simulation mode or pending device permission.");
    }
  };

  const handleLogout = async () => {
    await clearAuthSession();
    setUser(null);
    router.replace("/(auth)/login");
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Account & Preferences</Text>
      </View>

      {user ? (
        <View style={styles.card}>
          <View style={styles.avatarRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user.name?.charAt(0) || "U"}</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              <Text style={styles.userRole}>
                Role: {user.role} • Blood: {BloodGroupDisplayMap[user.bloodGroup] || user.bloodGroup || "Not Set"}
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>Sign Out of Device</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.guestTitle}>Guest Mode</Text>
          <Text style={styles.guestSubtitle}>
            Sign in or create an account to save your donor history and blood alerts profile.
          </Text>
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => router.push("/(auth)/login")}
          >
            <Text style={styles.loginBtnText}>Sign In / Register</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Push Notifications Card */}
      <View style={styles.card}>
        <Text style={styles.cardSectionTitle}>📲 Real-time Emergency Push Alerts</Text>
        <Text style={styles.cardDesc}>
          Ensure your device is registered to receive critical blood requirements in your city.
        </Text>

        <TouchableOpacity style={styles.pushBtn} onPress={handleTestPush}>
          <Text style={styles.pushBtnText}>🔔 Register / Verify Push Token</Text>
        </TouchableOpacity>
      </View>

      {/* NGO Credentials */}
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>🏛️ Prayas Humanitarian Society</Text>
        <Text style={styles.infoText}>• Reg No: PS-RAJ/2015/0982</Text>
        <Text style={styles.infoText}>• 80G Tax Exemption: AAATP1234F2101</Text>
        <Text style={styles.infoText}>• Darpan ID: RJ/2018/019283</Text>
        <Text style={styles.infoText}>• 24/7 Helpline: +91 98765 43210</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    padding: 20,
    paddingTop: 50,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#DC2626",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },
  userEmail: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  userRole: {
    fontSize: 11,
    color: "#DC2626",
    fontWeight: "700",
    marginTop: 2,
  },
  logoutBtn: {
    paddingVertical: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    backgroundColor: "#FEF2F2",
    borderRadius: 10,
  },
  logoutText: {
    color: "#DC2626",
    fontWeight: "700",
    fontSize: 12,
  },
  guestTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },
  guestSubtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
    marginBottom: 14,
  },
  loginBtn: {
    backgroundColor: "#DC2626",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  loginBtnText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 13,
  },
  cardSectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
  },
  cardDesc: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
    marginBottom: 12,
  },
  pushBtn: {
    backgroundColor: "#0F172A",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  pushBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 12,
  },
  infoBox: {
    backgroundColor: "#F1F5F9",
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#334155",
    marginBottom: 6,
  },
  infoText: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
  },
});
