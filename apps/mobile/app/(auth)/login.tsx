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
  StatusBar,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons, FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { api } from "../../lib/api";
import { saveAuthSession, getAuthUser } from "../../lib/secureStore";
import { registerForPushNotificationsAsync } from "../../lib/notifications";
import { useGoogleAuth } from "../../lib/googleAuth";
import { Colors, Shadows } from "../../lib/theme";

export default function MobileLoginScreen() {
  const router = useRouter();
  const searchParams = useLocalSearchParams<{ oauthError?: string }>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (searchParams.oauthError) {
      getAuthUser()
        .then((user) => {
          if (user?.id) {
            router.replace("/(tabs)/home");
          } else {
            setError(decodeURIComponent(searchParams.oauthError!));
          }
        })
        .catch(() => {
          setError(decodeURIComponent(searchParams.oauthError!));
        });
    }
  }, [searchParams.oauthError]);

  const { signInWithGoogle, loading: googleLoading } = useGoogleAuth({
    onSuccess: () => {
      router.replace("/(tabs)/home");
    },
    onError: (errMsg) => {
      getAuthUser()
        .then((user) => {
          if (user?.id) {
            router.replace("/(tabs)/home");
          } else {
            setError(errMsg);
          }
        })
        .catch(() => {
          setError(errMsg);
        });
    },
  });

  const handleLogin = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password) {
      setError("Please enter your email and password.");
      return;
    }

    if (!trimmedEmail.includes("@") || !trimmedEmail.includes(".")) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setError("");

    const response = await api.post(
      "/auth/login",
      {
        email: trimmedEmail,
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
              onPress={() => (router.canGoBack() ? router.back() : router.replace("/(auth)/onboarding"))}
              activeOpacity={0.8}
            >
              <Ionicons name="chevron-back" size={22} color={Colors.primary} />
            </TouchableOpacity>

            <View style={styles.topBadge}>
              <Text style={styles.topBadgeText}>SEVA PORTAL</Text>
            </View>
          </View>

          {/* Avatar / Prayas Brand Logo */}
          <View style={styles.avatarSection}>
            <View style={styles.logoCard}>
              <Image
                source={require("../../assets/images/prayas-logo-blue.png")}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
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

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={18} color="#64748B" style={styles.inputLeftIcon} />
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
                    color="#64748B"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password Link */}
            <View style={styles.forgotPassRow}>
              <TouchableOpacity onPress={() => router.push("/(auth)/forgot-password")} activeOpacity={0.8}>
                <Text style={styles.forgotPassText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.88}
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
                onPress={signInWithGoogle}
                disabled={loading || googleLoading}
                activeOpacity={0.8}
              >
                <View style={[styles.socialCircle, styles.googleCircle]}>
                  {googleLoading ? (
                    <ActivityIndicator size="small" color="#EA4335" />
                  ) : (
                    <Image
                      source={require("../../assets/images/google-logo.png")}
                      style={{ width: 24, height: 24 }}
                      resizeMode="contain"
                    />
                  )}
                </View>
                <Text style={styles.socialLabel}>Google</Text>
              </TouchableOpacity>

              {/* Facebook */}
              <TouchableOpacity
                style={styles.socialCard}
                onPress={() =>
                  Alert.alert(
                    "Facebook Sign-In",
                    "Facebook Sign-In will be available in the upcoming release. Please sign in with Google or your email credentials.",
                    [{ text: "OK" }]
                  )
                }
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
                onPress={() =>
                  Alert.alert(
                    "Sign in with Apple",
                    "Apple Sign-In will be available in the upcoming release. Please sign in with Google or your email credentials.",
                    [{ text: "OK" }]
                  )
                }
                activeOpacity={0.8}
              >
                <View style={[styles.socialCircle, styles.appleCircle]}>
                  <FontAwesome name="apple" size={22} color="#000000" />
                </View>
                <Text style={styles.socialLabel}>Apple</Text>
              </TouchableOpacity>
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
  avatarSection: {
    alignItems: "center",
    marginTop: 4,
    marginBottom: 14,
  },
  logoCard: {
    width: 76,
    height: 76,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    ...Shadows.soft,
  },
  logoImage: {
    width: 58,
    height: 58,
    borderRadius: 12,
  },
  orgTagline: {
    fontSize: 11,
    fontWeight: "800",
    color: "#166534",
    letterSpacing: 1.2,
  },
  header: {
    alignItems: "center",
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
  forgotPassRow: {
    alignItems: "flex-end",
    marginTop: 2,
    marginBottom: 18,
  },
  forgotPassText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#166534",
  },
  loginBtn: {
    height: 52,
    backgroundColor: "#166534",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.primaryBtn,
  },
  loginBtnDisabled: {
    opacity: 0.65,
  },
  loginBtnText: {
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
    marginBottom: 18,
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
