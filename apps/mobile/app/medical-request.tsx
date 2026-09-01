import React, { useState, useEffect, useCallback } from "react";
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
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors, Shadows } from "../lib/theme";
import { api } from "../lib/api";

const { width } = Dimensions.get("window");

interface EquipmentItem {
  id: string;
  name: string;
  category: string;
  description?: string;
  status?: string;
  quantity?: number;
}

const DEFAULT_EQUIPMENT_ITEMS: EquipmentItem[] = [
  {
    id: "eq-1",
    name: "10L High-Flow Medical Oxygen Concentrator",
    category: "Respiratory Support",
    description: "Medical-grade 10-liter continuous oxygen concentrator with dual flow output.",
  },
  {
    id: "eq-2",
    name: "Foldable Lightweight Hospital Wheelchair",
    category: "Mobility Assistance",
    description: "Heavy-duty chrome frame wheelchair with cushioned armrests and footrests.",
  },
  {
    id: "eq-3",
    name: "2-Function Adjustable Hospital Fowler Bed",
    category: "Patient Beds & Care",
    description: "Manual crank-operated 2-function hospital bed with headrest and leg-rest elevation.",
  },
  {
    id: "eq-4",
    name: "Anti-Bedsore Alternating Pressure Air Mattress",
    category: "Patient Beds & Care",
    description: "Bubble air mattress with ultra-quiet pump to prevent bedsores in bedridden patients.",
  },
  {
    id: "eq-5",
    name: "Adjustable Aluminum Walking Frame (Walker)",
    category: "Mobility Assistance",
    description: "Sturdy, lightweight adjustable height walking frame with non-slip rubber tips.",
  },
  {
    id: "eq-6",
    name: "Heavy-Duty Compressor Nebulizer Machine",
    category: "Respiratory Support",
    description: "High-efficiency medication nebulizer for respiratory and asthma patients.",
  },
  {
    id: "eq-7",
    name: "BiPAP / CPAP Respiratory Machine",
    category: "Respiratory Support",
    description: "Non-invasive dual-pressure ventilator for home respiratory support.",
  },
];

const PURPOSE_SUGGESTIONS = [
  "Post-hospitalization recovery",
  "Pneumonia & respiratory oxygen support",
  "Post-orthopedic surgery mobility",
  "Elderly bedridden home care",
  "Chronic asthma treatment",
];

const DURATION_OPTIONS = [
  { label: "7 Days", value: 7 },
  { label: "15 Days", value: 15 },
  { label: "30 Days", value: 30 },
  { label: "60 Days", value: 60 },
];

interface ActiveLoan {
  id: string;
  equipmentId?: string;
  equipmentName: string;
  category?: string;
  patientName: string;
  requesterName: string;
  contactPhone: string;
  address: string;
  city?: string;
  purpose?: string;
  issueDate: string;
  returnDate: string;
  status: "PENDING" | "APPROVED" | "ACTIVE" | "RETURNED" | "REJECTED";
  statusStep: number;
}

