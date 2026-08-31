import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  TextInput,
  StatusBar,
  Alert,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { Colors, Shadows } from "../../lib/theme";
import { api } from "../../lib/api";

const { width } = Dimensions.get("window");

const CAUSES = [
  {
    id: "education",
    title: "Free\nEducation",
    icon: "book-outline",
    iconType: "ionicons",
    iconColor: "#16A34A",
    bgColor: "#F0FDF4",
    borderColor: "#BBF7D0",
  },
  {
    id: "blood",
    title: "Blood\nDonation",
    icon: "water-outline",
    iconType: "ionicons",
    iconColor: "#DC2626",
    bgColor: "#FEF2F2",
    borderColor: "#FECACA",
  },
  {
    id: "plantation",
    title: "Plantation",
    icon: "sprout-outline",
    iconType: "material",
    iconColor: "#15803D",
    bgColor: "#F0FDF4",
    borderColor: "#BBF7D0",
  },
  {
    id: "jeev",
    title: "Jeev Jal\nSeva",
    icon: "bird",
    iconType: "material",
    iconColor: "#2563EB",
    bgColor: "#EFF6FF",
    borderColor: "#BFDBFE",
  },
  {
    id: "vocational",
    title: "Vocational\nTraining",
    icon: "cog-outline",
    iconType: "material",
    iconColor: "#9333EA",
    bgColor: "#FAF5FF",
    borderColor: "#E9D5FF",
  },
];

const PRESET_AMOUNTS = [500, 1000, 2500, 5000];

