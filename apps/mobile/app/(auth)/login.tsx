import React, { useState } from "react";
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
  SafeAreaView,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { api } from "../../lib/api";
import { saveAuthSession } from "../../lib/secureStore";
import { registerForPushNotificationsAsync } from "../../lib/notifications";

export default function MobileLoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    setError("");

    const response = await api.post(
      "/auth/login",
      {
        email: email.trim().toLowerCase(),
        password,
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
      // Register device push token with user ID
      registerForPushNotificationsAsync(response.data.user?.id);
      router.replace("/(tabs)/home");
    }
  };

  const handleQuickFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError("");
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
              <Text style={styles.logoIcon}>🌿</Text>
            </View>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              Sign in to Prayas Pariwaar Volunteer & Donor Portal
            </Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠️ {error}</Text>
              </View>
            ) : null}

            {/* Email Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. donor@prayaspariwaar.com"
                placeholderTextColor="#94A3B8"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            {/* Password Field */}
            <View style={styles.inputGroup}>
              <View style={styles.passwordHeader}>
                <Text style={styles.label}>Password *</Text>
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Text style={styles.showPassText}>
                    {showPassword ? "Hide" : "Show"}
                  </Text>
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
            </View>

            {/* Sign In Button */}
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Sign In to Account →</Text>
              )}
            </TouchableOpacity>

            {/* Quick Demo Logins for Fast Testing */}
            <View style={styles.demoSection}>
              <Text style={styles.demoLabel}>Quick Test Logins:</Text>
              <View style={styles.demoPills}>
                <TouchableOpacity
                  style={styles.demoPill}
                  onPress={() => handleQuickFill("admin@prayaspariwaar.com", "admin123")}
                >
                  <Text style={styles.demoPillText}>Admin</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.demoPill}
                  onPress={() => handleQuickFill("volunteer@prayaspariwaar.com", "volunteer123")}
                >
                  <Text style={styles.demoPillText}>Volunteer</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.demoPill}
                  onPress={() => handleQuickFill("donor@prayaspariwaar.com", "donor123")}
                >
                  <Text style={styles.demoPillText}>Donor</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Register Link */}
            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => router.push("/(auth)/signup")}
            >
              <Text style={styles.linkText}>
                New donor or volunteer?{" "}
                <Text style={styles.linkBold}>Create Free Account</Text>
              </Text>
            </TouchableOpacity>

            {/* Guest Skip */}
            <TouchableOpacity
              style={styles.skipButton}
              onPress={() => router.replace("/(tabs)/home")}
            >
              <Text style={styles.skipText}>Continue as Guest →</Text>
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
    justifyContent: "center",
    padding: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 28,
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: "#2E5339",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    shadowColor: "#2E5339",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  logoIcon: {
    fontSize: 26,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0F172A",
  },
  subtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 4,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 6,
  },
  passwordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  showPassText: {
    fontSize: 11,
    color: "#2E5339",
    fontWeight: "700",
  },
  input: {
    height: 48,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    color: "#0F172A",
  },
  button: {
    height: 50,
    backgroundColor: "#2E5339",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
    shadowColor: "#2E5339",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
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
    marginBottom: 16,
  },
  errorText: {
    color: "#B91C1C",
    fontSize: 12,
    fontWeight: "600",
  },
  demoSection: {
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    alignItems: "center",
  },
  demoLabel: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "700",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  demoPills: {
    flexDirection: "row",
    gap: 8,
  },
  demoPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  demoPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#475569",
  },
  linkButton: {
    marginTop: 18,
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
  skipButton: {
    marginTop: 12,
    alignItems: "center",
  },
  skipText: {
    fontSize: 12,
    color: "#94A3B8",
    fontWeight: "600",
  },
});
