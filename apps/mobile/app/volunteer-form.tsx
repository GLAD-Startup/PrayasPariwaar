import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TextInput,
  StatusBar,
  Alert,
  Modal,
  ActivityIndicator,
  Linking,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors, Shadows } from "../lib/theme";
import { api } from "../lib/api";
import { getStoredUser } from "../lib/secureStore";
import ActionDialog from "../components/ActionDialog";

const { width } = Dimensions.get("window");

const INTEREST_AREAS = [
  "Free Education",
  "Blood Donation",
  "Tree Plantation",
  "Jeev Jal Seva",
  "Vocational Training",
  "Medical Equipment",
  "Admin & Events",
  "Digital Outreach",
];

const STATES = [
  "Uttar Pradesh",
  "Delhi NCR",
  "Haryana",
  "Rajasthan",
  "Madhya Pradesh",
  "Punjab",
  "Maharashtra",
  "Other",
];

export interface VolunteerRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  areasOfInterest: string[];
  skills?: string;
  city?: string;
  state?: string;
  status: "PENDING" | "APPROVED" | "ACTIVE" | "INACTIVE";
  createdAt: string;
}

export default function VolunteerFormScreen() {
  const router = useRouter();

  // Mode: "STATUS" (show existing application) or "FORM" (fill out new application)
  const [viewMode, setViewMode] = useState<"STATUS" | "FORM">("FORM");
  const [existingVolunteer, setExistingVolunteer] = useState<VolunteerRecord | null>(null);
  const [checkingExisting, setCheckingExisting] = useState(true);

  // Form state for creating new volunteer application
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState<"Male" | "Female" | "Other">("Male");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Vrindavan");
  const [state, setState] = useState("Uttar Pradesh");
  const [pincode, setPincode] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    "Free Education",
    "Tree Plantation",
  ]);
  const [statePickerVisible, setStatePickerVisible] = useState(false);
  const [submittedModalVisible, setSubmittedModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogState, setDialogState] = useState<{
    visible: boolean;
    title: string;
    description: string;
    type: "success" | "warning" | "danger" | "primary" | "info";
    icon: string;
    badge?: string;
  }>({
    visible: false,
    title: "",
    description: "",
    type: "primary",
    icon: "information-circle-outline",
  });

  useEffect(() => {
    checkExistingApplication();
  }, []);

  const checkExistingApplication = async () => {
    setCheckingExisting(true);
    try {
      // 1. Check logged-in user profile
      const user = await getStoredUser();

      if (!user || (!user.email && !user.phone)) {
        // Unauthenticated or guest user: default directly to new form
        setExistingVolunteer(null);
        setViewMode("FORM");
        setCheckingExisting(false);
        return;
      }

      // Pre-fill form fields with user's info for convenience
      if (user.name) setFullName(user.name);
      if (user.email) setEmail(user.email);
      if (user.phone) setPhone(user.phone);
      if (user.city) setCity(user.city);

      // 2. Query API for live volunteer registration scoped strictly to this user
      const queryParams = new URLSearchParams();
      if (user.email) queryParams.append("email", user.email);
      else if (user.phone) queryParams.append("phone", user.phone);

      const res = await api.get<any>(`/volunteers?${queryParams.toString()}`);
      if (res.data?.success && res.data.registered && res.data.data) {
        const d = res.data.data;
        const vol: VolunteerRecord = {
          id: d.id,
          name: d.name,
          email: d.email,
          phone: d.phone,
          areasOfInterest: Array.isArray(d.areasOfInterest) && d.areasOfInterest.length > 0
            ? d.areasOfInterest
            : [d.areaOfInterest || "Free Education"],
          skills: d.skills,
          city: d.city,
          state: d.state,
          status: d.status || "PENDING",
          createdAt: d.createdAt,
        };
        setExistingVolunteer(vol);
        setViewMode("STATUS");
      } else {
        setExistingVolunteer(null);
        setViewMode("FORM");
      }
    } catch (e) {
      console.log("[Volunteer Status Check Notice]", e);
      setViewMode("FORM");
    } finally {
      setCheckingExisting(false);
    }
  };

  const toggleInterest = (area: string) => {
    if (selectedInterests.includes(area)) {
      if (selectedInterests.length === 1) {
        setDialogState({
          visible: true,
          title: "Selection Required",
          description: "Please select at least one seva domain you wish to contribute towards.",
          type: "warning",
          icon: "alert-circle-outline",
          badge: "SEVA DOMAIN",
        });
        return;
      }
      setSelectedInterests(selectedInterests.filter((item) => item !== area));
    } else {
      setSelectedInterests([...selectedInterests, area]);
    }
  };

  const handleStartNewApplication = () => {
    setFullName("");
    setEmail("");
    setPhone("");
    setDob("");
    setAddress("");
    setCity("Vrindavan");
    setPincode("");
    setSelectedInterests(["Free Education", "Tree Plantation"]);
    setViewMode("FORM");
  };

  const handleSubmit = async () => {
    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      setDialogState({
        visible: true,
        title: "Missing Fields",
        description: "Please enter your Full Name, Email, and Contact Phone Number to proceed.",
        type: "warning",
        icon: "alert-circle-outline",
        badge: "REQUIRED",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post<any>("/volunteers", {
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        dob: dob.trim() || undefined,
        gender: gender || undefined,
        address: address.trim() || undefined,
        city: city.trim() || "Vrindavan",
        state: state.trim() || "Uttar Pradesh",
        pincode: pincode.trim() || undefined,
        areasOfInterest: selectedInterests,
        skills: selectedInterests.join(", "),
        availability: "Weekends / On-Call",
      });

      if (res.data?.success && res.data.data) {
        const d = res.data.data;
        const vol: VolunteerRecord = {
          id: d.id,
          name: d.name,
          email: d.email,
          phone: d.phone,
          areasOfInterest: Array.isArray(d.areasOfInterest) && d.areasOfInterest.length > 0
            ? d.areasOfInterest
            : selectedInterests,
          skills: d.skills || selectedInterests.join(", "),
          city: d.city || city,
          state: d.state || state,
          status: d.status || "PENDING",
          createdAt: d.createdAt || new Date().toISOString(),
        };
        setExistingVolunteer(vol);
        setSubmittedModalVisible(true);
      } else {
        setDialogState({
          visible: true,
          title: "Submission Error",
          description: res.data?.error || "Could not register volunteer application. Please verify your details.",
          type: "danger",
          icon: "close-circle-outline",
        });
      }
    } catch (e: any) {
      console.error("[Volunteer Submit Error]", e);
      setDialogState({
        visible: true,
        title: "Connection Error",
        description: e?.message || "Failed to reach Prayas server. Please verify your internet connection and try again.",
        type: "danger",
        icon: "cloud-offline-outline",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)/home"))}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          {viewMode === "STATUS" ? "My Volunteer Status" : "Volunteer Registration"}
        </Text>

        {existingVolunteer && viewMode === "FORM" ? (
          <TouchableOpacity
            style={styles.headerTextBtn}
            onPress={() => setViewMode("STATUS")}
          >
            <Text style={styles.headerTextBtnLabel}>My Status</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      {checkingExisting ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Checking volunteer records...</Text>
        </View>
      ) : viewMode === "STATUS" && existingVolunteer ? (
        /* ========================================================================= */
        /* VIEW MODE 1: EXISTING VOLUNTEER APPLICATION STATUS CARD                   */
        /* ========================================================================= */
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Status Hero Card */}
          <View style={styles.statusHeroCard}>
            <View style={styles.statusHeroTop}>
              <View style={styles.statusEmblem}>
                <MaterialCommunityIcons name="hand-heart" size={28} color={Colors.primary} />
              </View>
              <View style={styles.statusBadgeWrapper}>
                <View
                  style={[
                    styles.statusPill,
                    existingVolunteer.status === "APPROVED" || existingVolunteer.status === "ACTIVE"
                      ? styles.statusPillApproved
                      : styles.statusPillPending,
                  ]}
                >
                  <Ionicons
                    name={
                      existingVolunteer.status === "APPROVED" || existingVolunteer.status === "ACTIVE"
                        ? "checkmark-circle"
                        : "time-outline"
                    }
                    size={14}
                    color={
                      existingVolunteer.status === "APPROVED" || existingVolunteer.status === "ACTIVE"
                        ? "#166534"
                        : "#D97706"
                    }
                    style={{ marginRight: 4 }}
                  />
                  <Text
                    style={[
                      styles.statusPillText,
                      existingVolunteer.status === "APPROVED" || existingVolunteer.status === "ACTIVE"
                        ? { color: "#166534" }
                        : { color: "#D97706" },
                    ]}
                  >
                    {existingVolunteer.status === "ACTIVE"
                      ? "Active Sevak"
                      : existingVolunteer.status === "APPROVED"
                      ? "Verified Volunteer"
                      : "Application Under Review"}
                  </Text>
                </View>
              </View>
            </View>

            <Text style={styles.statusApplicantName}>{existingVolunteer.name}</Text>
            <Text style={styles.statusRegistrationId}>
              Registration Ref: VOL-{existingVolunteer.id.slice(-6).toUpperCase()}
            </Text>

            <View style={styles.statusDivider} />

            <View style={styles.statusMetaGrid}>
              <View style={styles.statusMetaItem}>
                <Ionicons name="mail-outline" size={14} color="#64748B" style={{ marginRight: 6 }} />
                <Text style={styles.statusMetaText}>{existingVolunteer.email}</Text>
              </View>
              <View style={styles.statusMetaItem}>
                <Ionicons name="call-outline" size={14} color="#64748B" style={{ marginRight: 6 }} />
                <Text style={styles.statusMetaText}>{existingVolunteer.phone}</Text>
              </View>
              <View style={styles.statusMetaItem}>
                <Ionicons name="location-outline" size={14} color="#64748B" style={{ marginRight: 6 }} />
                <Text style={styles.statusMetaText}>
                  {existingVolunteer.city || "Vrindavan"}, {existingVolunteer.state || "UP"}
                </Text>
              </View>
              <View style={styles.statusMetaItem}>
                <Ionicons name="calendar-outline" size={14} color="#64748B" style={{ marginRight: 6 }} />
                <Text style={styles.statusMetaText}>
                  Applied: {new Date(existingVolunteer.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </Text>
              </View>
            </View>

            {/* Selected Seva Streams */}
            <View style={styles.statusStreamsBox}>
              <Text style={styles.statusStreamsLabel}>Selected Seva Streams:</Text>
              <View style={styles.statusChipsRow}>
                {existingVolunteer.areasOfInterest.map((stream, idx) => (
                  <View key={idx} style={styles.statusStreamChip}>
                    <Ionicons name="sparkles" size={11} color={Colors.primary} style={{ marginRight: 4 }} />
                    <Text style={styles.statusStreamChipText}>{stream}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Coordination Desk Card */}
          <View style={styles.deskCard}>
            <View style={styles.deskCardHeader}>
              <Ionicons name="business-outline" size={20} color={Colors.primary} />
              <Text style={styles.deskCardTitle}>Vrindavan Seva Karyalaya Desk</Text>
            </View>
            <Text style={styles.deskCardDesc}>
              Our volunteer coordinators review new applications every 24 hours. You will receive an orientation invite via WhatsApp and SMS for the upcoming seva drive.
            </Text>
            <View style={styles.deskActionsRow}>
              <TouchableOpacity
                style={styles.deskContactBtn}
                onPress={() => Linking.openURL("tel:+919927081650")}
              >
                <Ionicons name="call" size={14} color={Colors.primary} style={{ marginRight: 4 }} />
                <Text style={styles.deskContactBtnText}>Call Coordinator</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deskContactBtn}
                onPress={() => Linking.openURL("mailto:av.prayas@gmail.com")}
              >
                <Ionicons name="mail" size={14} color={Colors.primary} style={{ marginRight: 4 }} />
                <Text style={styles.deskContactBtnText}>Email Desk</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Register Another Person Button */}
          <View style={styles.registerAnotherSection}>
            <Text style={styles.registerAnotherHeading}>
              Want to enroll a family member, friend, or submit a new form?
            </Text>
            <TouchableOpacity
              style={styles.registerAnotherBtn}
              onPress={handleStartNewApplication}
              activeOpacity={0.88}
            >
              <Ionicons name="person-add" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.registerAnotherBtnText}>
                Register Another Volunteer
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        /* ========================================================================= */
        /* VIEW MODE 2: NEW VOLUNTEER REGISTRATION FORM                              */
        /* ========================================================================= */
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {existingVolunteer && (
            <View style={styles.switchNoticeBanner}>
              <Ionicons name="information-circle" size={18} color={Colors.primary} style={{ marginRight: 8 }} />
              <Text style={styles.switchNoticeText}>
                Registering a new volunteer. Your existing application is active.
              </Text>
            </View>
          )}

          <Text style={styles.sectionHeading}>Personal Information</Text>

          {/* Full Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Ramesh Chandra"
              placeholderTextColor="#94A3B8"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          {/* Email & Phone */}
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Email Address *</Text>
              <TextInput
                style={styles.input}
                placeholder="name@example.com"
                placeholderTextColor="#94A3B8"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Phone Number *</Text>
              <TextInput
                style={styles.input}
                placeholder="10-digit mobile"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
            </View>
          </View>

          {/* Gender Selector */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Gender</Text>
            <View style={styles.genderRow}>
              {(["Male", "Female", "Other"] as const).map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[styles.genderChip, gender === g && styles.genderChipActive]}
                  onPress={() => setGender(g)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.genderChipText, gender === g && styles.genderChipTextActive]}>
                    {g}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Multi-Select Causes / Areas of Interest */}
          <Text style={[styles.sectionHeading, { marginTop: 18 }]}>
            Areas of Interest / Seva Streams *
          </Text>
          <Text style={styles.subLabel}>
            Tap to select all streams you want to volunteer for:
          </Text>

          <View style={styles.interestsGrid}>
            {INTEREST_AREAS.map((area) => {
              const isSelected = selectedInterests.includes(area);
              return (
                <TouchableOpacity
                  key={area}
                  style={[styles.interestChip, isSelected && styles.interestChipSelected]}
                  onPress={() => toggleInterest(area)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={isSelected ? "checkmark-circle" : "add-circle-outline"}
                    size={16}
                    color={isSelected ? "#FFFFFF" : Colors.primary}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={[
                      styles.interestChipText,
                      isSelected && styles.interestChipTextSelected,
                    ]}
                  >
                    {area}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Address & City */}
          <Text style={[styles.sectionHeading, { marginTop: 18 }]}>Location & Address</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Residential Address</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Near Raman Reti, Parikrama Marg"
              placeholderTextColor="#94A3B8"
              value={address}
              onChangeText={setAddress}
            />
          </View>

          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>City / District</Text>
              <TextInput
                style={styles.input}
                placeholder="Vrindavan / Mathura"
                placeholderTextColor="#94A3B8"
                value={city}
                onChangeText={setCity}
              />
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>State</Text>
              <TouchableOpacity
                style={styles.dropdownBtn}
                onPress={() => setStatePickerVisible(true)}
              >
                <Text style={styles.dropdownBtnText}>{state}</Text>
                <Ionicons name="chevron-down" size={16} color="#64748B" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.88}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.submitBtnText}>Submit Volunteer Application</Text>
                <Ionicons name="arrow-forward" size={16} color="#FFFFFF" style={{ marginLeft: 8 }} />
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* State Picker Modal */}
      <Modal visible={statePickerVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select State</Text>
              <TouchableOpacity onPress={() => setStatePickerVisible(false)}>
                <Ionicons name="close-circle" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 300 }}>
              {STATES.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={styles.modalItem}
                  onPress={() => {
                    setState(s);
                    setStatePickerVisible(false);
                  }}
                >
                  <Text style={[styles.modalItemText, state === s && styles.modalItemTextActive]}>
                    {s}
                  </Text>
                  {state === s && <Ionicons name="checkmark" size={18} color={Colors.primary} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal visible={submittedModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.successModalContent}>
            <View style={styles.successIconCircle}>
              <Ionicons name="checkmark" size={32} color={Colors.primary} />
            </View>
            <Text style={styles.successTitle}>Application Submitted!</Text>
            <Text style={styles.successSubtitle}>
              Thank you for stepping forward to serve society. Your application has been recorded in the Prayas database and our coordinator will reach out to you within 24 hours.
            </Text>
            <TouchableOpacity
              style={styles.successBtn}
              onPress={() => {
                setSubmittedModalVisible(false);
                setViewMode("STATUS");
              }}
            >
              <Text style={styles.successBtnText}>View My Application Status</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Reusable ActionDialog */}
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
    backgroundColor: "#F8FAFC",
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1E3A8A",
  },
  headerTextBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  headerTextBtnLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.primary,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: "#64748B",
  },

  /* STATUS HERO CARD */
  statusHeroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    ...Shadows.card,
    marginBottom: 16,
  },
  statusHeroTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  statusEmblem: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    alignItems: "center",
    justifyContent: "center",
  },
  statusBadgeWrapper: {},
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusPillApproved: {
    backgroundColor: "#F0FDF4",
    borderColor: "#BBF7D0",
  },
  statusPillPending: {
    backgroundColor: "#FFFBEB",
    borderColor: "#FDE68A",
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: "700",
  },
  statusApplicantName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
  },
  statusRegistrationId: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    marginTop: 2,
  },
  statusDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 14,
  },
  statusMetaGrid: {
    gap: 8,
  },
  statusMetaItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusMetaText: {
    fontSize: 12,
    color: "#334155",
    fontWeight: "500",
  },
  statusStreamsBox: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  statusStreamsLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statusChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  statusStreamChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusStreamChipText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.primary,
  },

  /* DESK CARD */
  deskCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 16,
    ...Shadows.card,
  },
  deskCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  deskCardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E3A8A",
  },
  deskCardDesc: {
    fontSize: 12,
    color: "#64748B",
    lineHeight: 18,
    marginBottom: 12,
  },
  deskActionsRow: {
    flexDirection: "row",
    gap: 10,
  },
  deskContactBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    paddingVertical: 8,
    borderRadius: 10,
  },
  deskContactBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.primary,
  },

  /* REGISTER ANOTHER */
  registerAnotherSection: {
    backgroundColor: "#1E3A8A",
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    marginTop: 4,
    ...Shadows.card,
  },
  registerAnotherHeading: {
    fontSize: 13,
    color: "#E2E8F0",
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 18,
  },
  registerAnotherBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  registerAnotherBtnText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  /* FORM STYLES */
  switchNoticeBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  switchNoticeText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: "600",
    flex: 1,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 10,
  },
  subLabel: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 10,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 5,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: "#0F172A",
  },
  row: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  col: {
    flex: 1,
  },
  genderRow: {
    flexDirection: "row",
    gap: 8,
  },
  genderChip: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
  },
  genderChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  genderChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
  },
  genderChipTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  interestsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 14,
  },
  interestChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  interestChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  interestChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#334155",
  },
  interestChipTextSelected: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  dropdownBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  dropdownBtnText: {
    fontSize: 13,
    color: "#0F172A",
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 18,
    ...Shadows.card,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  /* MODALS */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },
  modalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  modalItemText: {
    fontSize: 14,
    color: "#334155",
  },
  modalItemTextActive: {
    color: Colors.primary,
    fontWeight: "700",
  },
  successModalContent: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
  },
  successIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#EFF6FF",
    borderWidth: 2,
    borderColor: "#BFDBFE",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 20,
  },
  successBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },
  successBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
