import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors, Shadows } from "../lib/theme";
import ActionDialog from "../components/ActionDialog";

interface DonationRecord {
  id: string;
  title: string;
  amount: number;
  dateTime: string;
  status: "Success" | "Pending";
  category: "education" | "blood" | "plantation" | "jeev";
  type: "one-time" | "monthly" | "yearly";
  icon: string;
  iconColor: string;
  iconBg: string;
  iconBorder: string;
}

const DONATIONS_LIST: DonationRecord[] = [
  {
    id: "don-1",
    title: "Free Education",
    amount: 1000,
    dateTime: "24 May 2024, 10:30 AM",
    status: "Success",
    category: "education",
    type: "one-time",
    icon: "book-outline",
    iconColor: "#16A34A",
    iconBg: "#F0FDF4",
    iconBorder: "#BBF7D0",
  },
  {
    id: "don-2",
    title: "Blood Donation Camp",
    amount: 500,
    dateTime: "02 May 2024, 11:30 AM",
    status: "Success",
    category: "blood",
    type: "one-time",
    icon: "water-outline",
    iconColor: "#DC2626",
    iconBg: "#FEF2F2",
    iconBorder: "#FECACA",
  },
  {
    id: "don-3",
    title: "Plantation Drive",
    amount: 1000,
    dateTime: "16 Apr 2024, 09:15 AM",
    status: "Success",
    category: "plantation",
    type: "monthly",
    icon: "leaf-outline",
    iconColor: "#15803D",
    iconBg: "#F0FDF4",
    iconBorder: "#BBF7D0",
  },
  {
    id: "don-4",
    title: "Jeev Jal Seva",
    amount: 750,
    dateTime: "05 Apr 2024, 04:45 PM",
    status: "Success",
    category: "jeev",
    type: "one-time",
    icon: "water-outline",
    iconColor: "#2563EB",
    iconBg: "#EFF6FF",
    iconBorder: "#BFDBFE",
  },
];

export default function MyDonationsScreen() {
  const router = useRouter();
  const [filterType, setFilterType] = useState<"all" | "one-time" | "monthly" | "yearly">("all");
  const [statementModalVisible, setStatementModalVisible] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const filteredList = DONATIONS_LIST.filter(
    (d) => filterType === "all" || d.type === filterType
  );

  const handleDownloadPdf = () => {
    setIsDownloading(true);
    setTimeout(() => {
      setIsDownloading(false);
      setStatementModalVisible(false);
    }, 1200);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)/donate"))}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={22} color="#164E2E" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>My Donations</Text>

        <View style={{ width: 42 }} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Frequency Filter Tabs */}
        <View style={styles.tabsRow}>
          {(["all", "one-time", "monthly", "yearly"] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabBtn, filterType === tab && styles.tabBtnActive]}
              onPress={() => setFilterType(tab)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, filterType === tab && styles.tabTextActive]}>
                {tab === "all" ? "All" : tab === "one-time" ? "One-Time" : tab === "monthly" ? "Monthly" : "Yearly"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Donations List */}
        <View style={styles.listContainer}>
          {filteredList.map((item) => (
            <View key={item.id} style={styles.donationCard}>
              <View style={styles.cardLeft}>
                <View
                  style={[
                    styles.iconBox,
                    { backgroundColor: item.iconBg, borderColor: item.iconBorder },
                  ]}
                >
                  <Ionicons name={item.icon as any} size={20} color={item.iconColor} />
                </View>

                <View style={styles.cardTextInfo}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardDateTime}>{item.dateTime}</Text>
                </View>
              </View>

              <View style={styles.cardRight}>
                <Text style={styles.cardAmount}>₹{item.amount.toLocaleString()}</Text>
                <Text style={styles.cardStatusText}>{item.status}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Download Statement Button */}
        <TouchableOpacity
          style={styles.downloadBtn}
          onPress={() => setStatementModalVisible(true)}
          activeOpacity={0.85}
        >
          <Ionicons name="document-text-outline" size={16} color="#166534" style={{ marginRight: 6 }} />
          <Text style={styles.downloadBtnText}>80G Tax Statement</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* 80G Tax Statement ActionDialog */}
      <ActionDialog
        visible={statementModalVisible}
        onClose={() => setStatementModalVisible(false)}
        onConfirm={handleDownloadPdf}
        title="80G Tax Exemption Certificate"
        badge="ANNUAL SEVA STATEMENT"
        description="All contributions made to Prayas Sanstha Vrindavan are 100% tax-exempted under Section 80G of the Income Tax Act."
        icon="document-text-outline"
        type="success"
        confirmText="Download PDF"
        cancelText="Close"
        showCancel={true}
        loading={isDownloading}
      >
        <View style={styles.statementBox}>
          <View style={styles.statementRow}>
            <Text style={styles.statementLabel}>Financial Year:</Text>
            <Text style={styles.statementVal}>FY 2024-25</Text>
          </View>
          <View style={styles.statementRow}>
            <Text style={styles.statementLabel}>Total Contributions:</Text>
            <Text style={styles.statementValHighlight}>₹1,500.00</Text>
          </View>
          <View style={[styles.statementRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.statementLabel}>Certificate Status:</Text>
            <Text style={[styles.statementVal, { color: "#16A34A" }]}>✓ 80G Verified & Valid</Text>
          </View>
        </View>
      </ActionDialog>
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
    fontSize: 19,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.4,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 34,
  },
  tabsRow: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    padding: 3,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 10,
  },
  tabBtnActive: {
    backgroundColor: "#166534",
    ...Shadows.soft,
  },
  tabText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
  },
  tabTextActive: {
    color: "#FFFFFF",
  },
  listContainer: {
    gap: 10,
    marginBottom: 20,
  },
  donationCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 14,
    ...Shadows.soft,
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  cardTextInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
  },
  cardDateTime: {
    fontSize: 10,
    color: "#94A3B8",
    marginTop: 2,
  },
  cardRight: {
    alignItems: "flex-end",
  },
  cardAmount: {
    fontSize: 14,
    fontWeight: "900",
    color: "#0F172A",
  },
  cardStatusText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#16A34A",
    marginTop: 2,
  },
  downloadBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#166534",
    backgroundColor: "#FFFFFF",
    marginTop: 10,
  },
  downloadBtnText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#166534",
  },
  statementBox: {
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    borderRadius: 14,
    padding: 12,
  },
  statementRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: "#DCFCE7",
  },
  statementLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
  },
  statementVal: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0F172A",
  },
  statementValHighlight: {
    fontSize: 14,
    fontWeight: "900",
    color: "#166534",
  },
});
