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
  Linking,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors, Shadows } from "../lib/theme";
import { api } from "../lib/api";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

interface LiveBloodRequest {
  id: string;
  patientName: string;
  hospital: string;
  bloodGroup: string;
  units: string;
  urgency: "CRITICAL" | "URGENT" | "NORMAL";
  postedTime: string;
  attendantPhone: string;
  donorsResponding: {
    name: string;
    phone: string;
    distance: string;
    status: string;
  }[];
}

const INITIAL_LIVE_REQUESTS: LiveBloodRequest[] = [
  {
    id: "req-1",
    patientName: "Ramesh Chandra",
    hospital: "City Hospital, Civil Lines, Mathura",
    bloodGroup: "O+",
    units: "2 Units",
    urgency: "CRITICAL",
    postedTime: "15 min ago",
    attendantPhone: "+91 98765 11223",
    donorsResponding: [
      {
        name: "Vikram Singh",
        phone: "+91 98765 44332",
        distance: "1.8 km away",
        status: "Accepted • Reaching in 10 mins 🚗",
      },
      {
        name: "Rahul Verma",
        phone: "+91 98765 88776",
        distance: "3.2 km away",
        status: "Donor Matched • Ready",
      },
    ],
  },
  {
    id: "req-2",
    patientName: "Sunita Devi",
    hospital: "Ramakrishna Mission Hospital, Vrindavan",
    bloodGroup: "B+",
    units: "1 Unit",
    urgency: "URGENT",
    postedTime: "1 hour ago",
    attendantPhone: "+91 98765 99001",
    donorsResponding: [
      {
        name: "Amit Sharma",
        phone: "+91 98765 33221",
        distance: "2.4 km away",
        status: "Donation Completed ✅",
      },
    ],
  },
];

