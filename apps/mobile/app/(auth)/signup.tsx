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
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons, FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { api } from "../../lib/api";
import { saveAuthSession } from "../../lib/secureStore";
import { registerForPushNotificationsAsync } from "../../lib/notifications";
import { Colors, Shadows } from "../../lib/theme";

export default function MobileSignupScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName || !trimmedEmail || !password) {
      setError("Please fill in your full name, email, and password.");
      return;
    }

    if (trimmedName.length < 2) {
      setError("Please enter a valid full name.");
      return;
    }

    if (!trimmedEmail.includes("@") || !trimmedEmail.includes(".")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (!agreedTerms) {
      setError("Please agree to the Terms & Conditions to proceed.");
      return;
    }

    setLoading(true);
    setError("");

    const response = await api.post(
      "/auth/signup",
      {
        name: trimmedName,
        email: trimmedEmail,
        password,
        phone: phone.trim() || undefined,
        role: "VOLUNTEER",
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
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" animated={true} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Bar / Back Button */}
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => (router.canGoBack() ? router.back() : router.replace("/(auth)/login"))}
              activeOpacity={0.8}
            >
              <Ionicons name="chevron-back" size={22} color={Colors.primary} />
            </TouchableOpacity>

            <View style={styles.topBadge}>
              <Text style={styles.topBadgeText}>JOIN SEVA</Text>
            </View>
          </View>

          {/* Heading */}
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join us and be a part of the change.</Text>
          </View>

          {/* Error Message */}
          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color={Colors.error} style={{ marginRight: 6 }} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Form Container */}
          <View style={styles.formContainer}>
            {/* Full Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={18} color="#64748B" style={styles.inputLeftIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  placeholderTextColor={Colors.textMuted}
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>

            {/* Email Address */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={18} color="#64748B" style={styles.inputLeftIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            {/* Phone Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="call-outline" size={18} color="#64748B" style={styles.inputLeftIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your phone number"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={18} color="#64748B" style={styles.inputLeftIcon} />
                <TextInput
                  style={[styles.input, { paddingRight: 44 }]}
                  placeholder="Create a password"
                  placeholderTextColor={Colors.textMuted}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  style={styles.eyeIconBtn}
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#64748B"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Terms and Conditions Checkbox */}
            <TouchableOpacity
              style={styles.termsRow}
              onPress={() => setAgreedTerms(!agreedTerms)}
              activeOpacity={0.8}
            >
              <View style={[styles.checkbox, agreedTerms && styles.checkboxChecked]}>
                {agreedTerms && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
              </View>
              <Text style={styles.termsText}>
                I agree to the <Text style={styles.termsLink}>Terms & Conditions</Text>
              </Text>
            </TouchableOpacity>

            {/* Sign Up Primary Green Button */}
            <TouchableOpacity
              style={[styles.signupBtn, loading && styles.signupBtnDisabled]}
              onPress={handleSignup}
              disabled={loading}
              activeOpacity={0.88}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.signupBtnText}>Sign Up</Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or sign up with</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Buttons */}
            <View style={styles.socialRow}>
              {/* Google */}
              <TouchableOpacity
                style={styles.socialCard}
                onPress={() => {
                  setName("Demo Member");
                  setEmail("member@prayaspariwaar.com");
                  setPassword("member123");
                  setPhone("9876543210");
                }}
                activeOpacity={0.8}
              >
                <View style={[styles.socialCircle, styles.googleCircle]}>
                  <FontAwesome name="google" size={20} color="#EA4335" />
                </View>
                <Text style={styles.socialLabel}>Google</Text>
              </TouchableOpacity>

              {/* Facebook */}
              <TouchableOpacity
                style={styles.socialCard}
                onPress={() => {
                  setName("Facebook Seva User");
                  setEmail("fb.user@prayaspariwaar.com");
                  setPassword("fbuser123");
                  setPhone("9876543211");
                }}
                activeOpacity={0.8}
              >
                <View style={[styles.socialCircle, styles.facebookCircle]}>
                  <FontAwesome name="facebook" size={20} color="#1877F2" />
                </View>
                <Text style={styles.socialLabel}>Facebook</Text>
              </TouchableOpacity>

              {/* Apple */}
              <TouchableOpacity
                style={styles.socialCard}
                onPress={() => {
                  setName("Apple User");
                  setEmail("apple.user@prayaspariwaar.com");
                  setPassword("apple123");
                  setPhone("9876543212");
                }}
                activeOpacity={0.8}
              >
                <View style={[styles.socialCircle, styles.appleCircle]}>
                  <FontAwesome name="apple" size={22} color="#000000" />
                </View>
                <Text style={styles.socialLabel}>Apple</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer - Login */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Already have an account?{" "}
              <Text
                style={styles.footerLink}
                onPress={() => router.push("/(auth)/login")}
              >
                Login
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 60,
  },
  topBar: {
    paddingTop: Platform.OS === "android" ? 14 : 6,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    ...Shadows.soft,
  },
  topBadge: {
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  topBadgeText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#166534",
    letterSpacing: 0.6,
  },
  header: {
    marginTop: 4,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: "#14532D",
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 4,
    fontWeight: "600",
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.errorBg,
    borderWidth: 1,
    borderColor: Colors.errorBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
  errorText: {
    color: Colors.error,
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },
  formContainer: {
    width: "100%",
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12.5,
    fontWeight: "800",
    color: "#334155",
    marginBottom: 6,
  },
  inputWrapper: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1.2,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
    ...Shadows.soft,
  },
  inputLeftIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#0F172A",
    fontWeight: "600",
  },
  eyeIconBtn: {
    position: "absolute",
    right: 14,
    height: 48,
    justifyContent: "center",
  },
  termsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: "#166534",
    borderColor: "#166534",
  },
  termsText: {
    fontSize: 12.5,
    color: "#64748B",
    fontWeight: "600",
  },
  termsLink: {
    color: "#166534",
    fontWeight: "800",
  },
  signupBtn: {
    height: 52,
    backgroundColor: "#166534",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.primaryBtn,
  },
  signupBtnDisabled: {
    opacity: 0.65,
  },
  signupBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 0.3,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E2E8F0",
  },
  dividerText: {
    paddingHorizontal: 12,
    fontSize: 11.5,
    color: "#94A3B8",
    fontWeight: "700",
  },
  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginBottom: 16,
  },
  socialCard: {
    alignItems: "center",
  },
  socialCircle: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.2,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
    ...Shadows.soft,
  },
  googleCircle: {
    borderColor: "#FEE2E2",
  },
  facebookCircle: {
    borderColor: "#DBEAFE",
  },
  appleCircle: {
    borderColor: "#E2E8F0",
  },
  socialLabel: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "700",
  },
  footer: {
    marginTop: "auto",
    paddingTop: 8,
    alignItems: "center",
  },
  footerText: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "600",
  },
  footerLink: {
    color: "#166534",
    fontWeight: "900",
  },
});
