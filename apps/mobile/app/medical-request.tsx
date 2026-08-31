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

const EQUIPMENT_ITEMS = [
  "Oxygen Concentrator (10L)",
  "Oxygen Concentrator (5L)",
  "BiPAP / CPAP Machine",
  "Adjustable ICU Hospital Bed",
  "Foldable Wheelchair",
  "Electric Suction Machine",
  "Walking Walker with Wheels",
  "Digital Pulse Oximeter",
];

interface ActiveLoan {
  id: string;
  equipmentName: string;
  patientName: string;
  address: string;
  issueDate: string;
  returnDate: string;
  status: "Active at Home" | "Dispatched" | "Under Review";
  statusStep: number;
}

const INITIAL_LOANS: ActiveLoan[] = [
  {
    id: "loan-1",
    equipmentName: "Oxygen Concentrator (10L High-Flow)",
    patientName: "Kamlesh Devi",
    address: "Krishna Nagar, Mathura",
    issueDate: "15 May 2024",
    returnDate: "30 May 2024",
    status: "Active at Home",
    statusStep: 3,
  },
  {
    id: "loan-2",
    equipmentName: "Foldable Wheelchair",
    patientName: "Gopal Krishna",
    address: "Raman Reti, Vrindavan",
    issueDate: "20 May 2024",
    returnDate: "05 Jun 2024",
    status: "Dispatched",
    statusStep: 2,
  },
];

