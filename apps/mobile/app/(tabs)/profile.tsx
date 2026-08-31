import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  TextInput,
  StatusBar,
  Alert,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors, Shadows } from "../../lib/theme";
import { getStoredUser, clearAuthSession } from "../../lib/secureStore";

const { width } = Dimensions.get("window");

export default function ProfileScreen() {
  const router = useRouter();

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [name, setName] = useState("Anjali Sharma");
  const [email, setEmail] = useState("anjali.sharma@gmail.com");
  const [phone, setPhone] = useState("+91 98765 43210");

  React.useEffect(() => {
    getStoredUser().then((u) => {
      if (u) {
        if (u.name) setName(u.name);
        if (u.email) setEmail(u.email);
        if (u.phone) setPhone(u.phone);
      }
    });
  }, []);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to sign out from your account?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await clearAuthSession();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  const handleSaveProfile = () => {
    if (!name.trim()) {
      Alert.alert("Invalid Name", "Please provide a valid full name.");
      return;
    }
    setEditModalVisible(false);
    Alert.alert("Profile Updated", "Your changes have been saved.");
  };

  const MENU_ITEMS = [
    {
      id: "my-donations",
      title: "My Donations & Seva History",
      icon: "hand-heart-outline",
      iconType: "material",
      iconColor: "#16A34A",
      onPress: () => router.push("/my-donations"),
    },
    {
      id: "volunteer-app",
      title: "Volunteer Application Status",
      icon: "clipboard-outline",
      iconType: "ionicons",
      iconColor: "#2563EB",
      onPress: () => router.push("/volunteer-form"),
    },
    {
      id: "blood-request",
      title: "Emergency Blood Desk",
      icon: "water-outline",
      iconType: "ionicons",
      iconColor: "#DC2626",
      onPress: () => router.push("/blood-request"),
    },
    {
      id: "medical-request",
      title: "Medical Equipment Bank & Loans",
      icon: "medkit-outline",
      iconType: "ionicons",
      iconColor: "#166534",
      onPress: () => router.push("/medical-request"),
    },
    {
      id: "blood-donor",
      title: "Blood Donor Registration",
      icon: "person-add-outline",
      iconType: "ionicons",
      iconColor: "#DC2626",
      onPress: () => router.push("/blood-donor-registration"),
    },
    {
      id: "notifications",
      title: "Notifications",
      icon: "notifications-outline",
      iconType: "ionicons",
      iconColor: "#D97706",
      onPress: () => router.push("/notifications"),
    },
    {
      id: "contact",
      title: "Help & Support",
      icon: "help-circle-outline",
      iconType: "ionicons",
      iconColor: "#9333EA",
      onPress: () => router.push("/contact-us"),
    },
    {
      id: "settings",
      title: "Settings",
      icon: "settings-outline",
      iconType: "ionicons",
      iconColor: "#64748B",
      onPress: () =>
        Alert.alert("App Settings", "Version: 1.0.0 (Braj Seva Edition)\nLanguage: English / Hindi"),
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#14532D" />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Curve Banner */}
        <View style={styles.headerArc}>
          <SafeAreaView edges={["top"]} style={styles.safeHeader}>
            <View style={styles.headerRow}>
              <Text style={styles.headerTitle}>Profile</Text>
              <TouchableOpacity
                style={styles.headerLogoutBtn}
                onPress={handleLogout}
                activeOpacity={0.8}
              >
                <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Profile Avatar & Info Card */}
            <View style={styles.profileBadge}>
              <View style={styles.avatarWrapper}>
                <Image
                  source={{
                    uri: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=256",
                  }}
                  style={styles.avatarImg}
                />
                <TouchableOpacity
                  style={styles.editAvatarBtn}
                  onPress={() => setEditModalVisible(true)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="camera" size={13} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <Text style={styles.profileName}>{name}</Text>
              <Text style={styles.profileEmail}>{email}</Text>
              <Text style={styles.profilePhone}>{phone}</Text>

              {/* Seva Impact Badges */}
              <View style={styles.impactBadgesRow}>
                <View style={styles.impactBadge}>
                  <Ionicons name="sparkles" size={12} color="#166534" style={{ marginRight: 4 }} />
                  <Text style={styles.impactBadgeText}>Active Sevak</Text>
                </View>
                <View style={[styles.impactBadge, { backgroundColor: "#FEF2F2", borderColor: "#FECACA" }]}>
                  <Ionicons name="water" size={12} color="#DC2626" style={{ marginRight: 4 }} />
                  <Text style={[styles.impactBadgeText, { color: "#DC2626" }]}>O+ Blood Donor</Text>
                </View>
              </View>
            </View>
          </SafeAreaView>
        </View>

        {/* Seva Statistics Counters */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>₹8,500</Text>
            <Text style={styles.statLabel}>Total Donated</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>4</Text>
            <Text style={styles.statLabel}>Seva Drives</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>2</Text>
            <Text style={styles.statLabel}>Blood Matches</Text>
          </View>
        </View>

        {/* Menu Items List */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionHeading}>Account & Activities</Text>

          {MENU_ITEMS.map((item, idx) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItemRow,
                idx === MENU_ITEMS.length - 1 && { borderBottomWidth: 0 },
              ]}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconCircle, { backgroundColor: `${item.iconColor}15` }]}>
                {item.iconType === "ionicons" ? (
                  <Ionicons name={item.icon as any} size={20} color={item.iconColor} />
                ) : (
                  <MaterialCommunityIcons name={item.icon as any} size={20} color={item.iconColor} />
                )}
              </View>
              <Text style={styles.menuItemTitle}>{item.title}</Text>
              <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign Out Card */}
        <TouchableOpacity
          style={styles.signOutBtn}
          onPress={handleLogout}
          activeOpacity={0.88}
        >
          <Ionicons name="log-out-outline" size={18} color="#DC2626" style={{ marginRight: 8 }} />
          <Text style={styles.signOutBtnText}>Log Out from Account</Text>
        </TouchableOpacity>

        {/* Footer info */}
        <View style={styles.appFooter}>
          <Text style={styles.appFooterText}>श्री बाँके बिहारी जी की असीम कृपा से सेवारत</Text>
          <Text style={styles.appFooterSub}>Prayas Sanstha Vrindavan • Regd. No. 01/2024</Text>
        </View>

        {/* Edit Profile Modal */}
        <Modal visible={editModalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit Profile Details</Text>
                <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                  <Ionicons name="close-circle" size={24} color="#64748B" />
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
              />

              <Text style={[styles.inputLabel, { marginTop: 12 }]}>Email Address</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={[styles.inputLabel, { marginTop: 12 }]}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />

              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSaveProfile}
                activeOpacity={0.88}
              >
                <Text style={styles.saveBtnText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAF8",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerArc: {
    backgroundColor: "#14532D",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingBottom: 24,
    ...Shadows.card,
  },
  safeHeader: {
    paddingHorizontal: 18,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  headerLogoutBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  profileBadge: {
    alignItems: "center",
    marginTop: 6,
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: 10,
  },
  avatarImg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    backgroundColor: "#E2E8F0",
  },
  editAvatarBtn: {
    position: "absolute",
    right: 0,
    bottom: 0,
    backgroundColor: "#166534",
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  profileName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  profileEmail: {
    fontSize: 12,
    color: "#BBF7D0",
    marginTop: 2,
  },
  profilePhone: {
    fontSize: 11,
    color: "#86EFAC",
    marginTop: 1,
  },
  impactBadgesRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },
  impactBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  impactBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#166534",
  },
  statsCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 18,
    marginTop: -16,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    ...Shadows.card,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 16,
    fontWeight: "800",
    color: "#166534",
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#64748B",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: "#F1F5F9",
    height: "80%",
    alignSelf: "center",
  },
  menuSection: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 18,
    marginTop: 16,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    ...Shadows.card,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: "800",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
    marginLeft: 4,
  },
  menuItemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  menuIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuItemTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    color: "#1E293B",
  },
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    marginHorizontal: 18,
    marginTop: 16,
    borderRadius: 14,
    paddingVertical: 13,
  },
  signOutBtnText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#DC2626",
  },
  appFooter: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  appFooterText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#166534",
  },
  appFooterSub: {
    fontSize: 10,
    color: "#94A3B8",
    marginTop: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
    marginBottom: 5,
  },
  input: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: "#0F172A",
  },
  saveBtn: {
    backgroundColor: "#166534",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 18,
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
});
