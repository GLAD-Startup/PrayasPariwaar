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
import { api } from "../../lib/api";

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

    try {
      const res = await api.post(
        "/auth/forgot-password",
        { email: trimmedEmail },
        { skipAuth: true }
      );

      if (res.error) {
        setError(res.error);
        return;
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err?.message || "Failed to submit recovery request. Please try again.");
    } finally {
      setLoading(false);
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
              onPress={() => router.replace("/(auth)/login")}
              activeOpacity={0.8}
            >
              <Ionicons name="chevron-back" size={22} color={Colors.primary} />
            </TouchableOpacity>

            <View style={styles.topBadge}>
              <Text style={styles.topBadgeText}>RECOVERY</Text>
            </View>
          </View>

          {/* Heading */}
          <View style={styles.header}>
            <Text style={styles.title}>Forgot Password</Text>
          </View>

          {/* Lock Illustration Container */}
          <View style={styles.illustrationSection}>
            <View style={styles.lockContainer}>
              <View style={styles.lockCircle}>
                <Ionicons name="shield-checkmark-outline" size={54} color="#166534" />
              </View>
              <View style={styles.leafBadge}>
                <Ionicons name="lock-closed" size={14} color="#166534" />
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
                <Ionicons name="mail-open-outline" size={28} color="#166534" />
              </View>
              <Text style={styles.successTitle}>Reset Link Sent!</Text>
              <Text style={styles.successText}>
                We have sent password recovery instructions to:{"\n"}
                <Text style={styles.successEmail}>{email.trim()}</Text>
              </Text>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => router.replace("/(auth)/login")}
                activeOpacity={0.88}
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
                <View style={styles.inputWrapper}>
                  <Ionicons name="mail-outline" size={18} color="#64748B" style={styles.inputLeftIcon} />
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
              </View>

              {/* Send Reset Link Button */}
              <TouchableOpacity
                style={[styles.resetBtn, loading && styles.resetBtnDisabled]}
                onPress={handleResetPassword}
                disabled={loading}
                activeOpacity={0.88}
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
                activeOpacity={0.8}
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
    alignItems: "center",
    marginTop: 4,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: "#14532D",
    letterSpacing: -0.4,
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
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: "#F0FDF4",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#BBF7D0",
  },
  leafBadge: {
    position: "absolute",
    top: 2,
    left: 2,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#BBF7D0",
    ...Shadows.soft,
  },
  textContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  description: {
    fontSize: 13.5,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
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
    marginBottom: 18,
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
  resetBtn: {
    height: 52,
    backgroundColor: "#166534",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.primaryBtn,
    marginBottom: 16,
  },
  resetBtnDisabled: {
    opacity: 0.65,
  },
  resetBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 0.3,
  },
  backToLoginBtn: {
    alignItems: "center",
    paddingVertical: 10,
  },
  backToLoginText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#166534",
  },
  successBox: {
    backgroundColor: "#F0FDF4",
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: "#BBF7D0",
    padding: 24,
    alignItems: "center",
  },
  successIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: "#BBF7D0",
    ...Shadows.soft,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#14532D",
    marginBottom: 8,
  },
  successText: {
    fontSize: 13,
    color: "#475569",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
    fontWeight: "500",
  },
  successEmail: {
    fontWeight: "800",
    color: "#166534",
  },
  actionBtn: {
    height: 48,
    paddingHorizontal: 24,
    backgroundColor: "#166534",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.primaryBtn,
  },
  actionBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },
});
