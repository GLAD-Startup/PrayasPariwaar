import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TextInput,
  StatusBar,
  Linking,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors, Shadows } from "../lib/theme";
import ActionDialog from "../components/ActionDialog";

export default function ContactUsScreen() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [dialogState, setDialogState] = useState<{
    visible: boolean;
    title: string;
    description: string;
    type: "success" | "warning" | "danger" | "primary";
    icon: string;
    badge?: string;
  }>({
    visible: false,
    title: "",
    description: "",
    type: "primary",
    icon: "information-circle-outline",
  });

  const handleSendMessage = () => {
    if (!name.trim() || !email.trim() || !message.trim()) {
      setDialogState({
        visible: true,
        title: "Incomplete Message",
        description: "Please fill in your name, email address, and message to submit your inquiry.",
        type: "warning",
        icon: "alert-circle-outline",
        badge: "REQUIRED FIELDS",
      });
      return;
    }
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setName("");
      setEmail("");
      setMessage("");
      setDialogState({
        visible: true,
        title: "Message Dispatched!",
        description: "Thank you for reaching out to Prayas Pariwaar. Our volunteer coordination desk in Vrindavan will respond shortly.",
        type: "success",
        icon: "checkmark-circle-outline",
        badge: "INQUIRY LOGGED",
      });
    }, 800);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)/profile"))}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={22} color="#164E2E" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Contact Us</Text>

        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>
          We're here to help and answer any question you may have.
        </Text>

        {/* Contact Info Cards */}
        <View style={styles.cardsList}>
          {/* Call Us */}
          <TouchableOpacity
            style={styles.contactCard}
            onPress={() => Linking.openURL("tel:+919676543210")}
            activeOpacity={0.85}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="call-outline" size={20} color="#166534" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardHeading}>Call Us</Text>
              <Text style={styles.cardMainText}>+91 96765 43210</Text>
              <Text style={styles.cardSubText}>Monday to Saturday, 9 AM - 6 PM</Text>
            </View>
          </TouchableOpacity>

          {/* Email Us */}
          <TouchableOpacity
            style={styles.contactCard}
            onPress={() => Linking.openURL("mailto:info@sevadhamtrust.org")}
            activeOpacity={0.85}
          >
            <View style={[styles.iconCircle, { backgroundColor: "#EFF6FF", borderColor: "#BFDBFE" }]}>
              <Ionicons name="mail-outline" size={20} color="#1D4ED8" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardHeading}>Email Us</Text>
              <Text style={styles.cardMainText}>info@sevadhamtrust.org</Text>
              <Text style={styles.cardSubText}>We will respond within 24 hours</Text>
            </View>
          </TouchableOpacity>

          {/* Visit Us */}
          <View style={styles.contactCard}>
            <View style={[styles.iconCircle, { backgroundColor: "#FFFBEB", borderColor: "#FDE68A" }]}>
              <Ionicons name="location-outline" size={20} color="#D97706" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardHeading}>Visit Us</Text>
              <Text style={styles.cardMainText}>Prayas Pariwaar Seva Karyalaya</Text>
              <Text style={styles.cardSubText}>Raman Reti Road, Parikrama Marg, Vrindavan, UP - 281121</Text>
            </View>
          </View>
        </View>

        {/* Follow Us */}
        <Text style={styles.followTitle}>Follow Us</Text>
        <View style={styles.socialRow}>
          {/* Facebook */}
          <TouchableOpacity style={[styles.socialCircle, { backgroundColor: "#1877F2" }]}>
            <FontAwesome name="facebook" size={16} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Instagram */}
          <TouchableOpacity style={[styles.socialCircle, { backgroundColor: "#E1306C" }]}>
            <FontAwesome name="instagram" size={16} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Twitter / X */}
          <TouchableOpacity style={[styles.socialCircle, { backgroundColor: "#1DA1F2" }]}>
            <FontAwesome name="twitter" size={16} color="#FFFFFF" />
          </TouchableOpacity>

          {/* YouTube */}
          <TouchableOpacity style={[styles.socialCircle, { backgroundColor: "#FF0000" }]}>
            <FontAwesome name="youtube-play" size={16} color="#FFFFFF" />
          </TouchableOpacity>

          {/* LinkedIn */}
          <TouchableOpacity style={[styles.socialCircle, { backgroundColor: "#0A66C2" }]}>
            <FontAwesome name="linkedin" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Send us a Message Form */}
        <Text style={styles.formHeading}>Send us a Message</Text>

        <Text style={styles.label}>Your Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your name"
          placeholderTextColor="#94A3B8"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Email Address</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          placeholderTextColor="#94A3B8"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Message</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Type your message"
          placeholderTextColor="#94A3B8"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          value={message}
          onChangeText={setMessage}
        />

        <TouchableOpacity
          style={styles.sendBtn}
          onPress={handleSendMessage}
          activeOpacity={0.88}
          disabled={isSending}
        >
          {isSending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.sendBtnText}>Send Message</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Modern Feedback ActionDialog */}
      <ActionDialog
        visible={dialogState.visible}
        onClose={() => setDialogState({ ...dialogState, visible: false })}
        title={dialogState.title}
        description={dialogState.description}
        type={dialogState.type}
        icon={dialogState.icon}
        badge={dialogState.badge}
        confirmText="Got It"
        showCancel={false}
      />
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
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  headerBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#164E2E",
    letterSpacing: -0.3,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 34,
  },
  subtitle: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 16,
  },
  cardsList: {
    gap: 10,
    marginBottom: 18,
  },
  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 12,
    ...Shadows.soft,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardHeading: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
  },
  cardMainText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 1,
  },
  cardSubText: {
    fontSize: 10,
    color: "#94A3B8",
    marginTop: 2,
  },
  followTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 8,
  },
  socialRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  socialCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  formHeading: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 4,
  },
  input: {
    height: 44,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 13,
    color: "#0F172A",
    marginBottom: 12,
  },
  textArea: {
    height: 90,
    paddingTop: 10,
  },
  sendBtn: {
    height: 48,
    backgroundColor: "#166534",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
    ...Shadows.primaryBtn,
  },
  sendBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
});
