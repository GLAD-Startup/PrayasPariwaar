import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors, Shadows } from "../../lib/theme";
import { getStoredUser, saveAuthSession, getAccessToken, getRefreshToken } from "../../lib/secureStore";
import { api } from "../../lib/api";
import { registerForPushNotificationsAsync } from "../../lib/notifications";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

const POPULAR_CITIES = ["Mathura", "Vrindavan", "Agra", "Delhi NCR", "Jaipur", "Other"];

export default function CompleteProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [phone, setPhone] = useState("");
  const [bloodGroup, setBloodGroup] = useState("O+");
  const [city, setCity] = useState("Mathura");
  const [customCity, setCustomCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadUser() {
      const stored = await getStoredUser();
      if (stored) {
        setUser(stored);
        if (stored.phone) setPhone(stored.phone.replace("+91", "").trim());
        if (stored.bloodGroup) setBloodGroup(stored.bloodGroup);
        if (stored.city) setCity(stored.city);
      }
    }
    loadUser();
  }, []);

  const handleSave = async () => {
    const cleanPhone = phone.trim().replace(/\D/g, "");

    if (cleanPhone && cleanPhone.length !== 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const fullPhone = cleanPhone ? `+91 ${cleanPhone}` : undefined;
      const selectedCity = city === "Other" ? (customCity.trim() || "Mathura") : city;

      const res = await api.patch("/auth/profile", {
        userId: user?.id,
        phone: fullPhone,
        bloodGroup,
        city: selectedCity,
      });

      if (res.error) {
        setError(res.error);
        setLoading(false);
        return;
      }

      // Update local storage session
      const accessToken = (await getAccessToken()) || "";
      const refreshToken = (await getRefreshToken()) || "";
      const updatedUser = res.data?.user || {
        ...user,
        phone: fullPhone,
        bloodGroup,
        city: selectedCity,
      };

      await saveAuthSession(accessToken, refreshToken, updatedUser);

      if (updatedUser?.id) {
        registerForPushNotificationsAsync(updatedUser.id);
      }

      setLoading(false);
      router.replace("/(tabs)/home");
    } catch (err: any) {
      setLoading(false);
      setError(err?.message || "Failed to save profile. Please try again.");
    }
  };

  const handleSkip = () => {
    router.replace("/(tabs)/home");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Card */}
          <View style={styles.welcomeCard}>
            <View style={styles.avatarWrapper}>
              {user?.avatarUrl ? (
                <Image source={{ uri: user.avatarUrl }} style={styles.avatarImg} />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarFallbackText}>
                    {user?.name ? user.name[0].toUpperCase() : "P"}
                  </Text>
                </View>
              )}
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={18} color="#166534" />
              </View>
            </View>

            <Text style={styles.greetingTitle}>
              Welcome, {user?.name ? user.name.split(" ")[0] : "Member"}! 🎉
            </Text>
            <Text style={styles.greetingSub}>
              Let&apos;s complete your profile so we can reach you for emergency blood alerts & seva drives.
            </Text>
          </View>

          {/* Error Banner */}
          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color={Colors.error} style={{ marginRight: 8 }} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Phone Number */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Mobile Phone Number</Text>
                <Text style={styles.badgeRecommended}>Recommended</Text>
              </View>
              <View style={styles.phoneInputWrapper}>
                <View style={styles.countryCodeBadge}>
                  <Text style={styles.flagText}>🇮🇳</Text>
                  <Text style={styles.countryCodeText}>+91</Text>
                </View>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="98765 43210"
                  placeholderTextColor="#94A3B8"
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={phone}
                  onChangeText={(val) => {
                    setPhone(val.replace(/\D/g, ""));
                    if (error) setError("");
                  }}
                />
              </View>
              <Text style={styles.helperText}>
                Used for urgent blood requests, seva updates & donation receipts.
              </Text>
            </View>

            {/* Blood Group */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Blood Group</Text>
                <Text style={styles.badgeOptional}>Optional</Text>
              </View>
              <View style={styles.bloodChipsRow}>
                {BLOOD_GROUPS.map((bg) => {
                  const isSelected = bloodGroup === bg;
                  return (
                    <TouchableOpacity
                      key={bg}
                      style={[styles.bloodChip, isSelected && styles.bloodChipActive]}
                      onPress={() => setBloodGroup(bg)}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name="water"
                        size={14}
                        color={isSelected ? "#DC2626" : "#94A3B8"}
                        style={{ marginRight: 4 }}
                      />
                      <Text
                        style={[
                          styles.bloodChipText,
                          isSelected && styles.bloodChipTextActive,
                        ]}
                      >
                        {bg}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* City / Location */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>City / Region</Text>
                <Text style={styles.badgeOptional}>Optional</Text>
              </View>
              <View style={styles.cityChipsRow}>
                {POPULAR_CITIES.map((c) => {
                  const isSelected = city === c;
                  return (
                    <TouchableOpacity
                      key={c}
                      style={[styles.cityChip, isSelected && styles.cityChipActive]}
                      onPress={() => setCity(c)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.cityChipText,
                          isSelected && styles.cityChipTextActive,
                        ]}
                      >
                        {c}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {city === "Other" && (
                <View style={[styles.inputWrapper, { marginTop: 10 }]}>
                  <Ionicons name="location-outline" size={18} color="#64748B" style={styles.inputLeftIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your city name"
                    placeholderTextColor="#94A3B8"
                    value={customCity}
                    onChangeText={setCustomCity}
                  />
                </View>
              )}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={loading}
              activeOpacity={0.88}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.saveBtnText}>Save & Continue</Text>
                  <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
                </>
              )}
            </TouchableOpacity>

            {/* Skip Button */}
            <TouchableOpacity
              style={styles.skipBtn}
              onPress={handleSkip}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Text style={styles.skipBtnText}>Skip for now</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  welcomeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    ...Shadows.soft,
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: 16,
  },
  avatarImg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#DCFCE7",
  },
  avatarFallback: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#166534",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarFallbackText: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "900",
  },
  verifiedBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#DCFCE7",
    borderRadius: 12,
    padding: 2,
  },
  greetingTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#0F172A",
    marginBottom: 6,
    textAlign: "center",
  },
  greetingSub: {
    fontSize: 13.5,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },
  formContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    ...Shadows.soft,
  },
  inputGroup: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  label: {
    fontSize: 13.5,
    fontWeight: "800",
    color: "#1E293B",
  },
  badgeRecommended: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "#166534",
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeOptional: {
    fontSize: 10.5,
    fontWeight: "600",
    color: "#64748B",
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  phoneInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
    overflow: "hidden",
  },
  countryCodeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EDF2F7",
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRightWidth: 1.5,
    borderRightColor: "#E2E8F0",
  },
  flagText: {
    fontSize: 16,
    marginRight: 4,
  },
  countryCodeText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1E293B",
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
  },
  helperText: {
    fontSize: 11.5,
    color: "#94A3B8",
    marginTop: 6,
    lineHeight: 16,
  },
  bloodChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  bloodChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
  },
  bloodChipActive: {
    backgroundColor: "#FEF2F2",
    borderColor: "#F87171",
  },
  bloodChipText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748B",
  },
  bloodChipTextActive: {
    color: "#DC2626",
    fontWeight: "900",
  },
  cityChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  cityChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
  },
  cityChipActive: {
    backgroundColor: "#F0FDF4",
    borderColor: "#86EFAC",
  },
  cityChipText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#64748B",
  },
  cityChipTextActive: {
    color: "#166534",
    fontWeight: "900",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 14,
  },
  inputLeftIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: "#0F172A",
    fontWeight: "600",
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#166534",
    borderRadius: 14,
    paddingVertical: 15,
    marginTop: 8,
    ...Shadows.primaryBtn,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 0.2,
  },
  skipBtn: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    marginTop: 6,
  },
  skipBtnText: {
    color: "#64748B",
    fontSize: 13.5,
    fontWeight: "700",
  },
});
