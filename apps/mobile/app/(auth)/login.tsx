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
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons, FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { api } from "../../lib/api";
import { saveAuthSession } from "../../lib/secureStore";
import { registerForPushNotificationsAsync } from "../../lib/notifications";
import { Colors, Shadows } from "../../lib/theme";

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
              onPress={() => router.canGoBack() ? router.back() : router.replace("/(auth)/onboarding")}
            >
              <Ionicons name="chevron-back" size={24} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Avatar / Prayas Blue Brand Logo */}
          <View style={styles.avatarSection}>
            <Image
              source={require("../../assets/images/prayas-logo-blue.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.orgTagline}>A TRIAL TO MOVE AHEAD</Text>
          </View>

          {/* Heading */}
          <View style={styles.header}>
            <Text style={styles.title}>Welcome Back!</Text>
            <Text style={styles.subtitle}>Sign in to your Prayas Seva account</Text>
          </View>

          {/* Error Message */}
          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color={Colors.error} style={{ marginRight: 6 }} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Email Address */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputWrapper}>
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

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[styles.input, { paddingRight: 44 }]}
                  placeholder="Enter your password"
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

            {/* Forgot Password Link */}
            <View style={styles.forgotPassRow}>
              <TouchableOpacity onPress={() => router.push("/(auth)/forgot-password")}>
                <Text style={styles.forgotPassText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.loginBtnText}>Login</Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Buttons */}
            <View style={styles.socialRow}>
              {/* Google */}
              <TouchableOpacity
                style={styles.socialCard}
                onPress={() => handleQuickFill("donor@prayaspariwaar.com", "donor123")}
              >
                <View style={[styles.socialCircle, styles.googleCircle]}>
                  <FontAwesome name="google" size={22} color="#EA4335" />
                </View>
                <Text style={styles.socialLabel}>Google</Text>
              </TouchableOpacity>

              {/* Facebook */}
              <TouchableOpacity
                style={styles.socialCard}
                onPress={() => handleQuickFill("volunteer@prayaspariwaar.com", "volunteer123")}
              >
                <View style={[styles.socialCircle, styles.facebookCircle]}>
                  <FontAwesome name="facebook" size={22} color="#1877F2" />
                </View>
                <Text style={styles.socialLabel}>Facebook</Text>
              </TouchableOpacity>

              {/* Apple */}
              <TouchableOpacity
                style={styles.socialCard}
                onPress={() => handleQuickFill("admin@prayaspariwaar.com", "admin123")}
              >
                <View style={[styles.socialCircle, styles.appleCircle]}>
                  <FontAwesome name="apple" size={24} color="#000000" />
                </View>
                <Text style={styles.socialLabel}>Apple</Text>
              </TouchableOpacity>
            </View>

            {/* Quick Demo Credentials for Testing */}
            <View style={styles.demoBox}>
              <Text style={styles.demoTitle}>TEST ACCOUNTS</Text>
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
          </View>

          {/* Footer - Sign Up */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Don't have an account?{" "}
              <Text
                style={styles.footerLink}
                onPress={() => router.push("/(auth)/signup")}
              >
                Sign Up
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
  avatarSection: {
    alignItems: "center",
    marginTop: 6,
    marginBottom: 16,
  },
  logoImage: {
    width: 72,
    height: 72,
    borderRadius: 16,
    marginBottom: 6,
  },
  orgTagline: {
    fontSize: 11,
    fontWeight: "800",
    color: Colors.primaryDark,
    letterSpacing: 1,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.primaryDark,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 6,
    fontWeight: "500",
  },
  formContainer: {
    width: "100%",
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
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 8,
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
  forgotPassRow: {
    alignItems: "flex-end",
    marginTop: 2,
    marginBottom: 20,
  },
  forgotPassText: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.primary,
  },
  loginBtn: {
    height: 52,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.primaryBtn,
  },
  loginBtnDisabled: {
    opacity: 0.65,
  },
  loginBtnText: {
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
    marginBottom: 20,
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
  demoBox: {
    backgroundColor: Colors.primarySoft,
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
    marginBottom: 16,
  },
  demoTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: Colors.primary,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  demoPills: {
    flexDirection: "row",
    gap: 8,
  },
  demoPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
  },
  demoPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.primary,
  },
  footer: {
    marginTop: "auto",
    paddingTop: 10,
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
