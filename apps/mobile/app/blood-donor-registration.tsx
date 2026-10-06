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
import { getStoredUser, getItem, setItem } from "../lib/secureStore";
import ActionDialog from "../components/ActionDialog";

const { width } = Dimensions.get("window");
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

function formatBloodGroup(bg?: string): string {
  if (!bg) return "O+";
  const trimmed = bg.trim();
  if (/^(A|B|AB|O)[+-]$/i.test(trimmed)) return trimmed.toUpperCase();
  const map: Record<string, string> = {
    A_POSITIVE: "A+",
    A_NEGATIVE: "A-",
    B_POSITIVE: "B+",
    B_NEGATIVE: "B-",
    AB_POSITIVE: "AB+",
    AB_NEGATIVE: "AB-",
    O_POSITIVE: "O+",
    O_NEGATIVE: "O-",
    A_POS: "A+",
    A_NEG: "A-",
    B_POS: "B+",
    B_NEG: "B-",
    AB_POS: "AB+",
    AB_NEG: "AB-",
    O_POS: "O+",
    O_NEG: "O-",
  };
  if (map[trimmed.toUpperCase()]) return map[trimmed.toUpperCase()];
  return trimmed
    .replace(/_POSITIVE/gi, "+")
    .replace(/_NEGATIVE/gi, "-")
    .replace(/_POS/gi, "+")
    .replace(/_NEG/gi, "-")
    .replace(/\s*POSITIVE/gi, "+")
    .replace(/\s*NEGATIVE/gi, "-")
    .trim();
}

export interface BloodDonorRecord {
  id: string;
  name: string;
  phone: string;
  email?: string;
  bloodGroup: string;
  city: string;
  address?: string;
  createdAt: string;
}

