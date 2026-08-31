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
    if (!name.trim() || !email.trim() || !password) {
      setError("Please fill in your full name, email, and password.");
      return;
    }

    if (password.length < 4) {
      setError("Password must be at least 4 characters.");
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
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: phone.trim() || undefined,
        role: "VOLUNTEER", // Default member account; donor & specialized seva registrations are managed inside the app
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
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

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
            >
              <Ionicons name="chevron-back" size={24} color={Colors.primary} />
            </TouchableOpacity>
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

          {/* Form Container (Clean 4-Field Form) */}
          <View style={styles.formContainer}>
            {/* Full Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor={Colors.textMuted}
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Email Address */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
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

            {/* Phone Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your phone number"
                placeholderTextColor={Colors.textMuted}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
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
                    color={Colors.textSecondary}
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
                {agreedTerms && <Ionicons name="checkmark" size={14} color={Colors.white} />}
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
              activeOpacity={0.85}
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

            {/* Enhanced Social Buttons with Authentic Logos & Labels */}
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
              >
                <View style={[styles.socialCircle, styles.googleCircle]}>
                  <FontAwesome name="google" size={22} color="#EA4335" />
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
              >
                <View style={[styles.socialCircle, styles.facebookCircle]}>
                  <FontAwesome name="facebook" size={22} color="#1877F2" />
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
              >
                <View style={[styles.socialCircle, styles.appleCircle]}>
                  <FontAwesome name="apple" size={24} color="#000000" />
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
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  topBar: {
    height: 48,
    justifyContent: "center",
    marginTop: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primarySoft,
  },
  header: {
    marginTop: 6,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.textGreenDark,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
    fontWeight: "500",
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
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  inputWrapper: {
    position: "relative",
    justifyContent: "center",
  },
  input: {
    height: 50,
    backgroundColor: Colors.inputBg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 14,
    color: Colors.textPrimary,
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
    borderColor: Colors.border,
    backgroundColor: Colors.inputBg,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  termsText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  termsLink: {
    color: Colors.primary,
    fontWeight: "700",
  },
  signupBtn: {
    height: 52,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.primaryBtn,
  },
  signupBtnDisabled: {
    opacity: 0.65,
  },
  signupBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 22,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    paddingHorizontal: 12,
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: "600",
  },
  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
    marginBottom: 16,
  },
  socialCard: {
    alignItems: "center",
  },
  socialCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
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
    color: Colors.textSecondary,
    fontWeight: "600",
  },
  footer: {
    marginTop: "auto",
    paddingTop: 14,
    alignItems: "center",
  },
  footerText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  footerLink: {
    color: Colors.primary,
    fontWeight: "800",
  },
});
