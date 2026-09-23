import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors, Shadows } from "../lib/theme";
import { api } from "../lib/api";
import { getAuthUser } from "../lib/secureStore";
import ActionDialog from "../components/ActionDialog";

interface DonationRecord {
  id: string;
  title: string;
  amount: number;
  dateTime: string;
  status: "Verified";
  category: "education" | "blood" | "plantation" | "jeev" | "general";
  type: "one-time" | "monthly" | "yearly";
  receiptNumber?: string | null;
  paymentMethod?: string | null;
  donorName?: string;
  donorPhone?: string | null;
  icon: string;
  iconColor: string;
  iconBg: string;
  iconBorder: string;
}

const FALLBACK_DONATIONS: DonationRecord[] = [];

function getCategoryConfig(cause: string = ""): {
  category: "education" | "blood" | "plantation" | "jeev" | "general";
  icon: string;
  iconColor: string;
  iconBg: string;
  iconBorder: string;
} {
  const c = cause.toLowerCase();
  if (c.includes("edu") || c.includes("study") || c.includes("child")) {
    return {
      category: "education",
      icon: "school-outline",
      iconColor: "#16A34A",
      iconBg: "#F0FDF4",
      iconBorder: "#BBF7D0",
    };
  }
  if (c.includes("blood") || c.includes("rakta")) {
    return {
      category: "blood",
      icon: "water-outline",
      iconColor: "#DC2626",
      iconBg: "#FEF2F2",
      iconBorder: "#FECACA",
    };
  }
  if (c.includes("tree") || c.includes("plant") || c.includes("harit")) {
    return {
      category: "plantation",
      icon: "leaf-outline",
      iconColor: "#15803D",
      iconBg: "#F0FDF4",
      iconBorder: "#BBF7D0",
    };
  }
  if (c.includes("jeev") || c.includes("jal") || c.includes("bird") || c.includes("cow") || c.includes("animal")) {
    return {
      category: "jeev",
      icon: "water-outline",
      iconColor: "#2563EB",
      iconBg: "#EFF6FF",
      iconBorder: "#BFDBFE",
    };
  }
  return {
    category: "general",
    icon: "heart-outline",
    iconColor: "#7C3AED",
    iconBg: "#FAF5FF",
    iconBorder: "#E9D5FF",
  };
}