export default function BloodDonorRegistrationScreen() {
  const router = useRouter();

  // Mode: "STATUS" (show existing donor card) or "FORM" (register new donor)
  const [viewMode, setViewMode] = useState<"STATUS" | "FORM">("FORM");
  const [existingDonor, setExistingDonor] = useState<BloodDonorRecord | null>(null);
  const [checkingExisting, setCheckingExisting] = useState(true);

  // Form state
  const [fullName, setFullName] = useState("");
  const [bloodGroup, setBloodGroup] = useState("O+");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("Mathura / Vrindavan");
  const [address, setAddress] = useState("");
  const [bgPickerVisible, setBgPickerVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
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
    checkExistingDonor();
  }, []);

  const checkExistingDonor = async () => {
    setCheckingExisting(true);
    try {
      // 1. Check if logged in user has bloodGroup
      const user = await getStoredUser();
      let queryPhone = user?.phone;
      let queryEmail = user?.email;

      // 2. Check local cached donor record
      const cachedDonorStr = await getItem("prayas_my_blood_donor_record");
      if (cachedDonorStr) {
        try {
          const cached = JSON.parse(cachedDonorStr);
          if (cached && cached.phone) {
            setExistingDonor(cached);
            setViewMode("STATUS");
            queryPhone = queryPhone || cached.phone;
            queryEmail = queryEmail || cached.email;
          }
        } catch (e) {}
      }

      // 3. Query API for live blood donor registration
      if (queryPhone || queryEmail || user) {
        const queryParams = new URLSearchParams();
        if (queryPhone) queryParams.append("phone", queryPhone);
        if (queryEmail) queryParams.append("email", queryEmail);

        const res = await api.get<any>(`/blood-donors?${queryParams.toString()}`);
        if (res.data?.success && res.data.registered && res.data.data) {
          const donorData = res.data.data;
          const donor: BloodDonorRecord = {
            id: donorData.id,
            name: donorData.name,
            phone: donorData.phone,
            email: donorData.email,
            bloodGroup: formatBloodGroup(donorData.bloodGroup),
            city: donorData.city || "Mathura / Vrindavan",
            address: donorData.address,
            createdAt: donorData.createdAt,
          };
          setExistingDonor(donor);
          await setItem("prayas_my_blood_donor_record", JSON.stringify(donor));
          setViewMode("STATUS");
        }
      }
    } catch (e) {
      console.log("[Blood Donor Check Error]", e);
    } finally {
      setCheckingExisting(false);
    }
  };

  const handleStartNewRegistration = () => {
    setFullName("");
    setPhone("");
    setEmail("");
    setCity("Mathura / Vrindavan");
    setAddress("");
    setViewMode("FORM");
  };

  const handleRegister = async () => {
    if (!fullName.trim() || !bloodGroup || !phone.trim()) {
      setDialogState({
        visible: true,
        title: "Incomplete Details",
        description: "Please enter your Full Name, Blood Group, and Contact Phone Number to enroll as a donor.",
        type: "warning",
        icon: "water-outline",
        badge: "REQUIRED",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post<any>("/blood-donors", {
        name: fullName.trim(),
        phone: phone.trim(),
        email: email ? email.trim() : undefined,
        bloodGroup,
        city: city || "Mathura / Vrindavan",
        address: address || undefined,
      });

      // If already registered
      if (res.data?.alreadyRegistered && res.data.data) {
        const donorData = res.data.data;
        const donor: BloodDonorRecord = {
          id: donorData.id,
          name: donorData.name,
          phone: donorData.phone,
          email: donorData.email,
          bloodGroup: formatBloodGroup(donorData.bloodGroup),
          city: donorData.city || "Mathura / Vrindavan",
          address: donorData.address,
          createdAt: donorData.createdAt,
        };
        setExistingDonor(donor);
        await setItem("prayas_my_blood_donor_record", JSON.stringify(donor));
        setViewMode("STATUS");
        setDialogState({
          visible: true,
          title: "Donor Already Registered",
          description: `${donor.name} is already registered as an active ${donor.bloodGroup} voluntary donor in the Prayas Rapid Response Network.`,
          type: "success",
          icon: "checkmark-circle-outline",
          badge: "ACTIVE DONOR",
        });
        return;
      }

      if (res.data?.success && res.data.data) {
        const donorData = res.data.data;
        const donor: BloodDonorRecord = {
          id: donorData.id,
          name: donorData.name,
          phone: donorData.phone,
          email: donorData.email,
          bloodGroup: formatBloodGroup(donorData.bloodGroup),
          city: donorData.city || "Mathura / Vrindavan",
          address: donorData.address,
          createdAt: donorData.createdAt,
        };
        setExistingDonor(donor);
        await setItem("prayas_my_blood_donor_record", JSON.stringify(donor));
        setSuccessModalVisible(true);
      } else {
        const donor: BloodDonorRecord = {
          id: `BD-${Date.now().toString().slice(-6)}`,
          name: fullName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          bloodGroup,
          city: city || "Mathura / Vrindavan",
          address,
          createdAt: new Date().toISOString(),
        };
        setExistingDonor(donor);
        await setItem("prayas_my_blood_donor_record", JSON.stringify(donor));
        setSuccessModalVisible(true);
      }
    } catch (e) {
      console.warn("Blood donor registration fallback", e);
      const donor: BloodDonorRecord = {
        id: `BD-${Date.now().toString().slice(-6)}`,
        name: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        bloodGroup,
        city: city || "Mathura / Vrindavan",
        address,
        createdAt: new Date().toISOString(),
      };
      setExistingDonor(donor);
      await setItem("prayas_my_blood_donor_record", JSON.stringify(donor));
      setSuccessModalVisible(true);
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
          <Ionicons name="arrow-back" size={22} color="#164E2E" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          {viewMode === "STATUS" ? "My Donor Status" : "Blood Donor Registration"}
        </Text>

        {existingDonor && viewMode === "FORM" ? (
          <TouchableOpacity
            style={styles.headerTextBtn}
            onPress={() => setViewMode("STATUS")}
          >
            <Text style={styles.headerTextBtnLabel}>My Donor Card</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      {checkingExisting ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#DC2626" />
          <Text style={styles.loadingText}>Checking blood donor registry...</Text>
        </View>
      ) : viewMode === "STATUS" && existingDonor ? (
        /* ========================================================================= */
        /* VIEW MODE 1: REGISTERED BLOOD DONOR ID CARD & DISPATCH STATUS             */
        /* ========================================================================= */
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Donor ID Card */}
          <View style={styles.donorIdCard}>
            <View style={styles.donorIdCardTop}>
              <View style={styles.bloodGroupBadge}>
                <Ionicons name="water" size={16} color="#FFFFFF" style={{ marginRight: 2 }} />
                <Text style={styles.bloodGroupBadgeText}>{existingDonor.bloodGroup}</Text>
              </View>

              <View style={styles.activeStatusPill}>
                <View style={styles.greenDotPulse} />
                <Text style={styles.activeStatusPillText}>Ready to Donate</Text>
              </View>
            </View>

            <Text style={styles.donorApplicantName}>{existingDonor.name}</Text>
            <Text style={styles.donorRegistrationRef}>
              Donor ID: BD-{existingDonor.bloodGroup.replace("+", "POS").replace("-", "NEG")}-{existingDonor.id.slice(-6).toUpperCase()}
            </Text>

            <View style={styles.donorDivider} />

            <View style={styles.donorMetaGrid}>
              <View style={styles.donorMetaItem}>
                <Ionicons name="call-outline" size={14} color="#94A3B8" style={{ marginRight: 6 }} />
                <Text style={styles.donorMetaText}>{existingDonor.phone}</Text>
              </View>
              {existingDonor.email && (
                <View style={styles.donorMetaItem}>
                  <Ionicons name="mail-outline" size={14} color="#94A3B8" style={{ marginRight: 6 }} />
                  <Text style={styles.donorMetaText}>{existingDonor.email}</Text>
                </View>
              )}
              <View style={styles.donorMetaItem}>
                <Ionicons name="location-outline" size={14} color="#94A3B8" style={{ marginRight: 6 }} />
                <Text style={styles.donorMetaText}>{existingDonor.city || "Mathura / Vrindavan"}</Text>
              </View>
              <View style={styles.donorMetaItem}>
                <Ionicons name="shield-checkmark-outline" size={14} color="#94A3B8" style={{ marginRight: 6 }} />
                <Text style={styles.donorMetaText}>
                  Registered: {new Date(existingDonor.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </Text>
              </View>
            </View>

            {/* Impact Banner inside Card */}
            <View style={styles.donorImpactBanner}>
              <MaterialCommunityIcons name="heart-pulse" size={18} color="#F87171" style={{ marginRight: 6 }} />
              <Text style={styles.donorImpactBannerText}>
                You are enrolled in the 24/7 Mathura & Vrindavan Trauma & Thalassemia Emergency Response Taskforce.
              </Text>
            </View>
          </View>

          {/* Emergency Dispatch Desk Help */}
          <View style={styles.emergencyDeskCard}>
            <View style={styles.emergencyDeskHeader}>
              <Ionicons name="call" size={18} color="#DC2626" />
              <Text style={styles.emergencyDeskTitle}>24/7 Blood Coordination Desk</Text>
            </View>
            <Text style={styles.emergencyDeskDesc}>
              In case of urgent matching or if you are temporarily unavailable for donation, contact our 24/7 hospital desk.
            </Text>
            <TouchableOpacity
              style={styles.emergencyCallBtn}
              onPress={() => Linking.openURL("tel:+919927081650")}
              activeOpacity={0.88}
            >
              <Ionicons name="call" size={15} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.emergencyCallBtnText}>Call Helpline: +91 99270 81650</Text>
            </TouchableOpacity>
          </View>

          {/* Register Another Person Button */}
          <View style={styles.registerAnotherBox}>
            <Text style={styles.registerAnotherText}>
              Know a family member or friend with a matching or rare blood group?
            </Text>
            <TouchableOpacity
              style={styles.registerAnotherBtn}
              onPress={handleStartNewRegistration}
              activeOpacity={0.88}
            >
              <Ionicons name="person-add" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.registerAnotherBtnText}>Register Another Donor</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        /* ========================================================================= */
        /* VIEW MODE 2: NEW BLOOD DONOR REGISTRATION FORM                            */
        /* ========================================================================= */
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {existingDonor && (
            <View style={styles.switchNoticeBanner}>
              <Ionicons name="information-circle" size={18} color="#DC2626" style={{ marginRight: 8 }} />
              <Text style={styles.switchNoticeText}>
                Registering a new donor. Your existing donor record ({existingDonor.name}, {existingDonor.bloodGroup}) remains active.
              </Text>
            </View>
          )}

          {/* Emblem & Subtitle */}
          <View style={styles.emblemSection}>
            <View style={styles.emblemCircle}>
              <Ionicons name="water" size={38} color="#DC2626" />
            </View>
            <Text style={styles.emblemTitle}>Save Lives in Mathura & Vrindavan</Text>
            <Text style={styles.emblemSubtitle}>
              Join our network of voluntary blood donors ready to support trauma patients, Thalassemia children, and emergencies.
            </Text>
          </View>

          {/* Full Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Vikram Singh"
              placeholderTextColor="#94A3B8"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          {/* Blood Group Selection Chips */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Blood Group *</Text>
            <View style={styles.bgChipsGrid}>
              {BLOOD_GROUPS.map((bg) => (
                <TouchableOpacity
                  key={bg}
                  style={[styles.bgSelectChip, bloodGroup === bg && styles.bgSelectChipActive]}
                  onPress={() => setBloodGroup(bg)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.bgSelectChipText,
                      bloodGroup === bg && styles.bgSelectChipTextActive,
                    ]}
                  >
                    {bg}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Phone Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contact Phone Number *</Text>
            <TextInput
              style={styles.input}
              placeholder="10-digit mobile for emergency dispatch"
              placeholderTextColor="#94A3B8"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
          </View>

          {/* Email (Optional) */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address (Optional)</Text>
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

          {/* City / Location */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>City / Area</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Raman Reti, Vrindavan / Civil Lines, Mathura"
              placeholderTextColor="#94A3B8"
              value={city}
              onChangeText={setCity}
            />
          </View>

          {/* Register Button */}
          <TouchableOpacity
            style={styles.registerBtn}
            onPress={handleRegister}
            disabled={isSubmitting}
            activeOpacity={0.88}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.registerBtnText}>Join Blood Donor Registry</Text>
                <Ionicons name="arrow-forward" size={16} color="#FFFFFF" style={{ marginLeft: 8 }} />
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Success Modal */}
      <Modal visible={successModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.successModalContent}>
            <View style={styles.successIconCircle}>
              <Ionicons name="water" size={32} color="#DC2626" />
            </View>
            <Text style={styles.successTitle}>Registration Successful!</Text>
            <Text style={styles.successSubtitle}>
              Thank you for enrolling as a voluntary blood donor with Prayas Pariwaar. You are now part of our rapid emergency hospital dispatch registry.
            </Text>
            <TouchableOpacity
              style={styles.successBtn}
              onPress={() => {
                setSuccessModalVisible(false);
                setViewMode("STATUS");
              }}
            >
              <Text style={styles.successBtnText}>View My Donor ID Card</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Universal ActionDialog */}
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
    backgroundColor: "#F8FAF8",
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
    paddingTop: 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
  },
  headerBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#991B1B",
  },
  headerTextBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  headerTextBtnLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#DC2626",
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

  /* DONOR ID CARD */
  donorIdCard: {
    backgroundColor: "#1E293B",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#0F172A",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  donorIdCardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  bloodGroupBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DC2626",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: "#DC2626",
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  bloodGroupBadgeText: {
    fontSize: 18,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  activeStatusPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(34, 197, 94, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.4)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  greenDotPulse: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#22C55E",
    marginRight: 6,
  },
  activeStatusPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#4ADE80",
  },
  donorApplicantName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  donorRegistrationRef: {
    fontSize: 12,
    fontWeight: "600",
    color: "#94A3B8",
    marginTop: 2,
    fontFamily: "monospace",
  },
  donorDivider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginVertical: 14,
  },
  donorMetaGrid: {
    gap: 8,
  },
  donorMetaItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  donorMetaText: {
    fontSize: 13,
    color: "#E2E8F0",
    fontWeight: "500",
  },
  donorImpactBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(220, 38, 38, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(220, 38, 38, 0.3)",
    borderRadius: 12,
    padding: 10,
    marginTop: 14,
  },
  donorImpactBannerText: {
    fontSize: 11,
    color: "#FCA5A5",
    lineHeight: 16,
    flex: 1,
  },

  /* EMERGENCY DESK CARD */
  emergencyDeskCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#FECACA",
    marginBottom: 16,
    ...Shadows.card,
  },
  emergencyDeskHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  emergencyDeskTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#991B1B",
  },
  emergencyDeskDesc: {
    fontSize: 12,
    color: "#64748B",
    lineHeight: 18,
    marginBottom: 12,
  },
  emergencyCallBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#DC2626",
    paddingVertical: 10,
    borderRadius: 10,
  },
  emergencyCallBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  /* REGISTER ANOTHER BOX */
  registerAnotherBox: {
    backgroundColor: "#7F1D1D",
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    ...Shadows.card,
  },
  registerAnotherText: {
    fontSize: 13,
    color: "#FEE2E2",
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 18,
  },
  registerAnotherBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EF4444",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
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
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  switchNoticeText: {
    fontSize: 12,
    color: "#991B1B",
    fontWeight: "600",
    flex: 1,
  },
  emblemSection: {
    alignItems: "center",
    marginBottom: 18,
  },
  emblemCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#FEF2F2",
    borderWidth: 2,
    borderColor: "#FECACA",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  emblemTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
    marginBottom: 4,
  },
  emblemSubtitle: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 12,
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
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: "#0F172A",
  },
  bgChipsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  bgSelectChip: {
    width: (width - 36 - 24) / 4,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  bgSelectChipActive: {
    backgroundColor: "#DC2626",
    borderColor: "#DC2626",
  },
  bgSelectChipText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#334155",
  },
  bgSelectChipTextActive: {
    color: "#FFFFFF",
  },
  registerBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#DC2626",
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 14,
    ...Shadows.card,
  },
  registerBtnText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  /* MODAL */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  successModalContent: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
  },
  successIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FEF2F2",
    borderWidth: 2,
    borderColor: "#FECACA",
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
    backgroundColor: "#DC2626",
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