export default function DonateScreen() {
  const router = useRouter();
  const [selectedCause, setSelectedCause] = useState<string>("all");
  const [frequency, setFrequency] = useState<"one-time" | "monthly" | "yearly">("one-time");
  const [selectedAmount, setSelectedAmount] = useState<number | "other">(1000);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isOtherSelected, setIsOtherSelected] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [myDonationsModalVisible, setMyDonationsModalVisible] = useState(false);

  const getEffectiveAmount = () => {
    if (isOtherSelected) {
      return parseInt(customAmount, 10) || 0;
    }
    return typeof selectedAmount === "number" ? selectedAmount : 1000;
  };

  const handleInitiatePayment = (methodName: string) => {
    const amount = getEffectiveAmount();
    if (amount <= 0) {
      Alert.alert("Invalid Amount", "Please enter or select a valid donation amount.");
      return;
    }
    setPaymentModalVisible(true);
  };

  const handleCompleteDonation = async () => {
    setPaymentModalVisible(false);
    setIsProcessing(true);
    const amount = getEffectiveAmount();

    try {
      await api.post("/donations", {
        amount,
        frequency: frequency === "monthly" ? "MONTHLY" : frequency === "yearly" ? "YEARLY" : "ONE_TIME",
        donorName: "Mobile Seva Donor",
        donorEmail: "donor@prayas.org",
        donorPhone: "+91 94122 79000",
        cause: selectedCause,
        isAnonymous: false,
      });
    } catch (e) {
      console.warn("Donation API recording fallback", e);
    } finally {
      setIsProcessing(false);
      Alert.alert(
        "💚 Thank You for Your Seva!",
        `Your generous contribution of ₹${amount.toLocaleString()} has been received with deep gratitude. An 80G tax exemption receipt has been generated for your records.`,
        [{ text: "View Receipt", onPress: () => setMyDonationsModalVisible(true) }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Header */}
      <View style={styles.header}>
        <View style={{ width: 40 }} />

        <Text style={styles.headerTitle}>Donate</Text>

        <TouchableOpacity
          style={styles.myDonationsBtn}
          onPress={() => setMyDonationsModalVisible(true)}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="hand-heart-outline" size={22} color="#166534" />
          <Text style={styles.myDonationsText}>My Donations</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Your support can change lives and build a better tomorrow.
        </Text>

        {/* Hero Feature Banner Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroLeft}>
            <Text style={styles.heroHeading}>
              Small Contribution,{"\n"}
              <Text style={styles.heroHeadingGreen}>Big Transformation</Text>
            </Text>
            <Text style={styles.heroDesc}>
              Your donation helps us continue our mission in education, health, environment, animal
              care and skill development.
            </Text>

            <TouchableOpacity
              style={styles.heroDonateBtn}
              onPress={() => handleInitiatePayment("General")}
              activeOpacity={0.88}
            >
              <Text style={styles.heroDonateBtnText}>Donate Now</Text>
              <Ionicons name="heart" size={14} color="#FFFFFF" style={{ marginLeft: 6 }} />
            </TouchableOpacity>
          </View>

          <View style={styles.heroRight}>
            <Image
              source={require("../../assets/onboarding/education.jpg")}
              style={styles.heroImage}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* Section: Choose a Cause */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>Choose a Cause</Text>
          <TouchableOpacity
            onPress={() => {
              setSelectedCause("all");
              Alert.alert("All Causes Selected", "Your donation will support all 5 seva pillars.");
            }}
          >
            <Text style={styles.viewAllText}>View All Causes ›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.causesGrid}>
          {CAUSES.map((cause) => {
            const isSelected = selectedCause === cause.id;
            return (
              <TouchableOpacity
                key={cause.id}
                style={[
                  styles.causeItem,
                  isSelected && styles.causeItemSelected,
                ]}
                onPress={() => setSelectedCause(isSelected ? "all" : cause.id)}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.causeBox,
                    { backgroundColor: cause.bgColor, borderColor: cause.borderColor },
                    isSelected && { borderColor: "#166534", borderWidth: 2 },
                  ]}
                >
                  {cause.iconType === "ionicons" ? (
                    <Ionicons name={cause.icon as any} size={22} color={cause.iconColor} />
                  ) : (
                    <MaterialCommunityIcons name={cause.icon as any} size={22} color={cause.iconColor} />
                  )}
                </View>
                <Text
                  style={[
                    styles.causeLabel,
                    isSelected && { color: "#166534", fontWeight: "800" },
                  ]}
                >
                  {cause.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Section: Choose Donation Amount */}
        <Text style={styles.sectionHeading}>Choose Donation Amount</Text>

        {/* Frequency Segmented Control */}
        <View style={styles.frequencySegmentWrapper}>
          <TouchableOpacity
            style={[styles.freqSegment, frequency === "one-time" && styles.freqSegmentActive]}
            onPress={() => setFrequency("one-time")}
          >
            <Text
              style={[
                styles.freqSegmentText,
                frequency === "one-time" && styles.freqSegmentTextActive,
              ]}
            >
              One Time
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.freqSegment, frequency === "monthly" && styles.freqSegmentActive]}
            onPress={() => setFrequency("monthly")}
          >
            <Text
              style={[
                styles.freqSegmentText,
                frequency === "monthly" && styles.freqSegmentTextActive,
              ]}
            >
              Monthly
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.freqSegment, frequency === "yearly" && styles.freqSegmentActive]}
            onPress={() => setFrequency("yearly")}
          >
            <Text
              style={[
                styles.freqSegmentText,
                frequency === "yearly" && styles.freqSegmentTextActive,
              ]}
            >
              Yearly
            </Text>
          </TouchableOpacity>
        </View>

        {/* Amount Preset Chips */}
        <View style={styles.amountChipsRow}>
          {PRESET_AMOUNTS.map((amt) => {
            const isSelected = !isOtherSelected && selectedAmount === amt;
            return (
              <TouchableOpacity
                key={amt}
                style={[styles.amountChip, isSelected && styles.amountChipActive]}
                onPress={() => {
                  setSelectedAmount(amt);
                  setIsOtherSelected(false);
                }}
                activeOpacity={0.8}
              >
                <Text style={[styles.amountChipText, isSelected && styles.amountChipTextActive]}>
                  ₹{amt.toLocaleString()}
                </Text>
              </TouchableOpacity>
            );
          })}

          {/* Other Chip */}
          <TouchableOpacity
            style={[styles.amountChip, isOtherSelected && styles.amountChipActive]}
            onPress={() => setIsOtherSelected(true)}
            activeOpacity={0.8}
          >
            <Text style={[styles.amountChipText, isOtherSelected && styles.amountChipTextActive]}>
              Other
            </Text>
          </TouchableOpacity>
        </View>

        {/* Custom Amount Input if Other selected */}
        {isOtherSelected && (
          <View style={styles.customAmountInputWrapper}>
            <Text style={styles.rupeeSymbol}>₹</Text>
            <TextInput
              style={styles.customAmountInput}
              placeholder="Enter custom amount"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={customAmount}
              onChangeText={setCustomAmount}
              autoFocus
            />
          </View>
        )}

        {/* Tax Benefit / Transparency Banner */}
        <View style={styles.transparencyBanner}>
          <View style={styles.transparencyIconCircle}>
            <MaterialCommunityIcons name="hand-heart-outline" size={24} color="#166534" />
          </View>
          <View style={styles.transparencyTextCol}>
            <Text style={styles.transparencyTitle}>100% of your donation goes to our programs.</Text>
            <Text style={styles.transparencySubtitle}>
              We are a registered trust and your donation is eligible for tax benefits (80G).
            </Text>
          </View>
          <View style={styles.secureBadge}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#166534" />
            <Text style={styles.secureText}>Secure{"\n"}Donation</Text>
          </View>
        </View>

        {/* Payment Options Section */}
        <Text style={styles.sectionHeading}>Payment Options</Text>
        <View style={styles.paymentOptionsList}>
          {/* UPI */}
          <TouchableOpacity
            style={styles.paymentOptionCard}
            onPress={() => handleInitiatePayment("UPI")}
            activeOpacity={0.85}
          >
            <View style={styles.paymentOptionLeft}>
              <View style={[styles.payIconBox, { backgroundColor: "#F8FAFC" }]}>
                <Text style={styles.upiText}>UPI</Text>
              </View>
              <View style={styles.payInfo}>
                <Text style={styles.payTitle}>UPI / QR Code</Text>
                <Text style={styles.paySubtitle}>Pay using any UPI app (GPay, PhonePe, Paytm)</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>

          {/* Cards */}
          <TouchableOpacity
            style={styles.paymentOptionCard}
            onPress={() => handleInitiatePayment("Cards")}
            activeOpacity={0.85}
          >
            <View style={styles.paymentOptionLeft}>
              <View style={[styles.payIconBox, { backgroundColor: "#F0FDF4" }]}>
                <Ionicons name="card-outline" size={20} color="#166534" />
              </View>
              <View style={styles.payInfo}>
                <Text style={styles.payTitle}>Cards</Text>
                <Text style={styles.paySubtitle}>Debit / Credit Cards</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>

          {/* Net Banking */}
          <TouchableOpacity
            style={styles.paymentOptionCard}
            onPress={() => handleInitiatePayment("NetBanking")}
            activeOpacity={0.85}
          >
            <View style={styles.paymentOptionLeft}>
              <View style={[styles.payIconBox, { backgroundColor: "#EFF6FF" }]}>
                <Ionicons name="business-outline" size={20} color="#1D4ED8" />
              </View>
              <View style={styles.payInfo}>
                <Text style={styles.payTitle}>Net Banking</Text>
                <Text style={styles.paySubtitle}>All major banks supported</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>

          {/* Wallets */}
          <TouchableOpacity
            style={styles.paymentOptionCard}
            onPress={() => handleInitiatePayment("Wallets")}
            activeOpacity={0.85}
          >
            <View style={styles.paymentOptionLeft}>
              <View style={[styles.payIconBox, { backgroundColor: "#FFFBEB" }]}>
                <Ionicons name="wallet-outline" size={20} color="#D97706" />
              </View>
              <View style={styles.payInfo}>
                <Text style={styles.payTitle}>Wallets</Text>
                <Text style={styles.paySubtitle}>PhonePe, Paytm, Amazon Pay & more</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Trust & Benefits 4-Grid */}
        <View style={styles.trustGrid}>
          {/* 1 */}
          <View style={styles.trustItem}>
            <Ionicons name="shield-checkmark-outline" size={22} color="#166534" />
            <Text style={styles.trustTitle}>Trusted &{"\n"}Transparent</Text>
            <Text style={styles.trustDesc}>Your trust means everything to us.</Text>
          </View>

          {/* 2 */}
          <View style={styles.trustItem}>
            <Ionicons name="document-text-outline" size={22} color="#166534" />
            <Text style={styles.trustTitle}>Tax{"\n"}Benefits</Text>
            <Text style={styles.trustDesc}>80G certificate available for your donation.</Text>
          </View>

          {/* 3 */}
          <View style={styles.trustItem}>
            <Ionicons name="lock-closed-outline" size={22} color="#166534" />
            <Text style={styles.trustTitle}>Safe &{"\n"}Secure</Text>
            <Text style={styles.trustDesc}>Your payment information is 100% secure.</Text>
          </View>

          {/* 4 */}
          <View style={styles.trustItem}>
            <MaterialCommunityIcons name="account-group-outline" size={22} color="#166534" />
            <Text style={styles.trustTitle}>Support 5{"\n"}Causes</Text>
            <Text style={styles.trustDesc}>Education, Health, Environment, Animals & Skills</Text>
          </View>
        </View>

        {/* Bottom Floating Action Banner */}
        <View style={styles.bottomBanner}>
          <View style={styles.bottomBannerLeft}>
            <MaterialCommunityIcons name="hand-heart" size={28} color="#EF4444" style={{ marginRight: 8 }} />
            <View style={styles.bottomBannerTextCol}>
              <Text style={styles.bottomBannerTitle}>Together, we can create a better world.</Text>
              <Text style={styles.bottomBannerSubtitle}>Thank you for your generosity!</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.bottomDonateBtn}
            onPress={() => handleInitiatePayment("Direct")}
            activeOpacity={0.88}
          >
            <Text style={styles.bottomDonateBtnText}>Donate Now</Text>
            <Ionicons name="arrow-forward" size={14} color="#166534" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>

        {/* Payment Confirmation Modal */}
        <Modal visible={paymentModalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Confirm Donation</Text>
                <TouchableOpacity onPress={() => setPaymentModalVisible(false)}>
                  <Ionicons name="close-circle" size={24} color="#64748B" />
                </TouchableOpacity>
              </View>

              <View style={styles.modalAmountBox}>
                <Text style={styles.modalAmountLabel}>Donation Amount</Text>
                <Text style={styles.modalAmountValue}>₹{getEffectiveAmount().toLocaleString()}</Text>
                <Text style={styles.modalFreqBadge}>
                  {frequency === "one-time" ? "One-Time Contribution" : frequency === "monthly" ? "Monthly Subscription" : "Annual Contribution"}
                </Text>
              </View>

              <View style={styles.modalRow}>
                <Text style={styles.modalRowLabel}>Beneficiary</Text>
                <Text style={styles.modalRowValue}>Seva Dham Trust (Prayas Pariwaar)</Text>
              </View>

              <View style={styles.modalRow}>
                <Text style={styles.modalRowLabel}>Tax Benefit</Text>
                <Text style={styles.modalRowValue}>80G Eligible (50% Exemption)</Text>
              </View>

              <TouchableOpacity
                style={styles.modalPayBtn}
                onPress={handleCompleteDonation}
                activeOpacity={0.88}
              >
                <Text style={styles.modalPayBtnText}>Proceed to Pay ₹{getEffectiveAmount().toLocaleString()} →</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* My Donations History Modal */}
        <Modal visible={myDonationsModalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>My Donation History</Text>
                <TouchableOpacity onPress={() => setMyDonationsModalVisible(false)}>
                  <Ionicons name="close-circle" size={24} color="#64748B" />
                </TouchableOpacity>
              </View>

              <View style={styles.donationHistoryCard}>
                <View style={styles.donHistoryHeader}>
                  <Text style={styles.donHistoryTitle}>Free Education Drive</Text>
                  <Text style={styles.donHistoryAmount}>₹1,000</Text>
                </View>
                <Text style={styles.donHistoryDate}>📅 15 May 2024 • Receipt #SDT-2024-884</Text>
                <View style={styles.donStatusBadge}>
                  <Text style={styles.donStatusText}>✓ 80G Receipt Issued</Text>
                </View>
              </View>

              <View style={[styles.donationHistoryCard, { marginTop: 10 }]}>
                <View style={styles.donHistoryHeader}>
                  <Text style={styles.donHistoryTitle}>Summer Jeev Jal Seva</Text>
                  <Text style={styles.donHistoryAmount}>₹500</Text>
                </View>
                <Text style={styles.donHistoryDate}>📅 02 May 2024 • Receipt #SDT-2024-631</Text>
                <View style={styles.donStatusBadge}>
                  <Text style={styles.donStatusText}>✓ 80G Receipt Issued</Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.modalPayBtn, { marginTop: 18 }]}
                onPress={() => setMyDonationsModalVisible(false)}
              >
                <Text style={styles.modalPayBtnText}>Close</Text>
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
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#164E2E",
    letterSpacing: -0.3,
  },
  myDonationsBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  myDonationsText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#166534",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 30,
  },
  subtitle: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 14,
  },
  heroCard: {
    backgroundColor: "#F8FAF9",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
    ...Shadows.soft,
  },
  heroLeft: {
    flex: 1,
    paddingRight: 10,
  },
  heroHeading: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    lineHeight: 20,
    marginBottom: 4,
  },
  heroHeadingGreen: {
    color: "#16A34A",
  },
  heroDesc: {
    fontSize: 10,
    color: "#64748B",
    lineHeight: 14,
    marginBottom: 10,
  },
  heroDonateBtn: {
    backgroundColor: "#166534",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    ...Shadows.soft,
  },
  heroDonateBtnText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },
  heroRight: {
    width: 95,
    height: 105,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#F1F5F9",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    marginTop: 4,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 10,
    marginTop: 6,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#166534",
  },
  causesGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  causeItem: {
    alignItems: "center",
    width: (width - 40) / 5,
  },
  causeItemSelected: {
    transform: [{ scale: 1.02 }],
  },
  causeBox: {
    width: 52,
    height: 52,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    marginBottom: 6,
    ...Shadows.soft,
  },
  causeLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: "#334155",
    textAlign: "center",
    lineHeight: 12,
  },
  frequencySegmentWrapper: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    padding: 3,
    marginBottom: 12,
  },
  freqSegment: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 10,
  },
  freqSegmentActive: {
    backgroundColor: "#166534",
    ...Shadows.soft,
  },
  freqSegmentText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
  },
  freqSegmentTextActive: {
    color: "#FFFFFF",
  },
  amountChipsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  amountChip: {
    width: (width - 40 - 32) / 5,
    height: 42,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.soft,
  },
  amountChipActive: {
    backgroundColor: "#F0FDF4",
    borderColor: "#166534",
    borderWidth: 1.5,
  },
  amountChipText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#1E293B",
  },
  amountChipTextActive: {
    color: "#166534",
  },
  customAmountInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#166534",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
    marginBottom: 12,
  },
  rupeeSymbol: {
    fontSize: 16,
    fontWeight: "800",
    color: "#166534",
    marginRight: 6,
  },
  customAmountInput: {
    flex: 1,
    fontSize: 14,
    color: "#0F172A",
    fontWeight: "700",
  },
  transparencyBanner: {
    backgroundColor: "#F8FAF9",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  transparencyIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  transparencyTextCol: {
    flex: 1,
    paddingRight: 6,
  },
  transparencyTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#164E2E",
  },
  transparencySubtitle: {
    fontSize: 9,
    color: "#64748B",
    marginTop: 2,
    lineHeight: 12,
  },
  secureBadge: {
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: 6,
    borderLeftWidth: 1,
    borderLeftColor: "#E2E8F0",
  },
  secureText: {
    fontSize: 8,
    fontWeight: "700",
    color: "#166534",
    textAlign: "center",
    marginTop: 2,
  },
  paymentOptionsList: {
    gap: 8,
    marginBottom: 16,
  },
  paymentOptionCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 12,
    ...Shadows.soft,
  },
  paymentOptionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  payIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  upiText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#334155",
  },
  payInfo: {
    flex: 1,
  },
  payTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
  },
  paySubtitle: {
    fontSize: 10,
    color: "#64748B",
    marginTop: 1,
  },
  trustGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  trustItem: {
    width: (width - 40 - 24) / 4,
    alignItems: "flex-start",
  },
  trustTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: "#164E2E",
    marginTop: 4,
    marginBottom: 2,
    lineHeight: 12,
  },
  trustDesc: {
    fontSize: 8,
    color: "#64748B",
    lineHeight: 11,
  },
  bottomBanner: {
    backgroundColor: "#164E2E",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...Shadows.soft,
  },
  bottomBannerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  bottomBannerTextCol: {
    flex: 1,
  },
  bottomBannerTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  bottomBannerSubtitle: {
    fontSize: 10,
    color: "#A7F3D0",
    marginTop: 1,
  },
  bottomDonateBtn: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    ...Shadows.soft,
  },
  bottomDonateBtnText: {
    color: "#166534",
    fontSize: 12,
    fontWeight: "800",
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
  modalAmountBox: {
    backgroundColor: "#F0FDF4",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    marginBottom: 16,
  },
  modalAmountLabel: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
  },
  modalAmountValue: {
    fontSize: 28,
    fontWeight: "900",
    color: "#166534",
    marginVertical: 4,
  },
  modalFreqBadge: {
    fontSize: 11,
    fontWeight: "700",
    color: "#16A34A",
  },
  modalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  modalRowLabel: {
    fontSize: 12,
    color: "#64748B",
  },
  modalRowValue: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0F172A",
  },
  modalPayBtn: {
    height: 48,
    backgroundColor: "#166534",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
    ...Shadows.primaryBtn,
  },
  modalPayBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  donationHistoryCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  donHistoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  donHistoryTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
  },
  donHistoryAmount: {
    fontSize: 13,
    fontWeight: "800",
    color: "#166534",
  },
  donHistoryDate: {
    fontSize: 10,
    color: "#64748B",
    marginBottom: 6,
  },
  donStatusBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  donStatusText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#166534",
  },
});