export default function MyDonationsScreen() {
  const router = useRouter();
  const [filterType, setFilterType] = useState<"all" | "one-time" | "monthly" | "yearly">("all");
  const [donations, setDonations] = useState<DonationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statementModalVisible, setStatementModalVisible] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<DonationRecord | null>(null);

  // User Mobile Number Tracking
  const [userPhone, setUserPhone] = useState<string>("");
  const [activePhone, setActivePhone] = useState<string>("");
  const [searchPhoneInput, setSearchPhoneInput] = useState<string>("");
  const [isEditingPhone, setIsEditingPhone] = useState<boolean>(false);
  const [activeUserName, setActiveUserName] = useState<string>("");

  const loadDonations = useCallback(async (overridePhone?: string) => {
    try {
      setLoading(true);
      const user = await getAuthUser();
      if (user?.name) setActiveUserName(user.name);

      const profilePhone = user?.phone ? String(user.phone).trim() : "";
      if (profilePhone && !userPhone) {
        setUserPhone(profilePhone);
      }

      // Determine phone to query
      let queryPhone = "";
      if (overridePhone !== undefined) {
        queryPhone = overridePhone.trim();
        setActivePhone(queryPhone);
        setSearchPhoneInput(queryPhone);
      } else if (activePhone) {
        queryPhone = activePhone.trim();
      } else if (profilePhone) {
        queryPhone = profilePhone;
        setActivePhone(profilePhone);
        setSearchPhoneInput(profilePhone);
      }

      const phoneParam = queryPhone ? `&phone=${encodeURIComponent(queryPhone)}` : "";
      // Only fetch SUCCESS status (verified receipts). Abandoned or pending checkout attempts are excluded.
      const res = await api.get(`/donations?status=SUCCESS${phoneParam}`);

      if (res.data?.success && Array.isArray(res.data.data)) {
        // Strict client-side filter: only SUCCESS status is treated as a valid receipt
        const verifiedOnly = res.data.data.filter((d: any) => d.status === "SUCCESS");
        const mapped: DonationRecord[] = verifiedOnly.map((d: any) => {
          const config = getCategoryConfig(d.projectOrCause || d.project?.title || "");
          const freq = (d.frequency || "ONE_TIME").toLowerCase();
          const parsedFreq = freq === "monthly" ? "monthly" : freq === "yearly" ? "yearly" : "one-time";
          const dateStr = d.createdAt
            ? new Date(d.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "Recently";

          return {
            id: d.id,
            title: d.projectOrCause || d.project?.title || "Prayas General Seva",
            amount: Number(d.amount) || 0,
            dateTime: dateStr,
            status: "Verified",
            category: config.category,
            type: parsedFreq,
            receiptNumber: d.receiptNumber || `SDT-${d.id.slice(-6).toUpperCase()}`,
            paymentMethod: d.paymentMethod || "Razorpay / UPI",
            donorName: d.donorName || "Supporter",
            donorPhone: d.donorPhone || "",
            icon: config.icon,
            iconColor: config.iconColor,
            iconBg: config.iconBg,
            iconBorder: config.iconBorder,
          };
        });
        setDonations(mapped);
      } else {
        setDonations([]);
      }
    } catch (e) {
      console.warn("Could not load live donations:", e);
      setDonations([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activePhone, userPhone]);

  useEffect(() => {
    loadDonations();
  }, [loadDonations]);

  const onRefresh = () => {
    setRefreshing(true);
    loadDonations();
  };

  const handleApplyPhoneSearch = () => {
    const trimmed = searchPhoneInput.trim();
    loadDonations(trimmed);
    setIsEditingPhone(false);
  };

  const handleResetToUserProfilePhone = () => {
    setSearchPhoneInput(userPhone);
    loadDonations(userPhone);
    setIsEditingPhone(false);
  };

  const filteredList = donations.filter(
    (d) => filterType === "all" || d.type === filterType
  );

  const totalSuccessfulAmount = donations
    .reduce((sum, d) => sum + d.amount, 0);

  const handleDownloadPdf = () => {
    setIsDownloading(true);
    setTimeout(() => {
      setIsDownloading(false);
      setStatementModalVisible(false);
    }, 1000);
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

        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => setStatementModalVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="receipt-outline" size={20} color="#164E2E" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#166534"]} />
        }
      >
        {/* Total Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryTop}>
            <View>
              <Text style={styles.summaryLabel}>Total Contributions</Text>
              <Text style={styles.summaryAmount}>₹{totalSuccessfulAmount.toLocaleString("en-IN")}</Text>
            </View>
            <View style={styles.taxBadge}>
              <Ionicons name="shield-checkmark" size={14} color="#166534" />
              <Text style={styles.taxBadgeText}>80G Tax Exempt</Text>
            </View>
          </View>
          <Text style={styles.summarySubtext}>
            100% of your contributions go towards on-ground education, health & environmental seva.
          </Text>
        </View>

        {/* Mobile Number Sync & Receipt Check Bar */}
        <View style={styles.phoneSyncCard}>
          <View style={styles.phoneSyncTop}>
            <View style={styles.phoneSyncLeft}>
              <View style={styles.phoneIconCircle}>
                <Ionicons name="phone-portrait" size={18} color="#1E3A8A" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.phoneSyncTitle}>Linked Mobile Receipts</Text>
                <Text style={styles.phoneSyncNumber}>
                  {activePhone ? activePhone : "Matching all registered accounts"}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.changePhoneBtn}
              onPress={() => setIsEditingPhone(!isEditingPhone)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={isEditingPhone ? "close-circle-outline" : "search-outline"}
                size={14}
                color="#1E3A8A"
                style={{ marginRight: 3 }}
              />
              <Text style={styles.changePhoneBtnText}>
                {isEditingPhone ? "Cancel" : "Check Mobile"}
              </Text>
            </TouchableOpacity>
          </View>

          {isEditingPhone && (
            <View style={styles.phoneEditBox}>
              <Text style={styles.phoneEditInstruction}>
                Enter mobile number to view all matching donations made via Mobile App, Razorpay, or Website:
              </Text>
              <View style={styles.phoneInputRow}>
                <TextInput
                  style={styles.phoneSearchInput}
                  value={searchPhoneInput}
                  onChangeText={setSearchPhoneInput}
                  placeholder="Enter 10-digit mobile number"
                  placeholderTextColor="#94A3B8"
                  keyboardType="phone-pad"
                  maxLength={15}
                />
                <TouchableOpacity
                  style={styles.phoneSearchBtn}
                  onPress={handleApplyPhoneSearch}
                  activeOpacity={0.85}
                >
                  <Text style={styles.phoneSearchBtnText}>Find</Text>
                </TouchableOpacity>
              </View>

              {userPhone ? (
                <TouchableOpacity
                  style={styles.phoneResetBtn}
                  onPress={handleResetToUserProfilePhone}
                >
                  <Ionicons name="refresh-outline" size={12} color="#1E3A8A" style={{ marginRight: 4 }} />
                  <Text style={styles.phoneResetBtnText}>
                    Use profile mobile number ({userPhone})
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          )}

          <View style={styles.syncNoticeRow}>
            <Ionicons name="shield-checkmark-outline" size={13} color="#166534" />
            <Text style={styles.phoneSyncNotice}>
              Auto-checking all donations with this mobile number in database.
            </Text>
          </View>
        </View>

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
        {loading ? (
          <View style={{ paddingVertical: 40, alignItems: "center" }}>
            <ActivityIndicator size="large" color="#166534" />
            <Text style={{ marginTop: 10, fontSize: 13, color: "#64748B", fontWeight: "600" }}>
              Loading donations for {activePhone || "your account"}...
            </Text>
          </View>
        ) : filteredList.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="receipt-outline" size={44} color="#94A3B8" />
            <Text style={styles.emptyTitle}>No Verified Receipts Found</Text>
            <Text style={styles.emptySub}>
              {activePhone
                ? `No verified donation receipts found for mobile number ${activePhone}. Check for typos or make a new contribution!`
                : "You haven't made any verified contributions yet. Support a cause today to get your 80G receipt!"}
            </Text>
            <TouchableOpacity
              style={styles.donateNowBtn}
              onPress={() => router.push("/(tabs)/donate" as any)}
              activeOpacity={0.85}
            >
              <Text style={styles.donateNowBtnText}>Make a Contribution</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {filteredList.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.donationCard}
                onPress={() => setSelectedReceipt(item)}
                activeOpacity={0.85}
              >
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
                    <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.cardDateTime}>
                      {item.dateTime} • {item.type.toUpperCase()}
                    </Text>
                    {item.receiptNumber && (
                      <Text style={styles.cardReceiptTag}>
                        Receipt: #{item.receiptNumber}
                      </Text>
                    )}
                    {item.donorPhone ? (
                      <Text style={styles.cardPhoneTag}>
                        📱 Mobile: {item.donorPhone}
                      </Text>
                    ) : null}
                  </View>
                </View>

                <View style={styles.cardRight}>
                  <Text style={styles.cardAmount}>₹{item.amount.toLocaleString("en-IN")}</Text>
                  <View style={[styles.statusBadge, styles.statusSuccess]}>
                    <Text style={[styles.cardStatusText, { color: "#166534" }]}>
                      ✓ Verified
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Download Statement Action */}
        <TouchableOpacity
          style={styles.downloadBtn}
          onPress={() => setStatementModalVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="document-text-outline" size={18} color="#166534" style={{ marginRight: 6 }} />
          <Text style={styles.downloadBtnText}>Annual 80G Statement (PDF)</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Selected Receipt Detail Modal */}
      {selectedReceipt && (
        <ActionDialog
          visible={!!selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
          title="Donation Receipt"
          description="Official tax-exempt contribution receipt from Prayas Samiti."
          type="success"
          icon="receipt-outline"
          badge="80G CERTIFIED"
          showCancel={false}
          confirmText="Done"
          onConfirm={() => setSelectedReceipt(null)}
        >
          <View style={styles.statementBox}>
            <View style={styles.statementRow}>
              <Text style={styles.statementLabel}>Receipt No:</Text>
              <Text style={[styles.statementVal, { fontFamily: "monospace", color: "#166534" }]}>
                {selectedReceipt.receiptNumber || "SDT-2024-884"}
              </Text>
            </View>
            <View style={styles.statementRow}>
              <Text style={styles.statementLabel}>Donor Name:</Text>
              <Text style={styles.statementVal}>{selectedReceipt.donorName || "Supporter"}</Text>
            </View>
            {selectedReceipt.donorPhone ? (
              <View style={styles.statementRow}>
                <Text style={styles.statementLabel}>Donor Mobile:</Text>
                <Text style={[styles.statementVal, { color: "#1E3A8A", fontWeight: "800" }]}>
                  {selectedReceipt.donorPhone}
                </Text>
              </View>
            ) : null}
            <View style={styles.statementRow}>
              <Text style={styles.statementLabel}>Contribution Cause:</Text>
              <Text style={styles.statementVal}>{selectedReceipt.title}</Text>
            </View>
            <View style={styles.statementRow}>
              <Text style={styles.statementLabel}>Amount Paid:</Text>
              <Text style={styles.statementValHighlight}>₹{selectedReceipt.amount.toLocaleString("en-IN")}</Text>
            </View>
            <View style={styles.statementRow}>
              <Text style={styles.statementLabel}>Date & Time:</Text>
              <Text style={styles.statementVal}>{selectedReceipt.dateTime}</Text>
            </View>
            <View style={styles.statementRow}>
              <Text style={styles.statementLabel}>Payment Mode:</Text>
              <Text style={styles.statementVal}>{selectedReceipt.paymentMethod || "Razorpay / UPI"}</Text>
            </View>
            <View style={[styles.statementRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.statementLabel}>80G Benefit:</Text>
              <Text style={[styles.statementVal, { color: "#166534" }]}>50% Tax Deduction Claimable</Text>
            </View>
          </View>
        </ActionDialog>
      )}

      {/* Annual Statement Dialog */}
      <ActionDialog
        visible={statementModalVisible}
        onClose={() => setStatementModalVisible(false)}
        title="Annual 80G Statement"
        description="Consolidated contribution statement with 80G registration certificate for tax return filing."
        type="primary"
        icon="document-text-outline"
        badge="INCOME TAX SEC 80G"
        showCancel={true}
        cancelText="Close"
        confirmText={isDownloading ? "Generating PDF..." : "Download Statement"}
        onConfirm={handleDownloadPdf}
      >
        <View style={styles.statementBox}>
          <View style={styles.statementRow}>
            <Text style={styles.statementLabel}>Organization:</Text>
            <Text style={styles.statementVal}>Prayas Samiti (Regd.)</Text>
          </View>
          <View style={styles.statementRow}>
            <Text style={styles.statementLabel}>Registration No:</Text>
            <Text style={styles.statementVal}>1489/2005-06</Text>
          </View>
          <View style={styles.statementRow}>
            <Text style={styles.statementLabel}>80G Order No:</Text>
            <Text style={styles.statementVal}>AAATP2024E2021</Text>
          </View>
          <View style={styles.statementRow}>
            <Text style={styles.statementLabel}>Financial Year:</Text>
            <Text style={styles.statementVal}>FY 2024-25</Text>
          </View>
          <View style={styles.statementRow}>
            <Text style={styles.statementLabel}>Total Contributions:</Text>
            <Text style={styles.statementValHighlight}>₹{totalSuccessfulAmount.toLocaleString("en-IN")}</Text>
          </View>
          <View style={[styles.statementRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.statementLabel}>Receipt Status:</Text>
            <Text style={[styles.statementVal, { color: "#166534" }]}>✓ Verified & Digitally Signed</Text>
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
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.4,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 34,
  },
  summaryCard: {
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    ...Shadows.soft,
  },
  summaryTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#166534",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  summaryAmount: {
    fontSize: 26,
    fontWeight: "900",
    color: "#0F172A",
    marginTop: 2,
  },
  taxBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  taxBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#166534",
  },
  summarySubtext: {
    fontSize: 11,
    color: "#475569",
    lineHeight: 16,
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
    marginRight: 10,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
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
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
  },
  cardReceiptTag: {
    fontSize: 10,
    color: "#166534",
    fontWeight: "700",
    marginTop: 2,
  },
  cardRight: {
    alignItems: "flex-end",
  },
  cardAmount: {
    fontSize: 15,
    fontWeight: "900",
    color: "#0F172A",
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  statusSuccess: {
    backgroundColor: "#DCFCE7",
  },
  statusPending: {
    backgroundColor: "#FEF3C7",
  },
  cardStatusText: {
    fontSize: 10,
    fontWeight: "800",
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
    marginTop: 6,
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
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
  },
  statementVal: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0F172A",
  },
  statementValHighlight: {
    fontSize: 13,
    fontWeight: "900",
    color: "#166534",
  },
  emptyCard: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 12,
  },
  emptySub: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
    marginTop: 4,
    lineHeight: 18,
  },
  donateNowBtn: {
    marginTop: 16,
    backgroundColor: "#166534",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  donateNowBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  cardPhoneTag: {
    fontSize: 10,
    color: "#1E3A8A",
    fontWeight: "700",
    marginTop: 1,
  },
  phoneSyncCard: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
    ...Shadows.soft,
  },
  phoneSyncTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  phoneSyncLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  phoneIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  phoneSyncTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: "#1E3A8A",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  phoneSyncNumber: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 1,
  },
  changePhoneBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  changePhoneBtnText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#1E3A8A",
  },
  phoneEditBox: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#BFDBFE",
  },
  phoneEditInstruction: {
    fontSize: 11,
    color: "#475569",
    marginBottom: 6,
    fontWeight: "600",
  },
  phoneInputRow: {
    flexDirection: "row",
    gap: 8,
  },
  phoneSearchInput: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#93C5FD",
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 38,
    fontSize: 12,
    color: "#0F172A",
    fontWeight: "700",
  },
  phoneSearchBtn: {
    backgroundColor: "#1E3A8A",
    paddingHorizontal: 14,
    height: 38,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  phoneSearchBtnText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },
  phoneResetBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    paddingVertical: 2,
  },
  phoneResetBtnText: {
    fontSize: 11,
    color: "#1E3A8A",
    fontWeight: "700",
  },
  syncNoticeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
  },
  phoneSyncNotice: {
    fontSize: 10,
    color: "#166534",
    fontWeight: "600",
  },
});
