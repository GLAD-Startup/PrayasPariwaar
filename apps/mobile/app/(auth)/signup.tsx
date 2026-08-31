import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { api } from "../../lib/api";
import { saveAuthSession } from "../../lib/secureStore";
import { registerForPushNotificationsAsync } from "../../lib/notifications";
import { BloodGroupValues, BloodGroupDisplayMap } from "@prayas/utils";

const CITIES = ["Vrindavan", "Mathura", "Govardhan", "Barsana", "Agra", "Other"];

const VOLUNTEER_DOMAINS = [
  "Project Aashayein (Teaching)",
  "Harit Vrindavan (Tree Plantation)",
  "Medical Camps & Seva",
  "Blood Donor Coordination",
  "General Seva Support",
];

export default function MobileSignupScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [bloodGroup, setBloodGroup] = useState<string>("O_POSITIVE");
  const [city, setCity] = useState<string>("Vrindavan");
  const [volunteerDomain, setVolunteerDomain] = useState<string>(
    "Project Aashayein (Teaching)"
  );
  const [role, setRole] = useState<"DONOR" | "VOLUNTEER">("DONOR");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !password) {
      setError("Please fill in your full name, email, and password.");
      return;
    }

    if (password.length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }

    setLoading(true);
    setError("");

    const response = await api.post(
      "/auth/signup",
      {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: phone.trim() || undefined,
        role,
        bloodGroup: role === "DONOR" ? bloodGroup : undefined,
      },
      { skipAuth: true }
    );

    setLoading(false);

    if (response.error) {
      setError(response.error);
      return;
    }

    if (response.data?.accessToken && response.data?.refreshToken) {
      await saveAuthSession(
        response.data.accessToken,
        response.data.refreshToken,
        response.data.user
      );
      registerForPushNotificationsAsync(response.data.user?.id);
      router.replace("/(tabs)/home");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoIcon}>🤝</Text>
            </View>
            <Text style={styles.title}>Join Prayas Pariwaar</Text>
            <Text style={styles.subtitle}>
              Register as an Emergency Blood Donor or Seva Volunteer
            </Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠️ {error}</Text>
              </View>
            ) : null}

            {/* Role Switcher */}
            <View style={styles.roleContainer}>
              <TouchableOpacity
                style={[styles.roleTab, role === "DONOR" && styles.roleTabActiveDonor]}
                onPress={() => setRole("DONOR")}
              >
                <Text
                  style={[styles.roleText, role === "DONOR" && styles.roleTextActiveDonor]}
                >
                  🩸 Blood Donor
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.roleTab,
                  role === "VOLUNTEER" && styles.roleTabActiveVolunteer,
                ]}
                onPress={() => setRole("VOLUNTEER")}
              >
                <Text
                  style={[
                    styles.roleText,
                    role === "VOLUNTEER" && styles.roleTextActiveVolunteer,
                  ]}
                >
                  🌿 Seva Volunteer
                </Text>
              </TouchableOpacity>
            </View>

            {/* Full Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Ramesh Chandra Sharma"
                placeholderTextColor="#94A3B8"
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Email Address */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. ramesh@example.com"
                placeholderTextColor="#94A3B8"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            {/* Phone Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>WhatsApp / Phone Number (For Alerts) *</Text>
              <TextInput
                style={styles.input}
                placeholder="10-digit mobile number"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
            </View>

            {/* Conditional Donor Fields: Blood Group */}
            {role === "DONOR" && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Your Blood Group *</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.bgScroll}
                >
                  {BloodGroupValues.map((bg) => (
                    <TouchableOpacity
                      key={bg}
                      style={[
                        styles.bgChip,
                        bloodGroup === bg && styles.bgChipSelected,
                      ]}
                      onPress={() => setBloodGroup(bg)}
                    >
                      <Text
                        style={[
                          styles.bgChipText,
                          bloodGroup === bg && styles.bgChipTextSelected,
                        ]}
                      >
                        {BloodGroupDisplayMap[bg]}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Conditional Volunteer Fields: Area of Seva */}
            {role === "VOLUNTEER" && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Primary Seva Domain *</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.bgScroll}
                >
                  {VOLUNTEER_DOMAINS.map((domain) => (
                    <TouchableOpacity
                      key={domain}
                      style={[
                        styles.volunteerChip,
                        volunteerDomain === domain && styles.volunteerChipSelected,
                      ]}
                      onPress={() => setVolunteerDomain(domain)}
                    >
                      <Text
                        style={[
                          styles.volunteerChipText,
                          volunteerDomain === domain && styles.volunteerChipTextSelected,
                        ]}
                      >
                        {domain}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* City Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>City / Location *</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.bgScroll}
              >
                {CITIES.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[styles.cityChip, city === c && styles.cityChipSelected]}
                    onPress={() => setCity(c)}
                  >
                    <Text
                      style={[
                        styles.cityChipText,
                        city === c && styles.cityChipTextSelected,
                      ]}
                    >
                      {c}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Create Password *</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#94A3B8"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            {/* Complete Button */}
            <TouchableOpacity
              style={[
                styles.button,
                role === "DONOR" ? styles.buttonDonor : styles.buttonVolunteer,
                loading && styles.buttonDisabled,
              ]}
              onPress={handleSignup}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>
                  {role === "DONOR"
                    ? "Register as Blood Donor →"
                    : "Register as Volunteer →"}
                </Text>
              )}
            </TouchableOpacity>

            {/* Link to Login */}
            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => router.push("/(auth)/login")}
            >
              <Text style={styles.linkText}>
                Already registered? <Text style={styles.linkBold}>Sign In</Text>
              </Text>
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
    backgroundColor: "#F8F9FA",
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  logoBadge: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: "#2E5339",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    shadowColor: "#2E5339",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  logoIcon: {
    fontSize: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
  },
  subtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 4,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3,
  },
  roleContainer: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  roleTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  roleTabActiveDonor: {
    backgroundColor: "#DC2626",
    shadowColor: "#DC2626",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  roleTabActiveVolunteer: {
    backgroundColor: "#2E5339",
    shadowColor: "#2E5339",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  roleText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
  },
  roleTextActiveDonor: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  roleTextActiveVolunteer: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 6,
  },
  input: {
    height: 46,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    color: "#0F172A",
  },
  bgScroll: {
    flexDirection: "row",
    paddingVertical: 2,
  },
  bgChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  bgChipSelected: {
    backgroundColor: "#DC2626",
    borderColor: "#DC2626",
  },
  bgChipText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
  },
  bgChipTextSelected: {
    color: "#FFFFFF",
  },
  volunteerChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  volunteerChipSelected: {
    backgroundColor: "#2E5339",
    borderColor: "#2E5339",
  },
  volunteerChipText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#475569",
  },
  volunteerChipTextSelected: {
    color: "#FFFFFF",
  },
  cityChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
    marginRight: 6,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  cityChipSelected: {
    backgroundColor: "#0F172A",
    borderColor: "#0F172A",
  },
  cityChipText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#475569",
  },
  cityChipTextSelected: {
    color: "#FFFFFF",
  },
  button: {
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDonor: {
    backgroundColor: "#DC2626",
    shadowColor: "#DC2626",
  },
  buttonVolunteer: {
    backgroundColor: "#2E5339",
    shadowColor: "#2E5339",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  errorBox: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  errorText: {
    color: "#B91C1C",
    fontSize: 12,
    fontWeight: "600",
  },
  linkButton: {
    marginTop: 16,
    alignItems: "center",
  },
  linkText: {
    fontSize: 13,
    color: "#64748B",
  },
  linkBold: {
    color: "#2E5339",
    fontWeight: "800",
  },
});
