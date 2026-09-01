import React, { useState, useEffect } from "react";
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
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors, Shadows } from "../../lib/theme";
import { getStoredUser, saveAuthSession, clearAuthSession, getAccessToken, getRefreshToken } from "../../lib/secureStore";
import { api, uploadFile } from "../../lib/api";
import { pickImageFromGallery, captureImageWithCamera } from "../../lib/imagePickerHelper";
import { sendLocalNotification } from "../../lib/notifications";

const { width } = Dimensions.get("window");

const PRESET_AVATARS = [
  { id: "1", uri: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80", label: "Devotee" },
  { id: "2", uri: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80", label: "Volunteer" },
  { id: "3", uri: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80", label: "Sevika" },
  { id: "4", uri: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80", label: "Sevak" },
  { id: "5", uri: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&auto=format&fit=crop&q=80", label: "Teacher" },
  { id: "6", uri: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80", label: "Coordinator" },
];

export default function ProfileScreen() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState("Seva Supporter");
  const [email, setEmail] = useState("donor@prayaspariwaar.com");
  const [phone, setPhone] = useState("+91 94122 79001");
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [bloodGroup, setBloodGroup] = useState<string>("O+");
  const [city, setCity] = useState<string>("Mathura & Vrindavan");

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [photoSheetVisible, setPhotoSheetVisible] = useState(false);
  const [urlModalVisible, setUrlModalVisible] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const stored = await getStoredUser();
      if (stored) {
        setUser(stored);
        if (stored.name) setName(stored.name);
        if (stored.email) setEmail(stored.email);
        if (stored.phone) setPhone(stored.phone);
        if (stored.avatarUrl || stored.avatar) setAvatarUri(stored.avatarUrl || stored.avatar);
        if (stored.bloodGroup) setBloodGroup(stored.bloodGroup);
        if (stored.city) setCity(stored.city);
      }

      // Try fetching latest profile from backend
      const res = await api.get<{ success: boolean; user: any }>("/auth/profile");
      if (res.data?.success && res.data.user) {
        const u = res.data.user;
        setUser(u);
        if (u.name) setName(u.name);
        if (u.email) setEmail(u.email);
        if (u.phone) setPhone(u.phone);
        if (u.avatarUrl) setAvatarUri(u.avatarUrl);
        if (u.bloodGroup) setBloodGroup(u.bloodGroup);
        if (u.city) setCity(u.city);

        const access = await getAccessToken();
        const refresh = await getRefreshToken();
        if (access && refresh) {
          await saveAuthSession(access, refresh, u);
        }
      }
    } catch (e) {
      console.warn("Failed to load profile:", e);
    }
  };

  const handlePickFromGallery = async () => {
    setPhotoSheetVisible(false);
    const res = await pickImageFromGallery();
    if (res.error) {
      if (res.nativeUnavailable) {
        Alert.alert(
          "Gallery Option",
          "You can select from our verified Seva avatar presets or enter an image URL.",
          [
            { text: "Choose Preset", onPress: () => setPhotoSheetVisible(true) },
            { text: "Enter URL", onPress: () => setUrlModalVisible(true) },
            { text: "Cancel", style: "cancel" },
          ]
        );
      } else {
        Alert.alert("Notice", res.error);
      }
      return;
    }
    if (res.uri) {
      await processAndSaveAvatar(res.uri);
    }
  };

  const handleTakePhoto = async () => {
    setPhotoSheetVisible(false);
    const res = await captureImageWithCamera();
    if (res.error) {
      if (res.nativeUnavailable) {
        Alert.alert(
          "Camera Option",
          "You can select from our verified Seva avatar presets or enter an image URL.",
          [
            { text: "Choose Preset", onPress: () => setPhotoSheetVisible(true) },
            { text: "Enter URL", onPress: () => setUrlModalVisible(true) },
            { text: "Cancel", style: "cancel" },
          ]
        );
      } else {
        Alert.alert("Notice", res.error);
      }
      return;
    }
    if (res.uri) {
      await processAndSaveAvatar(res.uri);
    }
  };

  const processAndSaveAvatar = async (localUri: string) => {
    setUploadingPhoto(true);
    setAvatarUri(localUri);

    try {
      let finalAvatarUrl = localUri;

      // Upload file to server if it's a local file URI
      if (localUri.startsWith("file:") || localUri.startsWith("content:") || localUri.startsWith("blob:")) {
        const uploadRes = await uploadFile(localUri, `avatar-${Date.now()}.jpg`, "image/jpeg");
        if (uploadRes.url) {
          const baseUrl = (process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api").replace(/\/api$/, "");
          finalAvatarUrl = uploadRes.url.startsWith("http") ? uploadRes.url : `${baseUrl}${uploadRes.url}`;
          setAvatarUri(finalAvatarUrl);
        }
      }

      // Persist to backend user profile
      await api.patch("/auth/profile", {
        avatarUrl: finalAvatarUrl,
        userId: user?.id,
        email: user?.email || email,
      });

      // Update local storage
      const updatedUser = {
        ...(user || {}),
        name,
        email,
        phone,
        avatarUrl: finalAvatarUrl,
        avatar: finalAvatarUrl,
      };
      setUser(updatedUser);

      const access = await getAccessToken();
      const refresh = await getRefreshToken();
      if (access && refresh) {
        await saveAuthSession(access, refresh, updatedUser);
      }

      await sendLocalNotification(
        "📸 Profile Photo Updated",
        "Your profile picture has been successfully uploaded and saved."
      );

      Alert.alert("Profile Photo Updated", "Your new profile picture has been saved successfully! 📸");
    } catch (e: any) {
      console.warn("Avatar upload notice:", e);
      Alert.alert("Notice", "Profile photo updated locally.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSelectPreset = async (presetUri: string) => {
    setPhotoSheetVisible(false);
    await processAndSaveAvatar(presetUri);
  };

  const handleSaveCustomUrl = async () => {
    if (!customUrlInput.trim()) {
      Alert.alert("Invalid URL", "Please enter a valid image web URL.");
      return;
    }
    setUrlModalVisible(false);
    const url = customUrlInput.trim();
    setCustomUrlInput("");
    await processAndSaveAvatar(url);
  };

  const handleRemovePhoto = async () => {
    setPhotoSheetVisible(false);
    Alert.alert("Remove Profile Photo", "Are you sure you want to remove your profile photo?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          setAvatarUri(null);
          try {
            await api.patch("/auth/profile", {
              avatarUrl: "",
              userId: user?.id,
              email: user?.email || email,
            });
            const updatedUser = {
              ...(user || {}),
              avatarUrl: "",
              avatar: "",
            };
            setUser(updatedUser);
            const access = await getAccessToken();
            const refresh = await getRefreshToken();
            if (access && refresh) {
              await saveAuthSession(access, refresh, updatedUser);
            }
          } catch (e) {}
        },
      },
    ]);
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      Alert.alert("Invalid Name", "Please enter a valid full name.");
      return;
    }

    setSavingProfile(true);
    try {
      await api.patch("/auth/profile", {
        name: name.trim(),
        phone: phone.trim(),
        city: city.trim(),
        bloodGroup,
        userId: user?.id,
        email: user?.email || email,
      });

      const updatedUser = {
        ...(user || {}),
        name: name.trim(),
        phone: phone.trim(),
        city: city.trim(),
        bloodGroup,
      };
      setUser(updatedUser);

      const access = await getAccessToken();
      const refresh = await getRefreshToken();
      if (access && refresh) {
        await saveAuthSession(access, refresh, updatedUser);
      }

      await sendLocalNotification(
        "✅ Profile Details Saved",
        "Your name, phone number, and location have been updated."
      );

      setEditModalVisible(false);
      Alert.alert("Profile Saved", "Your profile details have been updated.");
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out from Prayas app?", [
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

  const MENU_ITEMS = [
    {
      id: "my-donations",
      title: "My Donations & Seva Receipts",
      subtitle: "80G tax deductible contributions",
      icon: "hand-heart-outline",
      iconType: "material",
      iconColor: "#166534",
      onPress: () => router.push("/my-donations"),
    },
    {
      id: "blood-request",
      title: "Emergency Blood Desk",
      subtitle: "Donor network & broadcast request",
      icon: "water-outline",
      iconType: "ionicons",
      iconColor: "#DC2626",
      onPress: () => router.push("/blood-request"),
    },
    {
      id: "medical-request",
      title: "Medical Equipment Bank & Loans",
      subtitle: "Track active oxygen/bed loans",
      icon: "medkit-outline",
      iconType: "ionicons",
      iconColor: "#0D9488",
      onPress: () => router.push("/medical-request"),
    },
    {
      id: "volunteer-app",
      title: "Volunteer Application Status",
      subtitle: "850+ Seva volunteers in Braj",
      icon: "clipboard-outline",
      iconType: "ionicons",
      iconColor: "#1D4ED8",
      onPress: () => router.push("/volunteer-form"),
    },
    {
      id: "blood-donor",
      title: "Blood Donor Registration",
      subtitle: "Update your donor availability",
      icon: "person-add-outline",
      iconType: "ionicons",
      iconColor: "#DC2626",
      onPress: () => router.push("/blood-donor-registration"),
    },
    {
      id: "notifications",
      title: "Notifications & Alerts",
      subtitle: "Status alerts & announcements",
      icon: "notifications-outline",
      iconType: "ionicons",
      iconColor: "#D97706",
      onPress: () => router.push("/notifications"),
    },
    {
      id: "contact",
      title: "Help & Office Locations",
      subtitle: "Vrindavan & Mathura Seva Dham",
      icon: "help-circle-outline",
      iconType: "ionicons",
      iconColor: "#7E22CE",
      onPress: () => router.push("/contact-us"),
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E3A8A" />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Curve Banner in Royal Blue */}
        <View style={styles.headerArc}>
          <SafeAreaView edges={["top"]} style={styles.safeHeader}>
            <View style={styles.headerRow}>
              <Text style={styles.headerTitle}>My Profile</Text>
              <TouchableOpacity
                style={styles.headerLogoutBtn}
                onPress={handleLogout}
                activeOpacity={0.8}
              >
                <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Profile Avatar & Interactive Upload Section */}
            <View style={styles.profileBadge}>
              <View style={styles.avatarWrapper}>
                {avatarUri ? (
                  <Image source={{ uri: avatarUri }} style={styles.avatarImg} resizeMode="cover" />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarInitialsText}>
                      {name ? name.substring(0, 2).toUpperCase() : "PS"}
                    </Text>
                  </View>
                )}

                {/* Camera Action Badge */}
                <TouchableOpacity
                  style={styles.editAvatarBtn}
                  onPress={() => setPhotoSheetVisible(true)}
                  activeOpacity={0.8}
                  disabled={uploadingPhoto}
                >
                  {uploadingPhoto ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Ionicons name="camera" size={15} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              </View>

              {/* Upload Photo Button / Pill */}
              <TouchableOpacity
                style={styles.uploadPhotoPill}
                onPress={() => setPhotoSheetVisible(true)}
                activeOpacity={0.85}
              >
                <Ionicons name="cloud-upload-outline" size={13} color="#1D4ED8" style={{ marginRight: 4 }} />
                <Text style={styles.uploadPhotoPillText}>
                  {avatarUri ? "Change Profile Photo" : "Upload Profile Photo"}
                </Text>
              </TouchableOpacity>

              <Text style={styles.profileName}>{name}</Text>
              <Text style={styles.profileEmail}>{email}</Text>
              <Text style={styles.profilePhone}>{phone}</Text>

              {/* Edit Details Action Button */}
              <TouchableOpacity
                style={styles.editDetailsBtn}
                onPress={() => setEditModalVisible(true)}
                activeOpacity={0.85}
              >
                <Ionicons name="create-outline" size={14} color="#FFFFFF" style={{ marginRight: 5 }} />
                <Text style={styles.editDetailsBtnText}>Edit Profile Info</Text>
              </TouchableOpacity>

              {/* Seva Impact Badges */}
              <View style={styles.impactBadgesRow}>
                <View style={styles.impactBadge}>
                  <Ionicons name="sparkles" size={12} color="#1D4ED8" style={{ marginRight: 4 }} />
                  <Text style={styles.impactBadgeText}>Active Sevak</Text>
                </View>
                <View style={[styles.impactBadge, { backgroundColor: "#FEF2F2", borderColor: "#FECACA" }]}>
                  <Ionicons name="water" size={12} color="#DC2626" style={{ marginRight: 4 }} />
                  <Text style={[styles.impactBadgeText, { color: "#DC2626" }]}>{bloodGroup} Blood Donor</Text>
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
          <Text style={styles.sectionHeading}>Account & Seva Activities</Text>

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
              <View style={styles.menuTextCol}>
                <Text style={styles.menuItemTitle}>{item.title}</Text>
                <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
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
          <Text style={styles.appFooterSub}>Prayas Sanstha Vrindavan • Regd. NGO</Text>
        </View>
      </ScrollView>

      {/* Photo Upload Action Modal / Bottom Sheet */}
      <Modal visible={photoSheetVisible} transparent animationType="fade" onRequestClose={() => setPhotoSheetVisible(false)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={() => setPhotoSheetVisible(false)} />
          <View style={styles.sheetCard}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Upload Profile Photo</Text>
              <TouchableOpacity onPress={() => setPhotoSheetVisible(false)}>
                <Ionicons name="close-circle" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.sheetDesc}>
              Choose how you want to upload or change your profile picture:
            </Text>

            {/* Native Options */}
            <TouchableOpacity style={styles.sheetOption} onPress={handleTakePhoto} activeOpacity={0.8}>
              <View style={[styles.sheetIconCircle, { backgroundColor: "#EFF6FF" }]}>
                <Ionicons name="camera-outline" size={22} color="#1D4ED8" />
              </View>
              <View style={styles.sheetOptionTextCol}>
                <Text style={styles.sheetOptionTitle}>Take Photo with Camera</Text>
                <Text style={styles.sheetOptionSubtitle}>Capture a selfie or portrait right now</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.sheetOption} onPress={handlePickFromGallery} activeOpacity={0.8}>
              <View style={[styles.sheetIconCircle, { backgroundColor: "#F0FDF4" }]}>
                <Ionicons name="images-outline" size={22} color="#166534" />
              </View>
              <View style={styles.sheetOptionTextCol}>
                <Text style={styles.sheetOptionTitle}>Choose from Photo Gallery</Text>
                <Text style={styles.sheetOptionSubtitle}>Select an image from your device</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sheetOption}
              onPress={() => {
                setPhotoSheetVisible(false);
                setUrlModalVisible(true);
              }}
              activeOpacity={0.8}
            >
              <View style={[styles.sheetIconCircle, { backgroundColor: "#FAF5FF" }]}>
                <Ionicons name="link-outline" size={22} color="#7E22CE" />
              </View>
              <View style={styles.sheetOptionTextCol}>
                <Text style={styles.sheetOptionTitle}>Enter Image Web URL</Text>
                <Text style={styles.sheetOptionSubtitle}>Paste a link to any online photo</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
            </TouchableOpacity>

            {/* Preset Avatars Row */}
            <Text style={styles.presetsTitle}>Or Choose a Seva Avatar Preset:</Text>
            <View style={styles.presetsRow}>
              {PRESET_AVATARS.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={styles.presetThumb}
                  onPress={() => handleSelectPreset(p.uri)}
                  activeOpacity={0.8}
                >
                  <Image source={{ uri: p.uri }} style={styles.presetImg} />
                </TouchableOpacity>
              ))}
            </View>

            {avatarUri ? (
              <TouchableOpacity style={[styles.sheetOption, { marginTop: 10 }]} onPress={handleRemovePhoto} activeOpacity={0.8}>
                <View style={[styles.sheetIconCircle, { backgroundColor: "#FEF2F2" }]}>
                  <Ionicons name="trash-outline" size={22} color="#DC2626" />
                </View>
                <View style={styles.sheetOptionTextCol}>
                  <Text style={[styles.sheetOptionTitle, { color: "#DC2626" }]}>Remove Current Photo</Text>
                  <Text style={styles.sheetOptionSubtitle}>Revert to initial avatar placeholder</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              style={styles.sheetCancelBtn}
              onPress={() => setPhotoSheetVisible(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.sheetCancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Custom URL Input Modal */}
      <Modal visible={urlModalVisible} transparent animationType="fade" onRequestClose={() => setUrlModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={() => setUrlModalVisible(false)} />
          <View style={styles.editModalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Enter Photo URL</Text>
              <TouchableOpacity onPress={() => setUrlModalVisible(false)}>
                <Ionicons name="close-circle" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Image URL (HTTPS link)</Text>
            <TextInput
              style={styles.modalInput}
              value={customUrlInput}
              onChangeText={setCustomUrlInput}
              placeholder="https://example.com/my-photo.jpg"
              placeholderTextColor="#94A3B8"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TouchableOpacity
              style={styles.saveProfileBtn}
              onPress={handleSaveCustomUrl}
              activeOpacity={0.88}
            >
              <Text style={styles.saveProfileBtnText}>Set as Profile Photo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Edit Profile Info Modal */}
      <Modal visible={editModalVisible} transparent animationType="slide" onRequestClose={() => setEditModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={() => setEditModalVisible(false)} />
          <View style={styles.editModalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Edit Profile Information</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close-circle" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.modalInput}
                value={name}
                onChangeText={setName}
                placeholder="Enter full name"
                placeholderTextColor="#94A3B8"
              />

              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={styles.modalInput}
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter phone number"
                keyboardType="phone-pad"
                placeholderTextColor="#94A3B8"
              />

              <Text style={styles.inputLabel}>Blood Group</Text>
              <TextInput
                style={styles.modalInput}
                value={bloodGroup}
                onChangeText={setBloodGroup}
                placeholder="e.g. O+, A+, B+, AB+"
                placeholderTextColor="#94A3B8"
              />

              <Text style={styles.inputLabel}>City / Location</Text>
              <TextInput
                style={styles.modalInput}
                value={city}
                onChangeText={setCity}
                placeholder="e.g. Mathura / Vrindavan"
                placeholderTextColor="#94A3B8"
              />

              <TouchableOpacity
                style={[styles.saveProfileBtn, savingProfile && { opacity: 0.7 }]}
                onPress={handleSaveProfile}
                disabled={savingProfile}
                activeOpacity={0.88}
              >
                {savingProfile ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveProfileBtnText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerArc: {
    backgroundColor: "#1E3A8A",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingBottom: 24,
    ...Shadows.card,
  },
  safeHeader: {
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -0.3,
  },
  headerLogoutBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  profileBadge: {
    alignItems: "center",
    marginTop: 6,
  },
  avatarWrapper: {
    position: "relative",
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    ...Shadows.card,
  },
  avatarImg: {
    width: "100%",
    height: "100%",
    borderRadius: 48,
  },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    borderRadius: 48,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitialsText: {
    fontSize: 32,
    fontWeight: "900",
    color: "#1D4ED8",
  },
  editAvatarBtn: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#1D4ED8",
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    ...Shadows.soft,
  },
  uploadPhotoPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 10,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    ...Shadows.soft,
  },
  uploadPhotoPillText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#1D4ED8",
  },
  profileName: {
    fontSize: 18,
    fontWeight: "900",
    color: "#FFFFFF",
    marginTop: 2,
    letterSpacing: -0.2,
  },
  profileEmail: {
    fontSize: 12,
    color: "#BFDBFE",
    marginTop: 2,
  },
  profilePhone: {
    fontSize: 12,
    color: "#E2E8F0",
    marginTop: 1,
  },
  editDetailsBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  editDetailsBtnText: {
    color: "#FFFFFF",
    fontSize: 11.5,
    fontWeight: "700",
  },
  impactBadgesRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  impactBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  impactBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#1D4ED8",
  },
  statsCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: -16,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
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
    fontWeight: "900",
    color: "#1E3A8A",
  },
  statLabel: {
    fontSize: 10,
    color: "#64748B",
    marginTop: 2,
    fontWeight: "600",
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: "#E2E8F0",
  },
  menuSection: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 4,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    ...Shadows.soft,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 8,
  },
  menuItemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  menuIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuTextCol: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1E293B",
  },
  menuItemSubtitle: {
    fontSize: 10,
    color: "#64748B",
    marginTop: 1,
  },
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEF2F2",
    marginHorizontal: 16,
    marginTop: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  signOutBtnText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#DC2626",
  },
  appFooter: {
    alignItems: "center",
    marginTop: 20,
  },
  appFooterText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
  },
  appFooterSub: {
    fontSize: 10,
    color: "#94A3B8",
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
    justifyContent: "flex-end",
  },
  sheetCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#0F172A",
  },
  sheetDesc: {
    fontSize: 11.5,
    color: "#64748B",
    marginBottom: 14,
  },
  sheetOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 11,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 8,
  },
  sheetIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  sheetOptionTextCol: {
    flex: 1,
  },
  sheetOptionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1E293B",
  },
  sheetOptionSubtitle: {
    fontSize: 10,
    color: "#64748B",
    marginTop: 1,
  },
  presetsTitle: {
    fontSize: 11.5,
    fontWeight: "800",
    color: "#334155",
    marginTop: 8,
    marginBottom: 8,
  },
  presetsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  presetThumb: {
    width: (width - 40 - 25) / 6,
    height: (width - 40 - 25) / 6,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "#BFDBFE",
  },
  presetImg: {
    width: "100%",
    height: "100%",
  },
  sheetCancelBtn: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    backgroundColor: "#F1F5F9",
    borderRadius: 10,
    marginTop: 4,
  },
  sheetCancelBtnText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#475569",
  },
  editModalCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },
  modalHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#0F172A",
  },
  inputLabel: {
    fontSize: 11.5,
    fontWeight: "800",
    color: "#334155",
    marginBottom: 4,
    marginTop: 10,
  },
  modalInput: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: "#0F172A",
  },
  saveProfileBtn: {
    backgroundColor: "#1D4ED8",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 10,
    ...Shadows.primaryBtn,
  },
  saveProfileBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
});