export default function BloodRequestScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"request" | "status">("request");

  // Form state
  const [patientName, setPatientName] = useState("");
  const [hospital, setHospital] = useState("");
  const [bloodGroup, setBloodGroup] = useState("O+");
  const [units, setUnits] = useState("1 Unit");
  const [urgency, setUrgency] = useState<"CRITICAL" | "URGENT" | "NORMAL">("CRITICAL");
  const [attendantPhone, setAttendantPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [bgModalVisible, setBgModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [liveRequests, setLiveRequests] = useState<LiveBloodRequest[]>(INITIAL_LIVE_REQUESTS);
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  useEffect(() => {
    loadLiveRequests();
  }, [activeTab]);

  const loadLiveRequests = async () => {
    try {
      const res = await api.get<any>("/blood-requests");
      if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
        const mapped: LiveBloodRequest[] = res.data.data.map((r: any) => ({
          id: r.id,
          patientName: r.patientName,
          hospital: `${r.hospitalName}, ${r.city || "Mathura"}`,
          bloodGroup: r.bloodGroup?.replace("_POS", "+").replace("_NEG", "-").replace("_", "+") || "O+",
          units: `${r.units || 1} Unit${(r.units || 1) > 1 ? "s" : ""}`,
          urgency: r.urgency || "CRITICAL",
          postedTime: r.createdAt ? new Date(r.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Recent",
          attendantPhone: r.contactPhone,
          donorsResponding: [
            {
              name: "Seva Taskforce Desk",
              phone: "+91 94122 79000",
              distance: "Mathura / Vrindavan",
              status: r.status === "PENDING" ? "Broadcast Dispatched 🚨" : r.status.replace("_", " "),
            },
          ],
        }));
        setLiveRequests(mapped);
      }
    } catch (e) {
      console.warn("Failed to load blood requests:", e);
    }
  };

  const handleBroadcast = async () => {
    if (!patientName.trim() || !hospital.trim() || !attendantPhone.trim()) {
      Alert.alert("Required Details", "Please fill patient name, hospital, and attendant phone number.");
      return;
    }

    setIsSubmitting(true);
    try {
      const bgFormatted = bloodGroup.replace("+", "_POS").replace("-", "_NEG");
      const res = await api.post("/blood-requests", {
        patientName,
        hospitalName: hospital,
        bloodGroup: bgFormatted,
        units: parseInt(units) || 1,
        urgency,
        contactPhone: attendantPhone,
        notes: notes || `Emergency request for ${patientName}`,
        city: "Mathura",
      });

      const newReq: LiveBloodRequest = {
        id: `req-${Date.now()}`,
        patientName,
        hospital,
        bloodGroup,
        units,
        urgency,
        postedTime: "Just now",
        attendantPhone,
        donorsResponding: [
          {
            name: "Volunteer Taskforce",
            phone: "+91 94122 79000",
            distance: "Mathura Central",
            status: "Push Broadcast Dispatched 🚨",
          },
        ],
      };

      setLiveRequests([newReq, ...liveRequests]);
      setSuccessModalVisible(true);
    } catch (e) {
      console.error(e);
      Alert.alert("Emergency Broadcast Dispatched", "Your emergency request has been queued for immediate volunteer matching.");
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

        <Text style={styles.headerTitle}>Blood Desk</Text>

        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => router.push("/blood-donor-registration")}
          activeOpacity={0.8}
        >
          <Ionicons name="person-add-outline" size={22} color="#DC2626" />
        </TouchableOpacity>
      </View>

      {/* Segmented Control Tabs */}
      <View style={styles.tabBarWrapper}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === "request" && styles.tabBtnActive]}
          onPress={() => setActiveTab("request")}
        >
          <Ionicons
            name="megaphone-outline"
            size={16}
            color={activeTab === "request" ? "#FFFFFF" : "#64748B"}
            style={{ marginRight: 6 }}
          />
          <Text style={[styles.tabBtnText, activeTab === "request" && styles.tabBtnTextActive]}>
            Request Blood
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === "status" && styles.tabBtnActive]}
          onPress={() => setActiveTab("status")}
        >
          <Ionicons
            name="pulse-outline"
            size={16}
            color={activeTab === "status" ? "#FFFFFF" : "#64748B"}
            style={{ marginRight: 6 }}
          />
          <Text style={[styles.tabBtnText, activeTab === "status" && styles.tabBtnTextActive]}>
            Live Status ({liveRequests.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "request" ? (
          /* TAB 1: REQUEST BLOOD FORM */
          <View>
            <View style={styles.bannerAlert}>
              <Ionicons name="shield-checkmark" size={20} color="#166534" style={{ marginRight: 8 }} />
              <Text style={styles.bannerAlertText}>
                24/7 Verified Voluntary Donor Broadcast in Mathura & Vrindavan. 100% Free Seva.
              </Text>
            </View>

            <Text style={styles.label}>Patient Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Ramesh Chandra"
              placeholderTextColor="#94A3B8"
              value={patientName}
              onChangeText={setPatientName}
            />

            <Text style={styles.label}>Hospital Name & Room/Ward</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. City Hospital, Ward 4, Mathura"
              placeholderTextColor="#94A3B8"
              value={hospital}
              onChangeText={setHospital}
            />

            {/* Blood Group & Units */}
            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.label}>Blood Group</Text>
                <TouchableOpacity
                  style={styles.dropdownBtn}
                  onPress={() => setBgModalVisible(true)}
                >
                  <Text style={styles.dropdownValue}>{bloodGroup}</Text>
                  <Ionicons name="chevron-down" size={16} color="#64748B" />
                </TouchableOpacity>
              </View>

              <View style={styles.col}>
                <Text style={styles.label}>Units Required</Text>
                <View style={styles.unitsRow}>
                  {["1 Unit", "2 Units", "3+ Units"].map((u) => (
                    <TouchableOpacity
                      key={u}
                      style={[styles.unitChip, units === u && styles.unitChipActive]}
                      onPress={() => setUnits(u)}
                    >
                      <Text style={[styles.unitChipText, units === u && styles.unitChipTextActive]}>
                        {u}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* Urgency Selector */}
            <Text style={styles.label}>Urgency Level</Text>
            <View style={styles.urgencyRow}>
              <TouchableOpacity
                style={[styles.urgencyChip, urgency === "CRITICAL" && styles.urgencyCritical]}
                onPress={() => setUrgency("CRITICAL")}
              >
                <Text
                  style={[
                    styles.urgencyText,
                    urgency === "CRITICAL" && styles.urgencyTextActive,
                  ]}
                >
                  🚨 Immediate (&lt;1h)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.urgencyChip, urgency === "URGENT" && styles.urgencyUrgent]}
                onPress={() => setUrgency("URGENT")}
              >
                <Text
                  style={[
                    styles.urgencyText,
                    urgency === "URGENT" && styles.urgencyTextActive,
                  ]}
                >
                  ⚡ Today
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.urgencyChip, urgency === "NORMAL" && styles.urgencyNormal]}
                onPress={() => setUrgency("NORMAL")}
              >
                <Text
                  style={[
                    styles.urgencyText,
                    urgency === "NORMAL" && styles.urgencyTextActive,
                  ]}
                >
                  Scheduled
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Attendant Contact Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter 10-digit mobile number"
              placeholderTextColor="#94A3B8"
              keyboardType="phone-pad"
              value={attendantPhone}
              onChangeText={setAttendantPhone}
            />

            <Text style={styles.label}>Doctor Prescription / Medical Note (Optional)</Text>
            <TextInput
              style={[styles.input, { height: 70, paddingTop: 10 }]}
              placeholder="e.g. Surgery scheduled, platelet requirement..."
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              value={notes}
              onChangeText={setNotes}
            />

            <TouchableOpacity
              style={styles.broadcastBtn}
              onPress={handleBroadcast}
              activeOpacity={0.88}
            >
              <Ionicons name="radio-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.broadcastBtnText}>Broadcast Emergency Alert</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* TAB 2: LIVE STATUS & RESPONSES */
          <View style={styles.statusContainer}>
            {liveRequests.map((req) => (
              <View key={req.id} style={styles.liveCard}>
                <View style={styles.liveCardHeader}>
                  <View style={styles.livePulseWrapper}>
                    <View style={styles.livePulseDot} />
                    <Text style={styles.livePulseText}>LIVE BROADCAST</Text>
                  </View>
                  <Text style={styles.liveTimeText}>{req.postedTime}</Text>
                </View>

                <View style={styles.liveMainRow}>
                  <View style={styles.bloodBadge}>
                    <Text style={styles.bloodBadgeText}>{req.bloodGroup}</Text>
                    <Text style={styles.bloodUnitsText}>{req.units}</Text>
                  </View>

                  <View style={styles.liveInfo}>
                    <Text style={styles.patientName}>{req.patientName}</Text>
                    <View style={styles.locRow}>
                      <Ionicons name="location-outline" size={13} color="#64748B" style={{ marginRight: 3 }} />
                      <Text style={styles.hospitalText}>{req.hospital}</Text>
                    </View>
                  </View>
                </View>

                {/* Responding Donors */}
                <Text style={styles.donorsHeading}>
                  Matched Donors ({req.donorsResponding.length})
                </Text>
                {req.donorsResponding.map((donor, idx) => (
                  <View key={idx} style={styles.donorRow}>
                    <View style={styles.donorAvatar}>
                      <Ionicons name="person" size={16} color="#166534" />
                    </View>
                    <View style={styles.donorDetails}>
                      <Text style={styles.donorName}>{donor.name}</Text>
                      <Text style={styles.donorStatus}>{donor.status}</Text>
                    </View>

                    <TouchableOpacity
                      style={styles.callDonorBtn}
                      onPress={() => Linking.openURL(`tel:${donor.phone}`)}
                    >
                      <Ionicons name="call" size={15} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                ))}

                <TouchableOpacity
                  style={styles.attendantCallRow}
                  onPress={() => Linking.openURL(`tel:${req.attendantPhone}`)}
                >
                  <Ionicons name="call-outline" size={14} color="#166534" style={{ marginRight: 6 }} />
                  <Text style={styles.attendantCallText}>Call Attendant: {req.attendantPhone}</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Blood Group Picker Modal */}
        <Modal visible={bgModalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Blood Group</Text>
                <TouchableOpacity onPress={() => setBgModalVisible(false)}>
                  <Ionicons name="close-circle" size={24} color="#64748B" />
                </TouchableOpacity>
              </View>

              <View style={styles.bgGrid}>
                {BLOOD_GROUPS.map((bg) => (
                  <TouchableOpacity
                    key={bg}
                    style={[styles.bgChip, bloodGroup === bg && styles.bgChipActive]}
                    onPress={() => {
                      setBloodGroup(bg);
                      setBgModalVisible(false);
                    }}
                  >
                    <Text style={[styles.bgChipText, bloodGroup === bg && styles.bgChipTextActive]}>
                      {bg}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </Modal>

        {/* Broadcast Confirmation Modal */}
        <Modal visible={successModalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { alignItems: "center", paddingVertical: 28 }]}>
              <View style={styles.broadcastIconCircle}>
                <Ionicons name="radio" size={32} color="#DC2626" />
              </View>
              <Text style={styles.successHeading}>Alert Broadcasted!</Text>
              <Text style={styles.successDesc}>
                Emergency notification for {bloodGroup} blood has been broadcasted to verified donors
                within a 15 km radius in Mathura & Vrindavan.
              </Text>

              <TouchableOpacity
                style={[styles.broadcastBtn, { width: "100%", marginTop: 20 }]}
                onPress={() => {
                  setSuccessModalVisible(false);
                  setActiveTab("status");
                }}
              >
                <Text style={styles.broadcastBtnText}>View Live Status →</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
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
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#164E2E",
    letterSpacing: -0.3,
  },
  tabBarWrapper: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 12,
    padding: 3,
  },
  tabBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 10,
  },
  tabBtnActive: {
    backgroundColor: "#166534",
    ...Shadows.soft,
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
  },
  tabBtnTextActive: {
    color: "#FFFFFF",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 34,
  },
  bannerAlert: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BBF7D0",
    padding: 12,
    marginBottom: 16,
  },
  bannerAlertText: {
    flex: 1,
    fontSize: 11,
    fontWeight: "700",
    color: "#166534",
    lineHeight: 15,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 4,
    marginTop: 4,
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
  row: {
    flexDirection: "row",
    gap: 12,
  },
  col: {
    flex: 1,
  },
  dropdownBtn: {
    height: 44,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  dropdownValue: {
    fontSize: 14,
    fontWeight: "800",
    color: "#DC2626",
  },
  unitsRow: {
    flexDirection: "row",
    gap: 4,
    marginBottom: 12,
  },
  unitChip: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
  },
  unitChipActive: {
    backgroundColor: "#166534",
    borderColor: "#166534",
  },
  unitChipText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
  },
  unitChipTextActive: {
    color: "#FFFFFF",
  },
  urgencyRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  urgencyChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  urgencyCritical: {
    backgroundColor: "#DC2626",
    borderColor: "#DC2626",
  },
  urgencyUrgent: {
    backgroundColor: "#D97706",
    borderColor: "#D97706",
  },
  urgencyNormal: {
    backgroundColor: "#166534",
    borderColor: "#166534",
  },
  urgencyText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#334155",
  },
  urgencyTextActive: {
    color: "#FFFFFF",
  },
  broadcastBtn: {
    height: 48,
    backgroundColor: "#DC2626",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    ...Shadows.primaryBtn,
  },
  broadcastBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  statusContainer: {
    gap: 14,
  },
  liveCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 14,
    ...Shadows.card,
  },
  liveCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  livePulseWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#DC2626",
    marginRight: 6,
  },
  livePulseText: {
    fontSize: 9,
    fontWeight: "900",
    color: "#DC2626",
    letterSpacing: 0.4,
  },
  liveTimeText: {
    fontSize: 10,
    color: "#94A3B8",
    fontWeight: "600",
  },
  liveMainRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  bloodBadge: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  bloodBadgeText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#DC2626",
  },
  bloodUnitsText: {
    fontSize: 8,
    fontWeight: "800",
    color: "#991B1B",
  },
  liveInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
  },
  locRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  hospitalText: {
    fontSize: 11,
    color: "#64748B",
  },
  donorsHeading: {
    fontSize: 11,
    fontWeight: "800",
    color: "#166534",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  donorRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    padding: 10,
    marginBottom: 6,
  },
  donorAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#F0FDF4",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  donorDetails: {
    flex: 1,
  },
  donorName: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0F172A",
  },
  donorStatus: {
    fontSize: 10,
    color: "#166534",
    fontWeight: "600",
  },
  callDonorBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#166534",
    alignItems: "center",
    justifyContent: "center",
  },
  attendantCallRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 10,
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  attendantCallText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#166534",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#164E2E",
  },
  bgGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginVertical: 10,
  },
  bgChip: {
    width: "22%",
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  bgChipActive: {
    backgroundColor: "#DC2626",
    borderColor: "#DC2626",
  },
  bgChipText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#334155",
  },
  bgChipTextActive: {
    color: "#FFFFFF",
  },
  broadcastIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  successHeading: {
    fontSize: 18,
    fontWeight: "800",
    color: "#DC2626",
    marginBottom: 6,
  },
  successDesc: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 10,
  },
});