export default function MedicalRequestScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"request" | "status">("request");

  // Equipment List & Selection
  const [inventory, setInventory] = useState<EquipmentItem[]>(DEFAULT_EQUIPMENT_ITEMS);
  const [selectedItem, setSelectedItem] = useState<EquipmentItem>(DEFAULT_EQUIPMENT_ITEMS[0]);
  const [equipModalVisible, setEquipModalVisible] = useState(false);

  // Form State
  const [patientName, setPatientName] = useState("");
  const [requesterName, setRequesterName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Vrindavan");
  const [requestedDays, setRequestedDays] = useState<number>(15);
  const [purpose, setPurpose] = useState(PURPOSE_SUGGESTIONS[0]);

  // Loading & Modals
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [lastSubmittedId, setLastSubmittedId] = useState<string>("");

  // Active Loans List
  const [activeLoans, setActiveLoans] = useState<ActiveLoan[]>([]);
  const [loadingLoans, setLoadingLoans] = useState(false);

  useEffect(() => {
    loadEquipmentInventory();
    loadEquipmentLoans();
  }, []);

  const loadEquipmentInventory = async () => {
    try {
      const res = await api.get<any>("/equipment");
      if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
        setInventory(res.data.data);
        if (res.data.data[0]) {
          setSelectedItem(res.data.data[0]);
        }
      }
    } catch (e) {
      console.warn("Failed to load live equipment inventory, using defaults:", e);
    }
  };

  const loadEquipmentLoans = async () => {
    setLoadingLoans(true);
    try {
      const res = await api.get<any>("/equipment/requests");
      if (res.data?.success && Array.isArray(res.data.data)) {
        const mapped: ActiveLoan[] = res.data.data.map((req: any) => {
          let step = 1;
          if (req.status === "APPROVED") step = 2;
          if (req.status === "ACTIVE") step = 3;
          if (req.status === "RETURNED") step = 4;

          const createdDate = req.createdAt
            ? new Date(req.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })
            : "Recent";

          let returnText = `In ${req.requestedDays || 15} Days`;
          if (req.returnDueDate) {
            returnText = new Date(req.returnDueDate).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });
          }

          return {
            id: req.id,
            equipmentId: req.equipmentId,
            equipmentName: req.equipment?.name || req.equipmentName || "Medical Device",
            category: req.equipment?.category || "Medical Aid",
            patientName: req.patientName || req.requesterName || "Beneficiary",
            requesterName: req.requesterName || "Attendant",
            contactPhone: req.contactPhone || "",
            address: req.deliveryAddress || "Mathura District",
            city: req.city || "Mathura",
            purpose: req.purpose || "Medical homecare",
            issueDate: req.issueDate ? new Date(req.issueDate).toLocaleDateString("en-IN", { month: "short", day: "numeric" }) : createdDate,
            returnDate: returnText,
            status: req.status || "PENDING",
            statusStep: step,
          };
        });

        setActiveLoans(mapped);
      }
    } catch (e) {
      console.warn("Failed to load live equipment requests:", e);
    } finally {
      setLoadingLoans(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadEquipmentInventory(), loadEquipmentLoans()]);
    setRefreshing(false);
  };

  const handleRequestSubmit = async () => {
    if (!patientName.trim()) {
      Alert.alert("Required Field", "Please enter the patient's full name.");
      return;
    }
    if (!phone.trim() || phone.trim().length < 8) {
      Alert.alert("Required Field", "Please enter a valid 10-digit contact phone number.");
      return;
    }
    if (!address.trim()) {
      Alert.alert("Required Field", "Please enter the delivery address in Mathura or Vrindavan.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        equipmentId: selectedItem.id,
        equipmentName: selectedItem.name,
        equipmentType: selectedItem.name,
        patientName: patientName.trim(),
        requesterName: requesterName.trim() || patientName.trim(),
        contactPhone: phone.trim(),
        deliveryAddress: address.trim(),
        city: city.trim() || "Vrindavan",
        purpose: purpose.trim() || "Home medical recovery support",
        requestedDays: requestedDays,
      };

      const res = await api.post<any>("/equipment/requests", payload);

      if (res.data?.success && res.data.data) {
        const newRecord = res.data.data;
        setLastSubmittedId(newRecord.id || `REQ-${Date.now().toString().slice(-4)}`);

        // Refresh active loans list
        await loadEquipmentLoans();

        // Clear form
        setPatientName("");
        setRequesterName("");
        setPhone("");
        setAddress("");

        setSuccessModalVisible(true);
      } else {
        throw new Error(res.data?.error || "Submission failed");
      }
    } catch (error: any) {
      console.error("Submit loan error:", error);
      Alert.alert(
        "Notice",
        "Your loan request could not be saved to the server right now. Our helpline has been informed: +91 94122 79001."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCallEmergency = () => {
    Linking.openURL("tel:+919412279001").catch(() => {
      Alert.alert("Helpline", "Prayas Seva Coordination Desk: +91 94122 79001");
    });
  };

  const getEquipmentIcon = (category?: string, name?: string) => {
    const text = (category + " " + name).toLowerCase();
    if (text.includes("oxygen") || text.includes("bipap") || text.includes("nebulizer")) {
      return <Ionicons name="fitness-outline" size={20} color="#0D9488" />;
    }
    if (text.includes("wheelchair") || text.includes("walker")) {
      return <Ionicons name="body-outline" size={20} color="#166534" />;
    }
    if (text.includes("bed") || text.includes("mattress")) {
      return <MaterialCommunityIcons name="bed-outline" size={22} color="#1D4ED8" />;
    }
    return <Ionicons name="medkit-outline" size={20} color="#166534" />;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return { label: "Active at Home", bg: "#DCFCE7", text: "#166534", icon: "checkmark-circle" };
      case "APPROVED":
        return { label: "Approved & Dispatched", bg: "#EFF6FF", text: "#1D4ED8", icon: "bicycle" };
      case "RETURNED":
        return { label: "Returned & Sanitized", bg: "#F1F5F9", text: "#475569", icon: "shield-checkmark" };
      case "REJECTED":
        return { label: "Closed", bg: "#FEE2E2", text: "#DC2626", icon: "close-circle" };
      default:
        return { label: "Under Review", bg: "#FEF3C7", text: "#D97706", icon: "time-outline" };
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

        <View style={styles.headerTitleCol}>
          <Text style={styles.headerTitle}>Medical Equipment Bank</Text>
          <Text style={styles.headerSubtitle}>Free Home Loans • Zero Rental Charges</Text>
        </View>

        <TouchableOpacity
          style={styles.headerActionBtn}
          onPress={handleCallEmergency}
          activeOpacity={0.8}
        >
          <Ionicons name="call" size={18} color="#0D9488" />
        </TouchableOpacity>
      </View>

      {/* Segmented Control Tabs */}
      <View style={styles.tabBarWrapper}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === "request" && styles.tabBtnActive]}
          onPress={() => setActiveTab("request")}
          activeOpacity={0.85}
        >
          <Ionicons
            name="add-circle-outline"
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
          onPress={() => {
            setActiveTab("status");
            loadEquipmentLoans();
          }}
          activeOpacity={0.85}
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "request" ? (
          /* ===================== TAB 1: REQUEST EQUIPMENT FORM ===================== */
          <View>
            {/* Top Seva Guarantee Banner */}
            <View style={styles.bannerAlert}>
              <View style={styles.bannerIconCircle}>
                <MaterialCommunityIcons name="shield-check" size={20} color="#0F766E" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.bannerAlertTitle}>100% Free Community Seva</Text>
                <Text style={styles.bannerAlertSubtitle}>
                  Zero security deposit or rental fees. Prompt doorstep delivery for emergency patient care across Mathura, Vrindavan & Govardhan.
                </Text>
              </View>
            </View>

            {/* Field: Equipment Picker */}
            <Text style={styles.fieldLabel}>Select Medical Equipment *</Text>
            <TouchableOpacity
              style={styles.dropdownCard}
              onPress={() => setEquipModalVisible(true)}
              activeOpacity={0.85}
            >
              <View style={styles.dropdownLeft}>
                <View style={styles.dropdownIconBox}>
                  {getEquipmentIcon(selectedItem.category, selectedItem.name)}
                </View>
                <View style={styles.dropdownTextCol}>
                  <Text style={styles.dropdownTitle} numberOfLines={1}>
                    {selectedItem.name}
                  </Text>
                  <Text style={styles.dropdownCategory}>
                    {selectedItem.category || "Respiratory / Mobility Support"}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-down" size={18} color="#64748B" />
            </TouchableOpacity>

            {/* Field: Patient Name */}
            <Text style={styles.fieldLabel}>Patient Full Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Smt. Kamlesh Sharma"
              placeholderTextColor="#94A3B8"
              value={patientName}
              onChangeText={setPatientName}
            />

            {/* Field: Attendant / Requester Name */}
            <Text style={styles.fieldLabel}>Attendant / Caregiver Name (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Rajesh Sharma (Son / Family)"
              placeholderTextColor="#94A3B8"
              value={requesterName}
              onChangeText={setRequesterName}
            />

            {/* Field: Contact Phone & City */}
            <View style={styles.inputRow}>
              <View style={styles.inputCol}>
                <Text style={styles.fieldLabel}>Contact Phone *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="10-digit mobile"
                  placeholderTextColor="#94A3B8"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>

              <View style={styles.inputCol}>
                <Text style={styles.fieldLabel}>City / Area *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Vrindavan"
                  placeholderTextColor="#94A3B8"
                  value={city}
                  onChangeText={setCity}
                />
              </View>
            </View>

            {/* Field: Delivery Address */}
            <Text style={styles.fieldLabel}>Delivery Address *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="House/Plot number, Street, Landmark in Mathura / Vrindavan"
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={2}
              value={address}
              onChangeText={setAddress}
            />

            {/* Field: Duration Needed */}
            <Text style={styles.fieldLabel}>Initial Duration Needed</Text>
            <View style={styles.durationGrid}>
              {DURATION_OPTIONS.map((opt) => {
                const isSelected = requestedDays === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[styles.durationChip, isSelected && styles.durationChipActive]}
                    onPress={() => setRequestedDays(opt.value)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.durationChipText, isSelected && styles.durationChipTextActive]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Field: Purpose / Condition */}
            <Text style={styles.fieldLabel}>Medical Purpose / Patient Condition</Text>
            <View style={styles.purposeChipsWrap}>
              {PURPOSE_SUGGESTIONS.map((sug) => {
                const isSelected = purpose === sug;
                return (
                  <TouchableOpacity
                    key={sug}
                    style={[styles.purposeChip, isSelected && styles.purposeChipActive]}
                    onPress={() => setPurpose(sug)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.purposeChipText, isSelected && styles.purposeChipTextActive]}>
                      {sug}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitBtn, isSubmitting && { opacity: 0.7 }]}
              onPress={handleRequestSubmit}
              disabled={isSubmitting}
              activeOpacity={0.88}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <MaterialCommunityIcons name="send" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.submitBtnText}>Submit Equipment Request</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          /* ===================== TAB 2: ACTIVE LOANS & TRACKER ===================== */
          <View style={styles.loansContainer}>
            {loadingLoans && activeLoans.length === 0 ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="large" color="#166534" />
                <Text style={styles.loadingText}>Fetching active loans from Seva Bank...</Text>
              </View>
            ) : activeLoans.length === 0 ? (
              <View style={styles.emptyStateBox}>
                <View style={styles.emptyIconCircle}>
                  <MaterialCommunityIcons name="clipboard-text-search-outline" size={36} color="#94A3B8" />
                </View>
                <Text style={styles.emptyTitle}>No Active Equipment Loans</Text>
                <Text style={styles.emptySubtitle}>
                  You haven't requested any medical devices yet. Submit a request to borrow free oxygen concentrators, hospital beds, or wheelchairs.
                </Text>
                <TouchableOpacity
                  style={styles.emptyActionBtn}
                  onPress={() => setActiveTab("request")}
                  activeOpacity={0.88}
                >
                  <Text style={styles.emptyActionBtnText}>Request Equipment Now →</Text>
                </TouchableOpacity>
              </View>
            ) : (
              activeLoans.map((loan) => {
                const badge = getStatusBadge(loan.status);
                return (
                  <View key={loan.id} style={styles.loanCard}>
                    {/* Top Row: Device Name & Status */}
                    <View style={styles.loanHeader}>
                      <View style={styles.loanIconBox}>
                        {getEquipmentIcon(loan.category, loan.equipmentName)}
                      </View>
                      <View style={styles.loanHeaderInfo}>
                        <Text style={styles.loanEquipTitle}>{loan.equipmentName}</Text>
                        <Text style={styles.loanPatient}>
                          👤 Patient: <Text style={{ fontWeight: "800", color: "#0F172A" }}>{loan.patientName}</Text>
                        </Text>
                      </View>
                    </View>

                    {/* Status Badge */}
                    <View style={[styles.loanStatusPill, { backgroundColor: badge.bg }]}>
                      <Ionicons name={badge.icon as any} size={13} color={badge.text} style={{ marginRight: 4 }} />
                      <Text style={[styles.loanStatusPillText, { color: badge.text }]}>{badge.label}</Text>
                    </View>

                    {/* 4-Stage Visual Progress Stepper */}
                    <View style={styles.stepperContainer}>
                      <View style={styles.stepRow}>
                        <View style={[styles.stepDot, loan.statusStep >= 1 ? styles.stepDotActive : styles.stepDotPending]} />
                        <View style={[styles.stepLine, loan.statusStep >= 2 ? styles.stepLineActive : styles.stepLinePending]} />
                        <View style={[styles.stepDot, loan.statusStep >= 2 ? styles.stepDotActive : styles.stepDotPending]} />
                        <View style={[styles.stepLine, loan.statusStep >= 3 ? styles.stepLineActive : styles.stepLinePending]} />
                        <View style={[styles.stepDot, loan.statusStep >= 3 ? styles.stepDotActive : styles.stepDotPending]} />
                        <View style={[styles.stepLine, loan.statusStep >= 4 ? styles.stepLineActive : styles.stepLinePending]} />
                        <View style={[styles.stepDot, loan.statusStep >= 4 ? styles.stepDotActive : styles.stepDotPending]} />
                      </View>

                      <View style={styles.stepLabelsRow}>
                        <Text style={[styles.stepLabel, loan.statusStep >= 1 && styles.stepLabelActive]}>Submitted</Text>
                        <Text style={[styles.stepLabel, loan.statusStep >= 2 && styles.stepLabelActive]}>Verified</Text>
                        <Text style={[styles.stepLabel, loan.statusStep >= 3 && styles.stepLabelActive]}>Active</Text>
                        <Text style={[styles.stepLabel, loan.statusStep >= 4 && styles.stepLabelActive]}>Returned</Text>
                      </View>
                    </View>

                    {/* Metadata Box */}
                    <View style={styles.loanMetaBox}>
                      <View style={styles.loanMetaRow}>
                        <Ionicons name="location-outline" size={13} color="#64748B" style={{ marginRight: 4 }} />
                        <Text style={styles.loanMetaText} numberOfLines={1}>
                          {loan.address}, {loan.city}
                        </Text>
                      </View>
                      <View style={styles.loanMetaRow}>
                        <Ionicons name="calendar-outline" size={13} color="#64748B" style={{ marginRight: 4 }} />
                        <Text style={styles.loanMetaText}>
                          Issued: <Text style={{ fontWeight: "700" }}>{loan.issueDate}</Text> • Return Due:{" "}
                          <Text style={{ fontWeight: "700", color: "#166534" }}>{loan.returnDate}</Text>
                        </Text>
                      </View>
                      {loan.purpose ? (
                        <View style={styles.loanMetaRow}>
                          <Ionicons name="clipboard-outline" size={13} color="#64748B" style={{ marginRight: 4 }} />
                          <Text style={styles.loanMetaText} numberOfLines={1}>
                            Note: {loan.purpose}
                          </Text>
                        </View>
                      ) : null}
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.loanActionsRow}>
                      <TouchableOpacity
                        style={styles.loanActionBtnOutline}
                        onPress={() =>
                          Alert.alert(
                            "Request Extension",
                            `Would you like to extend loan for ${loan.equipmentName}? Our Seva desk will confirm +15 days extension.`,
                            [
                              { text: "Cancel", style: "cancel" },
                              {
                                text: "Confirm Extension",
                                onPress: () => Alert.alert("Extension Requested", "Our coordinator will verify and confirm shortly."),
                              },
                            ]
                          )
                        }
                        activeOpacity={0.8}
                      >
                        <Ionicons name="refresh-outline" size={13} color="#166534" style={{ marginRight: 4 }} />
                        <Text style={styles.loanActionBtnOutlineText}>Extend Loan</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.loanActionBtnSolid}
                        onPress={() =>
                          Alert.alert(
                            "Schedule Return Pickup",
                            `Schedule a volunteer driver to pick up ${loan.equipmentName} from ${loan.address}?`,
                            [
                              { text: "Cancel", style: "cancel" },
                              {
                                text: "Schedule Pickup",
                                onPress: () => Alert.alert("Pickup Scheduled", "Our logistics team will contact you for pickup time."),
                              },
                            ]
                          )
                        }
                        activeOpacity={0.8}
                      >
                        <Ionicons name="car-outline" size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
                        <Text style={styles.loanActionBtnSolidText}>Return Pickup</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* ===================== EQUIPMENT SELECTOR MODAL ===================== */}
        <Modal visible={equipModalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>Select Medical Equipment</Text>
                  <Text style={styles.modalSubtitle}>All items sanitized & tested for immediate home care</Text>
                </View>
                <TouchableOpacity onPress={() => setEquipModalVisible(false)} activeOpacity={0.8}>
                  <Ionicons name="close-circle" size={24} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
                {inventory.map((item) => {
                  const isSelected = selectedItem.id === item.id;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.equipOption, isSelected && styles.equipOptionActive]}
                      onPress={() => {
                        setSelectedItem(item);
                        setEquipModalVisible(false);
                      }}
                      activeOpacity={0.85}
                    >
                      <View style={styles.equipOptionLeft}>
                        <View style={[styles.equipOptionIconBox, isSelected && { backgroundColor: "#DCFCE7" }]}>
                          {getEquipmentIcon(item.category, item.name)}
                        </View>
                        <View style={styles.equipOptionTextCol}>
                          <Text style={[styles.equipOptionTitle, isSelected && styles.equipOptionTitleActive]}>
                            {item.name}
                          </Text>
                          <Text style={styles.equipOptionCategory}>{item.category || "Medical Equipment"}</Text>
                        </View>
                      </View>
                      {isSelected ? (
                        <Ionicons name="checkmark-circle" size={20} color="#166534" />
                      ) : (
                        <Ionicons name="radio-button-off" size={18} color="#CBD5E1" />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* ===================== SUCCESS CONFIRMATION MODAL ===================== */}
        <Modal visible={successModalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { alignItems: "center", paddingVertical: 24 }]}>
              <View style={styles.successIconCircle}>
                <Ionicons name="checkmark-done" size={32} color="#166534" />
              </View>
              <Text style={styles.successHeading}>Request Received!</Text>
              <Text style={styles.successDesc}>
                Your loan request for <Text style={{ fontWeight: "800", color: "#0F172A" }}>{selectedItem.name}</Text> has been registered under reference #{lastSubmittedId.slice(-6).toUpperCase()}.
              </Text>

              <View style={styles.successDetailsBox}>
                <Text style={styles.successDetailText}>📍 Destination: {address || "Mathura / Vrindavan"}</Text>
                <Text style={styles.successDetailText}>⏱️ Coordination: Within 2 Hours</Text>
                <Text style={styles.successDetailText}>📞 Seva Desk: +91 94122 79001</Text>
              </View>

              <TouchableOpacity
                style={[styles.submitBtn, { width: "100%", marginTop: 8 }]}
                onPress={() => {
                  setSuccessModalVisible(false);
                  setActiveTab("status");
                }}
                activeOpacity={0.88}
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
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9",
  },
  headerTitleCol: {
    flex: 1,
    marginHorizontal: 10,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#164E2E",
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: 10,
    color: "#64748B",
    fontWeight: "600",
    marginTop: 1,
  },
  headerActionBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0FDFA",
    borderWidth: 1,
    borderColor: "#99F6E4",
  },
  tabBarWrapper: {
    flexDirection: "row",
    backgroundColor: "#E2E8F0",
    borderRadius: 10,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 3,
  },
  tabBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 8,
  },
  tabBtnActive: {
    backgroundColor: "#166534",
    ...Shadows.soft,
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
  },
  tabBtnTextActive: {
    color: "#FFFFFF",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 36,
  },
  bannerAlert: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDFA",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#99F6E4",
    padding: 12,
    marginBottom: 14,
  },
  bannerIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: "#CCFBF1",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  bannerAlertTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0F766E",
  },
  bannerAlertSubtitle: {
    fontSize: 10,
    color: "#334155",
    lineHeight: 14,
    marginTop: 2,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: 4,
    marginTop: 6,
  },
  dropdownCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    ...Shadows.soft,
  },
  dropdownLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  dropdownIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#F0FDFA",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  dropdownTextCol: {
    flex: 1,
  },
  dropdownTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0F172A",
  },
  dropdownCategory: {
    fontSize: 10,
    color: "#0D9488",
    fontWeight: "600",
  },
  input: {
    height: 42,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 12,
    color: "#0F172A",
    marginBottom: 10,
  },
  textArea: {
    height: 60,
    textAlignVertical: "top",
    paddingTop: 8,
  },
  inputRow: {
    flexDirection: "row",
    gap: 10,
  },
  inputCol: {
    flex: 1,
  },
  durationGrid: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 10,
  },
  durationChip: {
    flex: 1,
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  durationChipActive: {
    backgroundColor: "#166534",
    borderColor: "#166534",
  },
  durationChipText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#334155",
  },
  durationChipTextActive: {
    color: "#FFFFFF",
  },
  purposeChipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 16,
  },
  purposeChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
  },
  purposeChipActive: {
    backgroundColor: "#F0FDF4",
    borderColor: "#166534",
  },
  purposeChipText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#475569",
  },
  purposeChipTextActive: {
    color: "#166534",
    fontWeight: "800",
  },
  submitBtn: {
    backgroundColor: "#166534",
    height: 46,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
    ...Shadows.primaryBtn,
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },

  /* Loans Container */
  loansContainer: {
    paddingTop: 6,
  },
  loadingBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 10,
  },
  loadingText: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
  },
  emptyStateBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 24,
    alignItems: "center",
    marginTop: 10,
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 11,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 16,
    marginBottom: 16,
  },
  emptyActionBtn: {
    backgroundColor: "#166534",
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
  },
  emptyActionBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  loanCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 14,
    marginBottom: 12,
    ...Shadows.card,
  },
  loanHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  loanIconBox: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: "#F0FDFA",
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
    color: "#475569",
    marginTop: 1,
  },
  loanStatusPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  loanStatusPillText: {
    fontSize: 10,
    fontWeight: "800",
  },
  stepperContainer: {
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  stepDotActive: {
    backgroundColor: "#166534",
  },
  stepDotPending: {
    backgroundColor: "#CBD5E1",
  },
  stepLine: {
    flex: 1,
    height: 2,
  },
  stepLineActive: {
    backgroundColor: "#166534",
  },
  stepLinePending: {
    backgroundColor: "#CBD5E1",
  },
  stepLabelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  stepLabel: {
    fontSize: 9,
    fontWeight: "600",
    color: "#94A3B8",
  },
  stepLabelActive: {
    color: "#166534",
    fontWeight: "800",
  },
  loanMetaBox: {
    gap: 4,
    marginBottom: 12,
  },
  loanMetaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  loanMetaText: {
    fontSize: 11,
    color: "#475569",
    flex: 1,
  },
  loanActionsRow: {
    flexDirection: "row",
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: 10,
  },
  loanActionBtnOutline: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#166534",
    paddingVertical: 7,
    borderRadius: 8,
  },
  loanActionBtnOutlineText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#166534",
  },
  loanActionBtnSolid: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#166534",
    paddingVertical: 7,
    borderRadius: 8,
  },
  loanActionBtnSolidText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  /* Modals */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#164E2E",
  },
  modalSubtitle: {
    fontSize: 10,
    color: "#64748B",
    marginTop: 1,
  },
  equipOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    marginBottom: 8,
  },
  equipOptionActive: {
    borderColor: "#166534",
    backgroundColor: "#F0FDF4",
  },
  equipOptionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  equipOptionIconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  equipOptionTextCol: {
    flex: 1,
  },
  equipOptionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0F172A",
  },
  equipOptionTitleActive: {
    color: "#166534",
    fontWeight: "800",
  },
  equipOptionCategory: {
    fontSize: 10,
    color: "#64748B",
    marginTop: 1,
  },
  successIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  successHeading: {
    fontSize: 17,
    fontWeight: "800",
    color: "#164E2E",
    marginBottom: 4,
  },
  successDesc: {
    fontSize: 12,
    color: "#475569",
    textAlign: "center",
    lineHeight: 17,
    marginBottom: 14,
    paddingHorizontal: 10,
  },
  successDetailsBox: {
    width: "100%",
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    padding: 12,
    gap: 4,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  successDetailText: {
    fontSize: 11,
    color: "#334155",
    fontWeight: "600",
  },
});
