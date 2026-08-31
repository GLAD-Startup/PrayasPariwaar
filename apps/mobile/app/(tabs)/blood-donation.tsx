import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { api } from "../../lib/api";
import {
  BloodRequestSchema,
  BloodGroupValues,
  BloodGroupDisplayMap,
  UrgencyLevelValues,
} from "@prayas/utils";

export default function MobileBloodDonationScreen() {
  const [activeTab, setActiveTab] = useState<"REQUEST" | "FEED">("REQUEST");
  const [patientName, setPatientName] = useState("");
  const [hospitalName, setHospitalName] = useState("");
  const [city, setCity] = useState("Jaipur");
  const [bloodGroup, setBloodGroup] = useState("O_POSITIVE");
  const [unitsNeeded, setUnitsNeeded] = useState("1");
  const [urgency, setUrgency] = useState("HIGH");
  const [contactPhone, setContactPhone] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [successInfo, setSuccessInfo] = useState<any>(null);
  const [formError, setFormError] = useState("");
  const [requestsList, setRequestsList] = useState<any[]>([]);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    const res = await api.get("/blood-requests");
    if (res.data?.success) {
      setRequestsList(res.data.data);
    }
  };

  const handleFormSubmit = async () => {
    setFormError("");
    setSuccessInfo(null);

    // Validate using shared Zod schema from @prayas/utils
    const payload = {
      patientName: patientName.trim(),
      hospitalName: hospitalName.trim(),
      city: city.trim(),
      bloodGroup,
      unitsNeeded: Number(unitsNeeded) || 1,
      urgency,
      contactPhone: contactPhone.trim(),
      notes: notes.trim() || undefined,
    };

    const validationResult = BloodRequestSchema.safeParse(payload);
    if (!validationResult.success) {
      const firstError = Object.values(
        validationResult.error.flatten().fieldErrors
      )[0]?.[0];
      setFormError(firstError || "Validation error. Please verify form details.");
      return;
    }

    setLoading(true);

    // POST to Next.js API route (/api/blood-requests)
    // Server inserts to Prisma and fires Expo Push notifications!
    const response = await api.post("/blood-requests", payload);
    setLoading(false);

    if (response.error) {
      setFormError(response.error);
      return;
    }

    if (response.data?.success) {
      setSuccessInfo(response.data);
      // Clear form
      setPatientName("");
      setHospitalName("");
      setContactPhone("");
      setNotes("");
      fetchRequests();
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>Emergency Blood Desk</Text>
        <Text style={styles.topBarSubtitle}>24/7 Rapid Donor Matching</Text>
      </View>

      {/* Tabs Switcher */}
      <View style={styles.tabSelector}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === "REQUEST" && styles.tabBtnActive]}
          onPress={() => setActiveTab("REQUEST")}
        >
          <Text style={[styles.tabBtnText, activeTab === "REQUEST" && styles.tabBtnTextActive]}>
            Post Emergency Request
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === "FEED" && styles.tabBtnActive]}
          onPress={() => {
            setActiveTab("FEED");
            fetchRequests();
          }}
        >
          <Text style={[styles.tabBtnText, activeTab === "FEED" && styles.tabBtnTextActive]}>
            Active Requests ({requestsList.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activeTab === "REQUEST" ? (
          <View style={styles.card}>
            <Text style={styles.formTitle}>Broadcast Blood Requirement</Text>
            <Text style={styles.formSubtitle}>
              Dispatches instant push notifications to matching donors in the area.
            </Text>

            {successInfo ? (
              <View style={styles.successBanner}>
                <Text style={styles.successTitle}>
                  ✅ Blood Request Broadcasted Successfully!
                </Text>
                <Text style={styles.successDesc}>
                  {successInfo.message}
                </Text>
                <View style={styles.pushStats}>
                  <Text style={styles.pushStatsText}>
                    📲 Push Notification: {successInfo.pushNotification?.delivered || 0} active devices notified
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.viewRequestBtn}
                  onPress={() => {
                    setSuccessInfo(null);
                    setActiveTab("FEED");
                  }}
                >
                  <Text style={styles.viewRequestBtnText}>View in Live Feed →</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            {formError ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>⚠️ {formError}</Text>
              </View>
            ) : null}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Patient Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Ramesh Kumar"
                placeholderTextColor="#94A3B8"
                value={patientName}
                onChangeText={setPatientName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Hospital Name & Ward *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. SMS Hospital, ICU Ward 2"
                placeholderTextColor="#94A3B8"
                value={hospitalName}
                onChangeText={setHospitalName}
              />
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>City *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Jaipur"
                  placeholderTextColor="#94A3B8"
                  value={city}
                  onChangeText={setCity}
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Units Needed *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="1"
                  keyboardType="numeric"
                  placeholderTextColor="#94A3B8"
                  value={unitsNeeded}
                  onChangeText={setUnitsNeeded}
                />
              </View>
            </View>

            {/* Blood Group Picker */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Required Blood Group *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.bgScroll}>
                {BloodGroupValues.map((bg) => (
                  <TouchableOpacity
                    key={bg}
                    style={[
                      styles.bgChip,
                      bloodGroup === bg && styles.bgChipSelected,
                    ]}
                    onPress={() => setBloodGroup(bg)}
                  >
                    <Text
                      style={[
                        styles.bgChipText,
                        bloodGroup === bg && styles.bgChipTextSelected,
                      ]}
                    >
                      {BloodGroupDisplayMap[bg]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Urgency Level */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Urgency Level</Text>
              <View style={styles.urgencyRow}>
                {UrgencyLevelValues.map((u) => (
                  <TouchableOpacity
                    key={u}
                    style={[
                      styles.urgencyChip,
                      urgency === u && styles.urgencyChipActive,
                    ]}
                    onPress={() => setUrgency(u)}
                  >
                    <Text
                      style={[
                        styles.urgencyText,
                        urgency === u && styles.urgencyTextActive,
                      ]}
                    >
                      {u}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contact Phone Number *</Text>
              <TextInput
                style={styles.input}
                placeholder="10-digit attendant phone"
                keyboardType="phone-pad"
                placeholderTextColor="#94A3B8"
                value={contactPhone}
                onChangeText={setContactPhone}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Notes / Specific Details</Text>
              <TextInput
                style={[styles.input, { height: 70, textAlignVertical: "top", paddingTop: 8 }]}
                placeholder="e.g. Platelets required, surgery at 10 AM"
                multiline
                numberOfLines={3}
                placeholderTextColor="#94A3B8"
                value={notes}
                onChangeText={setNotes}
              />
            </View>

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleFormSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>
                  🚨 Broadcast Emergency Request
                </Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          /* ACTIVE FEED TAB */
          <View>
            {requestsList.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>No active requests found</Text>
                <Text style={styles.emptySubtitle}>All blood needs are currently fulfilled.</Text>
              </View>
            ) : (
              requestsList.map((item) => {
                const displayGroup = BloodGroupDisplayMap[item.bloodGroup] || item.bloodGroup;
                return (
                  <View key={item.id} style={styles.feedCard}>
                    <View style={styles.feedHeader}>
                      <View style={styles.bloodBadge}>
                        <Text style={styles.bloodBadgeText}>{displayGroup}</Text>
                        <Text style={styles.bloodBadgeUnits}>{item.unitsNeeded} U</Text>
                      </View>
                      <View style={styles.feedMain}>
                        <Text style={styles.patientTitle}>{item.patientName}</Text>
                        <Text style={styles.hospitalText}>
                          🏥 {item.hospitalName}, {item.city}
                        </Text>
                        <Text style={styles.urgencyTag}>
                          ⚡ {item.urgency} Urgency • {item.status}
                        </Text>
                      </View>
                    </View>

                    {item.notes ? (
                      <Text style={styles.notesText}>"{item.notes}"</Text>
                    ) : null}

                    <TouchableOpacity
                      style={styles.callBtn}
                      onPress={() => Linking.openURL(`tel:${item.contactPhone}`)}
                    >
                      <Text style={styles.callBtnText}>
                        📞 Call Attendant: {item.contactPhone}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  topBar: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  topBarTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
  },
  topBarSubtitle: {
    fontSize: 12,
    color: "#DC2626",
    fontWeight: "700",
    marginTop: 2,
  },
  tabSelector: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    padding: 6,
    margin: 16,
    borderRadius: 14,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  tabBtnActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
  },
  tabBtnTextActive: {
    color: "#DC2626",
    fontWeight: "800",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },
  formSubtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputRow: {
    flexDirection: "row",
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 6,
  },
  input: {
    height: 46,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    color: "#0F172A",
  },
  bgScroll: {
    flexDirection: "row",
  },
  bgChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  bgChipSelected: {
    backgroundColor: "#DC2626",
    borderColor: "#DC2626",
  },
  bgChipText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
  },
  bgChipTextSelected: {
    color: "#FFFFFF",
  },
  urgencyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  urgencyChip: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    marginHorizontal: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  urgencyChipActive: {
    backgroundColor: "#FEF2F2",
    borderColor: "#DC2626",
  },
  urgencyText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
  },
  urgencyTextActive: {
    color: "#DC2626",
    fontWeight: "800",
  },
  submitButton: {
    height: 50,
    backgroundColor: "#DC2626",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    shadowColor: "#DC2626",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  successBanner: {
    backgroundColor: "#F0FDF4",
    borderColor: "#86EFAC",
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#166534",
  },
  successDesc: {
    fontSize: 12,
    color: "#15803D",
    marginTop: 4,
  },
  pushStats: {
    backgroundColor: "#FFFFFF",
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  pushStatsText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#166534",
  },
  viewRequestBtn: {
    marginTop: 10,
    alignSelf: "flex-start",
  },
  viewRequestBtnText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#166534",
  },
  errorBanner: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  errorText: {
    color: "#B91C1C",
    fontSize: 12,
  },
  feedCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  feedHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  bloodBadge: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  bloodBadgeText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#DC2626",
  },
  bloodBadgeUnits: {
    fontSize: 10,
    fontWeight: "700",
    color: "#EF4444",
  },
  feedMain: {
    flex: 1,
  },
  patientTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
  },
  hospitalText: {
    fontSize: 12,
    color: "#475569",
    marginTop: 2,
  },
  urgencyTag: {
    fontSize: 11,
    fontWeight: "700",
    color: "#DC2626",
    marginTop: 3,
  },
  notesText: {
    fontSize: 12,
    color: "#64748B",
    fontStyle: "italic",
    backgroundColor: "#F8FAFC",
    padding: 8,
    borderRadius: 8,
    marginTop: 10,
  },
  callBtn: {
    backgroundColor: "#DC2626",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 12,
  },
  callBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  emptyCard: {
    padding: 40,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#64748B",
  },
  emptySubtitle: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 4,
  },
});