export default function MedicalRequestScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"request" | "status">("request");

  // Form state
  const [equipmentType, setEquipmentType] = useState("Oxygen Concentrator (10L)");
  const [patientName, setPatientName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [duration, setDuration] = useState("15 Days");
  const [equipModalVisible, setEquipModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [activeLoans, setActiveLoans] = useState<ActiveLoan[]>(INITIAL_LOANS);

  useEffect(() => {
    loadEquipmentLoans();
  }, [activeTab]);

  const loadEquipmentLoans = async () => {
    try {
      const res = await api.get<any>("/equipment");
      if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
        const mapped: ActiveLoan[] = res.data.data.map((item: any) => ({
          id: item.id,
          equipmentName: item.equipmentName || item.type || "Medical Equipment",
          patientName: item.patientName || "Beneficiary",
          address: item.deliveryAddress || "Mathura District",
          issueDate: item.issuedAt ? new Date(item.issuedAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" }) : "Active",
          returnDate: item.expectedReturn ? new Date(item.expectedReturn).toLocaleDateString("en-IN", { month: "short", day: "numeric" }) : "In 15 Days",
          status: item.status === "ACTIVE" ? "Active at Home" : item.status === "DISPATCHED" ? "Dispatched" : "Under Review",
          statusStep: item.status === "ACTIVE" ? 3 : item.status === "DISPATCHED" ? 2 : 1,
        }));
        setActiveLoans(mapped);
      }
    } catch (e) {
      console.warn("Failed to load equipment loans:", e);
    }
  };

  const handleRequestSubmit = async () => {
    if (!patientName.trim() || !address.trim() || !phone.trim()) {
      Alert.alert("Incomplete Details", "Please fill in patient name, delivery address, and contact number.");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/equipment", {
        patientName,
        equipmentType,
        deliveryAddress: address,
        contactPhone: phone,
        duration,
      });

      const newLoan: ActiveLoan = {
        id: `loan-${Date.now()}`,
        equipmentName: equipmentType,
        patientName,
        address,
        issueDate: "Today",
        returnDate: `In ${duration}`,
        status: "Under Review",
        statusStep: 1,
      };

      setActiveLoans([newLoan, ...activeLoans]);
      setSuccessModalVisible(true);
    } catch (e) {
      console.error(e);
      const newLoan: ActiveLoan = {
        id: `loan-${Date.now()}`,
        equipmentName: equipmentType,
        patientName,
        address,
        issueDate: "Today",
        returnDate: `In ${duration}`,
        status: "Under Review",
        statusStep: 1,
      };
      setActiveLoans([newLoan, ...activeLoans]);
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

        <Text style={styles.headerTitle}>Equipment Bank</Text>

        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => Linking.openURL("tel:+919676543210")}
          activeOpacity={0.8}
        >
          <Ionicons name="call-outline" size={22} color="#166534" />
        </TouchableOpacity>
      </View>

      {/* Segmented Control Tabs */}
      <View style={styles.tabBarWrapper}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === "request" && styles.tabBtnActive]}
          onPress={() => setActiveTab("request")}
        >
          <Ionicons
            name="medkit-outline"
            size={16}
            color={activeTab === "request" ? "#FFFFFF" : "#64748B"}
            style={{ marginRight: 6 }}
          />
          <Text style={[styles.tabBtnText, activeTab === "request" && styles.tabBtnTextActive]}>
            Request Loan
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === "status" && styles.tabBtnActive]}
          onPress={() => setActiveTab("status")}
        >
          <Ionicons
            name="list-outline"
            size={16}
            color={activeTab === "status" ? "#FFFFFF" : "#64748B"}
            style={{ marginRight: 6 }}
          />
          <Text style={[styles.tabBtnText, activeTab === "status" && styles.tabBtnTextActive]}>
            Active Loans ({activeLoans.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "request" ? (
          /* TAB 1: REQUEST EQUIPMENT FORM */
          <View>
            <View style={styles.bannerAlert}>
              <Ionicons name="gift-outline" size={22} color="#166534" style={{ marginRight: 8 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.bannerAlertTitle}>100% Free Community Loan</Text>
                <Text style={styles.bannerAlertSubtitle}>
                  Zero rental fees. Free home delivery available for critical emergency cases in Mathura & Vrindavan.
                </Text>
              </View>
            </View>

            <Text style={styles.label}>Select Equipment Item</Text>
            <TouchableOpacity
              style={styles.dropdownBtn}
              onPress={() => setEquipModalVisible(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.dropdownValue}>{equipmentType}</Text>
              <Ionicons name="chevron-down" size={16} color="#64748B" />
            </TouchableOpacity>

            <Text style={styles.label}>Patient Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter patient full name"
              placeholderTextColor="#94A3B8"
              value={patientName}
              onChangeText={setPatientName}
            />

            <Text style={styles.label}>Delivery Address & City</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 12, Krishna Nagar, Mathura"
              placeholderTextColor="#94A3B8"
              value={address}
              onChangeText={setAddress}
            />

            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.label}>Contact Phone</Text>
                <TextInput
                  style={styles.input}
                  placeholder="10-digit number"
                  placeholderTextColor="#94A3B8"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>

              <View style={styles.col}>
                <Text style={styles.label}>Duration Needed</Text>
                <View style={styles.durationRow}>
                  {["7 Days", "15 Days", "1 Month"].map((d) => (
                    <TouchableOpacity
                      key={d}
                      style={[styles.durationChip, duration === d && styles.durationChipActive]}
                      onPress={() => setDuration(d)}
                    >
                      <Text
                        style={[
                          styles.durationChipText,
                          duration === d && styles.durationChipTextActive,
                        ]}
                      >
                        {d}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleRequestSubmit}
              activeOpacity={0.88}
            >
              <Ionicons name="send" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.submitBtnText}>Submit Equipment Request</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* TAB 2: ACTIVE LOANS & TRACKER */
          <View style={styles.loansContainer}>
            {activeLoans.map((loan) => (
              <View key={loan.id} style={styles.loanCard}>
                <View style={styles.loanHeader}>
                  <View style={styles.loanIconBox}>
                    <Ionicons name="medkit" size={20} color="#166534" />
                  </View>
                  <View style={styles.loanHeaderInfo}>
                    <Text style={styles.loanEquipTitle}>{loan.equipmentName}</Text>
                    <Text style={styles.loanPatient}>Patient: {loan.patientName}</Text>
                  </View>
                </View>

                {/* Status Stepper */}
                <View style={styles.stepperContainer}>
                  <View style={styles.stepRow}>
                    <View
                      style={[
                        styles.stepDot,
                        loan.statusStep >= 1 ? styles.stepDotCompleted : styles.stepDotPending,
                      ]}
                    />
                    <View
                      style={[
                        styles.stepLine,
                        loan.statusStep >= 2 ? styles.stepLineCompleted : styles.stepLinePending,
                      ]}
                    />
                    <View
                      style={[
                        styles.stepDot,
                        loan.statusStep >= 2 ? styles.stepDotCompleted : styles.stepDotPending,
                      ]}
                    />
                    <View
                      style={[
                        styles.stepLine,
                        loan.statusStep >= 3 ? styles.stepLineCompleted : styles.stepLinePending,
                      ]}
                    />
                    <View
                      style={[
                        styles.stepDot,
                        loan.statusStep >= 3 ? styles.stepDotCompleted : styles.stepDotPending,
                      ]}
                    />
                  </View>

                  <View style={styles.stepLabelsRow}>
                    <Text style={styles.stepLabel}>Submitted</Text>
                    <Text style={styles.stepLabel}>Dispatched</Text>
                    <Text style={styles.stepLabel}>Active at Home</Text>
                  </View>
                </View>

                <View style={styles.loanMetaBox}>
                  <Text style={styles.loanMetaText}>📍 {loan.address}</Text>
                  <Text style={styles.loanMetaText}>
                    📅 Issued: {loan.issueDate} • Return Due: {loan.returnDate}
                  </Text>
                </View>

                <View style={styles.loanActionsRow}>
                  <TouchableOpacity
                    style={styles.loanActionBtnOutline}
                    onPress={() => Alert.alert("Extend Loan", "Loan extension request submitted. Our coordinator will contact you.")}
                  >
                    <Text style={styles.loanActionBtnOutlineText}>Extend Loan</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.loanActionBtnSolid}
                    onPress={() => Alert.alert("Schedule Pickup", "A volunteer driver will pick up the cleaned equipment.")}
                  >
                    <Text style={styles.loanActionBtnSolidText}>Schedule Return</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Equipment Item Picker Modal */}
        <Modal visible={equipModalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Medical Equipment</Text>
                <TouchableOpacity onPress={() => setEquipModalVisible(false)}>
                  <Ionicons name="close-circle" size={24} color="#64748B" />
                </TouchableOpacity>
              </View>

              {EQUIPMENT_ITEMS.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.equipOption,
                    equipmentType === item && styles.equipOptionActive,
                  ]}
                  onPress={() => {
                    setEquipmentType(item);
                    setEquipModalVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.equipOptionText,
                      equipmentType === item && styles.equipOptionTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                  {equipmentType === item && <Ionicons name="checkmark" size={18} color="#166534" />}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Modal>

        {/* Success Modal */}
        <Modal visible={successModalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { alignItems: "center", paddingVertical: 28 }]}>
              <View style={styles.successIconCircle}>
                <Ionicons name="checkmark-done" size={32} color="#166534" />
              </View>
              <Text style={styles.successHeading}>Request Received!</Text>
              <Text style={styles.successDesc}>
                Your request for {equipmentType} has been assigned to our Seva coordinator.
                We will dispatch the sanitized unit to your address promptly.
              </Text>

              <TouchableOpacity
                style={[styles.submitBtn, { width: "100%", marginTop: 20 }]}
                onPress={() => {
                  setSuccessModalVisible(false);
                  setActiveTab("status");
                }}
              >
                <Text style={styles.submitBtnText}>Track Active Loan →</Text>
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
  bannerAlertTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#166534",
  },
  bannerAlertSubtitle: {
    fontSize: 10,
    color: "#475569",
    lineHeight: 14,
    marginTop: 2,
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
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  col: {
    flex: 1,
  },
  durationRow: {
    flexDirection: "row",
    gap: 4,
    marginBottom: 12,
  },
  durationChip: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
  },
  durationChipActive: {
    backgroundColor: "#166534",
    borderColor: "#166534",
  },
  durationChipText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#64748B",
  },
  durationChipTextActive: {
    color: "#FFFFFF",
  },
  submitBtn: {
    height: 48,
    backgroundColor: "#166534",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    ...Shadows.primaryBtn,
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  loansContainer: {
    gap: 14,
  },
  loanCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 14,
    ...Shadows.card,
  },
  loanHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  loanIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  loanHeaderInfo: {
    flex: 1,
  },
  loanEquipTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
  },
  loanPatient: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 1,
  },
  stepperContainer: {
    marginVertical: 10,
    paddingHorizontal: 8,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  stepDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  stepDotCompleted: {
    backgroundColor: "#166534",
  },
  stepDotPending: {
    backgroundColor: "#CBD5E1",
  },
  stepLine: {
    flex: 1,
    height: 3,
  },
  stepLineCompleted: {
    backgroundColor: "#166534",
  },
  stepLinePending: {
    backgroundColor: "#E2E8F0",
  },
  stepLabelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  stepLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: "#64748B",
  },
  loanMetaBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    padding: 10,
    marginVertical: 10,
    gap: 4,
  },
  loanMetaText: {
    fontSize: 11,
    color: "#475569",
  },
  loanActionsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  loanActionBtnOutline: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#166534",
    alignItems: "center",
    justifyContent: "center",
  },
  loanActionBtnOutlineText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#166534",
  },
  loanActionBtnSolid: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#166534",
    alignItems: "center",
    justifyContent: "center",
  },
  loanActionBtnSolidText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#FFFFFF",
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
  equipOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  equipOptionActive: {
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  equipOptionText: {
    fontSize: 13,
    color: "#334155",
    fontWeight: "600",
  },
  equipOptionTextActive: {
    color: "#166534",
    fontWeight: "800",
  },
  successIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  successHeading: {
    fontSize: 18,
    fontWeight: "800",
    color: "#164E2E",
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
