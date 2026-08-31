import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  Alert,
} from "react-native";
import { api } from "../../lib/api";

const EQUIPMENT_CATALOG = [
  {
    id: "eq-ox-10l",
    name: "10L Medical Oxygen Concentrator",
    category: "Respiratory",
    desc: "Dual-flow 10 LPM high purity continuous oxygen machine.",
    status: "AVAILABLE",
  },
  {
    id: "eq-bipap-auto",
    name: "BiPAP / Auto-CPAP Machine",
    category: "Critical Care",
    desc: "Non-invasive mechanical ventilation with heated humidifier.",
    status: "AVAILABLE",
  },
  {
    id: "eq-hospital-bed",
    name: "Adjustable Hospital Bed",
    category: "Patient Care",
    desc: "Ergonomic backrest elevation bed with safety side-rails.",
    status: "AVAILABLE",
  },
  {
    id: "eq-wheelchair-fold",
    name: "Foldable Wheelchair",
    category: "Mobility Aid",
    desc: "Lightweight steel folding wheelchair for home rehabilitation.",
    status: "AVAILABLE",
  },
];

export default function MobileEquipmentScreen() {
  const [selectedEquip, setSelectedEquip] = useState<any>(null);
  const [requesterName, setRequesterName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [purpose, setPurpose] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmitRequest = async () => {
    if (!requesterName || !contactPhone || !purpose || !deliveryAddress) {
      Alert.alert("Missing Fields", "Please complete all application details.");
      return;
    }

    setLoading(true);
    const res = await api.post("/equipment", {
      equipmentId: selectedEquip.id,
      requesterName,
      contactPhone,
      purpose,
      requestedDays: 14,
      deliveryAddress,
    });
    setLoading(false);

    if (res.data?.success) {
      Alert.alert(
        "Application Submitted",
        "Your free equipment loan request has been received. Our team will contact you shortly."
      );
      setSelectedEquip(null);
      setRequesterName("");
      setContactPhone("");
      setPurpose("");
      setDeliveryAddress("");
    } else {
      Alert.alert("Error", res.error || "Failed to submit request.");
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Free Medical Equipment Bank</Text>
        <Text style={styles.subtitle}>
          Zero-rental oxygen concentrators, hospital beds, and mobility aids.
        </Text>
      </View>

      <View style={styles.banner}>
        <Text style={styles.bannerTag}>🆓 100% FREE COMMUNITY LOAN</Text>
        <Text style={styles.bannerText}>
          Life-support medical devices provided at zero rental cost for indigent and recovering patients.
        </Text>
      </View>

      <Text style={styles.sectionHeader}>Available Devices</Text>

      {EQUIPMENT_CATALOG.map((item) => (
        <View key={item.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.categoryBadge}>{item.category}</Text>
            <Text style={styles.statusBadge}>{item.status}</Text>
          </View>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemDesc}>{item.desc}</Text>

          <TouchableOpacity
            style={styles.loanBtn}
            onPress={() => setSelectedEquip(item)}
          >
            <Text style={styles.loanBtnText}>Request Free Loan →</Text>
          </TouchableOpacity>
        </View>
      ))}

      {/* Modal */}
      <Modal visible={!!selectedEquip} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Request {selectedEquip?.name}</Text>
            <Text style={styles.modalSub}>Free 14-Day Lease</Text>

            <TextInput
              style={styles.input}
              placeholder="Attendant / Patient Name *"
              placeholderTextColor="#94A3B8"
              value={requesterName}
              onChangeText={setRequesterName}
            />

            <TextInput
              style={styles.input}
              placeholder="10-digit Phone Number *"
              placeholderTextColor="#94A3B8"
              keyboardType="phone-pad"
              value={contactPhone}
              onChangeText={setContactPhone}
            />

            <TextInput
              style={styles.input}
              placeholder="Medical Reason / Condition *"
              placeholderTextColor="#94A3B8"
              value={purpose}
              onChangeText={setPurpose}
            />

            <TextInput
              style={styles.input}
              placeholder="Delivery / Pickup Address *"
              placeholderTextColor="#94A3B8"
              value={deliveryAddress}
              onChangeText={setDeliveryAddress}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setSelectedEquip(null)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={handleSubmitRequest}
                disabled={loading}
              >
                <Text style={styles.confirmBtnText}>
                  {loading ? "Submitting..." : "Submit"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    padding: 20,
    paddingTop: 50,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
  },
  subtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
  },
  banner: {
    backgroundColor: "#065F46",
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  bannerTag: {
    color: "#A7F3D0",
    fontSize: 11,
    fontWeight: "800",
    marginBottom: 4,
  },
  bannerText: {
    color: "#FFFFFF",
    fontSize: 12,
    lineHeight: 18,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  categoryBadge: {
    fontSize: 11,
    fontWeight: "700",
    color: "#059669",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusBadge: {
    fontSize: 10,
    fontWeight: "800",
    color: "#065F46",
  },
  itemName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },
  itemDesc: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
    marginBottom: 12,
  },
  loanBtn: {
    backgroundColor: "#059669",
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
  },
  loanBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },
  modalSub: {
    fontSize: 12,
    color: "#059669",
    fontWeight: "700",
    marginBottom: 14,
  },
  input: {
    height: 44,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 13,
    marginBottom: 10,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    marginRight: 8,
    backgroundColor: "#F1F5F9",
    borderRadius: 10,
  },
  cancelBtnText: {
    color: "#64748B",
    fontWeight: "700",
    fontSize: 13,
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    marginLeft: 8,
    backgroundColor: "#059669",
    borderRadius: 10,
  },
  confirmBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },
});
