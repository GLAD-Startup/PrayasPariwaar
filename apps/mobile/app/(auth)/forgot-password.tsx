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
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors, Shadows } from "../../lib/theme";

export default function MobileForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleResetPassword = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setError("Please enter your registered email address.");
      return;
    }

    if (!trimmedEmail.includes("@") || !trimmedEmail.includes(".")) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setError("");

    // Simulate reset link dispatch
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 900);
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
              onPress={() => router.replace("/(auth)/login")}
            >
              <Ionicons name="chevron-back" size={24} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Heading */}
          <View style={styles.header}>
            <Text style={styles.title}>Forgot Password</Text>
          </View>

          {/* Lock Illustration Container */}
          <View style={styles.illustrationSection}>
            <View style={styles.lockContainer}>
              <View style={styles.lockCircle}>
                <MaterialCommunityIcons name="lock-reset" size={64} color={Colors.primary} />
              </View>
              <View style={styles.leafBadge}>
                <Text style={styles.leafIcon}>🌿</Text>
              </View>
            </View>
          </View>

          {/* Descriptive text */}
          <View style={styles.textContainer}>
            <Text style={styles.description}>
              Enter your registered email and we'll send you a link to reset your password.
            </Text>
          </View>

          {/* Success Message or Form */}
          {submitted ? (
            <View style={styles.successBox}>
              <View style={styles.successIconCircle}>
                <Ionicons name="mail-open-outline" size={28} color={Colors.primary} />
              </View>
              <Text style={styles.successTitle}>Reset Link Sent!</Text>
              <Text style={styles.successText}>
                We have sent password recovery instructions to:{"\n"}
                <Text style={styles.successEmail}>{email.trim()}</Text>
              </Text>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => router.replace("/(auth)/login")}
              >
                <Text style={styles.actionBtnText}>Back to Login</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.formContainer}>
              {error ? (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle" size={18} color={Colors.error} style={{ marginRight: 6 }} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {/* Email Address */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              {/* Send Reset Link Button */}
              <TouchableOpacity
                style={[styles.resetBtn, loading && styles.resetBtnDisabled]}
                onPress={handleResetPassword}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.resetBtnText}>Send Reset Link</Text>
                )}
              </TouchableOpacity>

              {/* Back to Login Link */}
              <TouchableOpacity
                style={styles.backToLoginBtn}
                onPress={() => router.replace("/(auth)/login")}
              >
                <Text style={styles.backToLoginText}>Back to Login</Text>
              </TouchableOpacity>
            </View>
          )}
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
    paddingTop: Platform.OS === "android" ? 14 : 6,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    ...Shadows.soft,
  },
  header: {
    alignItems: "center",
    marginTop: 8,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.textGreenDark,
    letterSpacing: -0.3,
  },
  illustrationSection: {
    alignItems: "center",
    marginVertical: 18,
  },
  lockContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  lockCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.primaryBorder,
  },
  leafBadge: {
    position: "absolute",
    top: 4,
    left: 4,
    backgroundColor: Colors.white,
    borderRadius: 14,
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: Colors.primaryBorder,
    ...Shadows.soft,
  },
  leafIcon: {
    fontSize: 14,
  },
  textContainer: {
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
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
    marginBottom: 24,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 8,
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
  resetBtn: {
    height: 52,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.primaryBtn,
    marginBottom: 20,
  },
  resetBtnDisabled: {
    opacity: 0.65,
  },
  resetBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  backToLoginBtn: {
    alignItems: "center",
    paddingVertical: 12,
  },
  backToLoginText: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.primary,
  },
  successBox: {
    backgroundColor: Colors.primarySoft,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.primaryBorder,
    padding: 24,
    alignItems: "center",
  },
  successIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
    ...Shadows.soft,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.textGreenDark,
    marginBottom: 8,
  },
  successText: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  successEmail: {
    fontWeight: "700",
    color: Colors.primary,
  },
  actionBtn: {
    height: 46,
    paddingHorizontal: 24,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.primaryBtn,
  },
  actionBtnText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "800",
  },
});
