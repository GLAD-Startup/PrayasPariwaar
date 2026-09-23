import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  TextInput,
  ActivityIndicator,
  Dimensions,
  Platform,
  Image,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import RazorpayCheckout from "react-native-razorpay";
import { Colors, Shadows } from "../../lib/theme";
import { api } from "../../lib/api";
import { getAuthUser } from "../../lib/secureStore";
import ActionDialog from "../../components/ActionDialog";
import SidebarDrawer from "../../components/SidebarDrawer";

// Razorpay live key for native checkout — must match the key used on the server to create orders
const RAZORPAY_KEY_ID = process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || "rzp_live_TeXwRoahNczEgu";

const { width } = Dimensions.get("window");

interface CauseItem {
  id: string;
  title: string;
  icon: string;
  iconType: "ionicons" | "material";
  iconColor: string;
  bgColor: string;
  borderColor: string;
}

const CAUSES: CauseItem[] = [
  {
    id: "all",
    title: "All Causes\n(General Seva)",
    icon: "grid-outline",
    iconType: "ionicons",
    iconColor: "#166534",
    bgColor: "#F0FDF4",
    borderColor: "#BBF7D0",
  },
  {
    id: "education",
    title: "Free Child\nEducation",
    icon: "school-outline",
    iconType: "ionicons",
    iconColor: "#166534",
    bgColor: "#F0FDF4",
    borderColor: "#BBF7D0",
  },
  {
    id: "medical",
    title: "Medical & 24/7\nBlood Seva",
    icon: "medical-outline",
    iconType: "ionicons",
    iconColor: "#DC2626",
    bgColor: "#FEF2F2",
    borderColor: "#FECACA",
  },
  {
    id: "plantation",
    title: "Tree\nPlantation",
    icon: "leaf-outline",
    iconType: "ionicons",
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
const DEFAULT_UPI_VPA = "paytmqrjb4vvmyug2@paytm";
const MERCHANT_NAME = "Prayas Samiti";

export default function DonateScreen() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"razorpay" | "qr">("razorpay");
  const [selectedCause, setSelectedCause] = useState<string>("all");
  const [frequency, setFrequency] = useState<"one-time" | "monthly" | "yearly">("one-time");
  const [selectedAmount, setSelectedAmount] = useState<number | "other">(1000);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isOtherSelected, setIsOtherSelected] = useState<boolean>(false);

  // Donor Contact Info
  const [donorName, setDonorName] = useState<string>("");
  const [donorPhone, setDonorPhone] = useState<string>("");
  const [donorEmail, setDonorEmail] = useState<string>("");
  const [utrNumber, setUtrNumber] = useState<string>("");

  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const [donateDialogState, setDonateDialogState] = useState<{
    visible: boolean;
    title: string;
    description: string;
    type: "success" | "warning" | "danger" | "primary" | "info";
    icon: string;
    badge?: string;
    confirmText?: string;
    onConfirm?: () => void;
  }>({
    visible: false,
    title: "",
    description: "",
    type: "primary",
    icon: "information-circle-outline",
  });

  // Pre-fill donor details from auth user
  useEffect(() => {
    (async () => {
      const user = await getAuthUser();
      if (user) {
        if (user.name) setDonorName(user.name);
        if (user.phone) setDonorPhone(String(user.phone).trim());
        if (user.email) setDonorEmail(user.email);
      }
    })();
  }, []);

  const getEffectiveAmount = () => {
    if (isOtherSelected) {
      return parseInt(customAmount, 10) || 0;
    }
    return typeof selectedAmount === "number" ? selectedAmount : 1000;
  };

  const getCauseTitle = () => {
    return selectedCause === "all"
      ? "General Fund & Emergency Relief"
      : CAUSES.find((c) => c.id === selectedCause)?.title.replace("\n", " ") || selectedCause;
  };

  /**
   * 1. Official Razorpay Payment Gateway (Native SDK Checkout)
   * Uses react-native-razorpay to open the official Razorpay Checkout natively inside the app.
   * Flow: Create Order → Open Native Checkout → Verify Signature Server-Side → Show Receipt
   */
  const handleRazorpayPayment = async () => {
    const amount = getEffectiveAmount();
    if (amount <= 0) {
      setDonateDialogState({
        visible: true,
        title: "Amount Required",
        description: "Please enter or select a valid contribution amount.",
        type: "warning",
        icon: "heart-outline",
        badge: "SEVA CONTRIBUTION",
      });
      return;
    }

    if (!donorPhone || donorPhone.trim().length < 10) {
      setDonateDialogState({
        visible: true,
        title: "Mobile Number Required",
        description: "Please provide a valid 10-digit mobile number so your 80G tax receipt is linked to your account.",
        type: "warning",
        icon: "call-outline",
        badge: "MOBILE SYNC",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const amountInPaise = Math.round(amount * 100);
      const causeTitle = getCauseTitle();

      // Step 1: Create Razorpay order on server
      const orderRes = await api.post("/create-order", {
        amount: amountInPaise,
        currency: "INR",
        donorName: donorName.trim() || "Mobile Seva Donor",
        donorEmail: donorEmail.trim() || "donor@prayas.org",
        donorPhone: donorPhone.trim(),
        projectOrCause: causeTitle,
        frequency: frequency === "monthly" ? "MONTHLY" : frequency === "yearly" ? "YEARLY" : "ONE_TIME",
        isAnonymous: false,
      });

      if (orderRes.error || !orderRes.data?.order_id) {
        throw new Error(orderRes.error || "Could not initialize Razorpay payment order.");
      }

      const { order_id, amount: orderAmount, currency } = orderRes.data;

      // Step 2: Open native Razorpay Checkout inside the app
      const checkoutOptions = {
        key: RAZORPAY_KEY_ID,
        amount: String(orderAmount),
        currency: currency || "INR",
        name: "Prayas Samiti",
        description: `${causeTitle} • Seva Contribution`,
        image: "https://gladstudio.net/prayas/images/logo.png",
        order_id: order_id,
        prefill: {
          email: donorEmail.trim() || "donor@prayas.org",
          contact: donorPhone.trim(),
          name: donorName.trim() || "Supporter",
        },
        theme: { color: "#166534" },
        retry: { enabled: true, max_count: 4 },
        send_sms_hash: true,
      };

      console.log("[Razorpay] Opening native checkout for order:", order_id);

      const paymentData = await RazorpayCheckout.open(checkoutOptions);
      // paymentData = { razorpay_payment_id, razorpay_order_id, razorpay_signature }

      console.log("[Razorpay] Payment success, verifying signature...", paymentData.razorpay_payment_id);

      // Step 3: Verify payment signature on server
      const verifyRes = await api.post("/verify-payment", {
        razorpay_order_id: paymentData.razorpay_order_id,
        razorpay_payment_id: paymentData.razorpay_payment_id,
        razorpay_signature: paymentData.razorpay_signature,
        donorPhone: donorPhone.trim(),
        donorName: donorName.trim() || "Supporter",
        donorEmail: donorEmail.trim() || "donor@prayas.org",
        projectOrCause: causeTitle,
        amount: orderAmount,
        currency: currency || "INR",
      });

      if (verifyRes.error || !verifyRes.data?.success) {
        throw new Error(verifyRes.error || "Payment verification failed on server.");
      }

      const receiptNo = verifyRes.data.receipt || verifyRes.data.donation?.receiptNumber || `SDT-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;

      // Step 4: Show success with receipt
      setDonateDialogState({
        visible: true,
        title: "Contribution Successful!",
        description: `Thank you, ${donorName || "Supporter"}!\n\nYour contribution of ₹${amount.toLocaleString("en-IN")} has been verified via Razorpay.\n\nOfficial 80G tax receipt #${receiptNo} is linked to your mobile (${donorPhone.trim()}).`,
        type: "success",
        icon: "checkmark-circle-outline",
        badge: `RECEIPT: ${receiptNo}`,
        confirmText: "View My Receipts",
        onConfirm: () => {
          setDonateDialogState((prev) => ({ ...prev, visible: false }));
          router.push("/my-donations");
        },
      });
    } catch (err: any) {
      console.error("[Razorpay Error]:", err);

      // Razorpay SDK returns error.code === 2 when user dismisses the checkout
      if (err?.code === 2) {
        setDonateDialogState({
          visible: true,
          title: "Payment Cancelled",
          description: "You closed the payment screen. No amount has been charged. You can try again anytime.",
          type: "warning",
          icon: "close-circle-outline",
          badge: "CANCELLED",
        });
      } else {
        setDonateDialogState({
          visible: true,
          title: "Payment Error",
          description: err?.description || err?.message || "Failed to complete Razorpay payment. Please check your internet connection and try again.",
          type: "danger",
          icon: "alert-circle-outline",
          badge: "GATEWAY ERROR",
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * 2. Direct QR Payment Submission
   * "for direct payment have one tab via QR where no verifucation needed just the form is enough!"
   */
  const handleDirectQrPaymentSubmit = async () => {
    const amount = getEffectiveAmount();
    if (amount <= 0) {
      setDonateDialogState({
        visible: true,
        title: "Amount Required",
        description: "Please enter or select the contribution amount you transferred.",
        type: "warning",
        icon: "heart-outline",
      });
      return;
    }

    if (!donorName || donorName.trim().length < 2) {
      setDonateDialogState({
        visible: true,
        title: "Donor Name Required",
        description: "Please enter the donor full name for the official 80G tax receipt.",
        type: "warning",
        icon: "person-outline",
      });
      return;
    }

    if (!donorPhone || donorPhone.trim().length < 10) {
      setDonateDialogState({
        visible: true,
        title: "Mobile Number Required",
        description: "Please provide a valid 10-digit mobile number so your receipt is linked to your account.",
        type: "warning",
        icon: "call-outline",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const causeTitle = getCauseTitle();

      // Directly create & record donation in DB (NO SIGNATURE VERIFICATION NEEDED)
      const res = await api.post("/donations", {
        amount,
        currency: "INR",
        frequency: frequency === "monthly" ? "MONTHLY" : frequency === "yearly" ? "YEARLY" : "ONE_TIME",
        paymentMethod: "Paytm Standee QR",
        donorName: donorName.trim(),
        donorPhone: donorPhone.trim(),
        donorEmail: donorEmail.trim() || "donor@prayas.org",
        projectOrCause: causeTitle,
        isAnonymous: false,
      });

      if (res.error || !res.data?.success) {
        throw new Error(res.error || "Failed to record direct contribution.");
      }

      const receiptNumber = res.data.receiptNumber || res.data.data?.receiptNumber || `SDT-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;

      setDonateDialogState({
        visible: true,
        title: "Contribution Recorded!",
        description: `Thank you, ${donorName.trim()}!\n\nYour direct contribution of ₹${amount.toLocaleString("en-IN")} via Paytm QR has been recorded.\n\nOfficial 80G tax receipt #${receiptNumber} is now linked to your mobile (${donorPhone.trim()}).`,
        type: "success",
        icon: "checkmark-circle-outline",
        badge: `RECEIPT: ${receiptNumber}`,
        confirmText: "View My Receipts",
        onConfirm: () => {
          setDonateDialogState((prev) => ({ ...prev, visible: false }));
          router.push("/my-donations");
        },
      });
    } catch (err: any) {
      console.error("[Direct QR Error]:", err);
      setDonateDialogState({
        visible: true,
        title: "Submission Error",
        description: err?.message || "Failed to record contribution. Please try again.",
        type: "danger",
        icon: "alert-circle-outline",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyUpiId = () => {
    Alert.alert("Paytm UPI ID", `${DEFAULT_UPI_VPA}\n\nPayee: ${MERCHANT_NAME}`);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerMenuBtn}
          onPress={() => setSidebarOpen(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="menu" size={24} color="#1E293B" />
        </TouchableOpacity>

        <View style={styles.headerTitleCol}>
          <Text style={styles.headerTitle}>Donate & Seva</Text>
          <Text style={styles.headerSubtitle}>100% Direct Aid • 80G Tax Exempt</Text>
        </View>

        <TouchableOpacity
          style={styles.myDonationsBtn}
          onPress={() => router.push("/my-donations")}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="hand-heart-outline" size={18} color="#166534" />
          <Text style={styles.myDonationsText}>My Receipts</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Payment Mode Segmented Tabs */}
        <View style={styles.tabToggleRow}>
          <TouchableOpacity
            style={[styles.tabToggleBtn, activeTab === "razorpay" && styles.tabToggleBtnActive]}
            onPress={() => setActiveTab("razorpay")}
            activeOpacity={0.85}
          >
            <Ionicons
              name="shield-checkmark"
              size={16}
              color={activeTab === "razorpay" ? "#FFFFFF" : "#475569"}
            />
            <Text
              style={[
                styles.tabToggleText,
                activeTab === "razorpay" && styles.tabToggleTextActive,
              ]}
            >
              Razorpay Gateway
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabToggleBtn, activeTab === "qr" && styles.tabToggleBtnActive]}
            onPress={() => setActiveTab("qr")}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons
              name="qrcode-scan"
              size={16}
              color={activeTab === "qr" ? "#FFFFFF" : "#475569"}
            />
            <Text
              style={[styles.tabToggleText, activeTab === "qr" && styles.tabToggleTextActive]}
            >
              Direct Standee QR
            </Text>
          </TouchableOpacity>
        </View>

        {/* ------------------ TAB 1: RAZORPAY GATEWAY ------------------ */}
        {activeTab === "razorpay" && (
          <View>
            {/* Section: Choose a Cause */}
            <Text style={styles.sectionHeading}>1. Choose Seva Cause</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.causesScroll}
            >
              {CAUSES.map((cause) => {
                const isSelected = selectedCause === cause.id;
                return (
                  <TouchableOpacity
                    key={cause.id}
                    style={[
                      styles.causeCard,
                      isSelected && {
                        borderColor: cause.iconColor,
                        backgroundColor: cause.bgColor,
                        borderWidth: 2,
                      },
                    ]}
                    onPress={() => setSelectedCause(cause.id)}
                    activeOpacity={0.8}
                  >
                    <View
                      style={[
                        styles.causeIconCircle,
                        { backgroundColor: cause.bgColor, borderColor: cause.borderColor },
                      ]}
                    >
                      {cause.iconType === "ionicons" ? (
                        <Ionicons name={cause.icon as any} size={22} color={cause.iconColor} />
                      ) : (
                        <MaterialCommunityIcons
                          name={cause.icon as any}
                          size={22}
                          color={cause.iconColor}
                        />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.causeCardTitle,
                        isSelected && { color: cause.iconColor, fontWeight: "800" },
                      ]}
                    >
                      {cause.title}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Section: Choose Donation Amount */}
            <Text style={styles.sectionHeading}>2. Choose Contribution Amount</Text>

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
                      setCustomAmount(amt.toString());
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

              {/* Custom Chip */}
              <TouchableOpacity
                style={[styles.amountChip, isOtherSelected && styles.amountChipActive]}
                onPress={() => setIsOtherSelected(true)}
                activeOpacity={0.8}
              >
                <Text style={[styles.amountChipText, isOtherSelected && styles.amountChipTextActive]}>
                  Custom
                </Text>
              </TouchableOpacity>
            </View>

            {/* Custom Amount Input Field */}
            <View
              style={[
                styles.customAmountInputWrapper,
                isOtherSelected && { borderColor: "#166534", backgroundColor: "#F0FDF4" },
              ]}
            >
              <Text style={styles.rupeeSymbol}>₹</Text>
              <TextInput
                style={styles.customAmountInput}
                placeholder="Or enter any custom amount (₹)"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={isOtherSelected ? customAmount : ""}
                onChangeText={(text) => {
                  const cleaned = text.replace(/[^0-9]/g, "");
                  setCustomAmount(cleaned);
                  setIsOtherSelected(true);
                }}
              />
              {isOtherSelected && customAmount.length > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    setCustomAmount("");
                    setSelectedAmount(1000);
                    setIsOtherSelected(false);
                  }}
                  style={{ padding: 4 }}
                >
                  <Ionicons name="close-circle" size={18} color="#94A3B8" />
                </TouchableOpacity>
              )}
            </View>

            {/* Section 3: Donor Details for 80G Receipt */}
            <Text style={styles.sectionHeading}>3. Donor Details (For 80G Tax Receipt)</Text>
            <View style={styles.formCard}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Mobile Number (Required for Receipt Link)</Text>
                <TextInput
                  style={styles.formInput}
                  value={donorPhone}
                  onChangeText={setDonorPhone}
                  placeholder="10-digit mobile number"
                  placeholderTextColor="#94A3B8"
                  keyboardType="phone-pad"
                  maxLength={15}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Donor Full Name</Text>
                <TextInput
                  style={styles.formInput}
                  value={donorName}
                  onChangeText={setDonorName}
                  placeholder="Name to appear on 80G receipt"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <TextInput
                  style={styles.formInput}
                  value={donorEmail}
                  onChangeText={setDonorEmail}
                  placeholder="donor@prayas.org"
                  placeholderTextColor="#94A3B8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Gateway Supported Methods Banner */}
            <View style={styles.gatewayFeaturesBanner}>
              <View style={styles.featurePill}>
                <Ionicons name="card" size={13} color="#166534" />
                <Text style={styles.featurePillText}>Debit / Credit Cards</Text>
              </View>
              <View style={styles.featurePill}>
                <MaterialCommunityIcons name="bank" size={13} color="#1E40AF" />
                <Text style={styles.featurePillText}>50+ NetBanking</Text>
              </View>
              <View style={styles.featurePill}>
                <Ionicons name="flash" size={13} color="#7C3AED" />
                <Text style={styles.featurePillText}>Razorpay UPI & QR</Text>
              </View>
              <View style={styles.featurePill}>
                <Ionicons name="wallet" size={13} color="#EA580C" />
                <Text style={styles.featurePillText}>Wallets</Text>
              </View>
            </View>

            {/* Primary Razorpay Action Button */}
            <TouchableOpacity
              style={styles.mainDonateBtn}
              onPress={handleRazorpayPayment}
              disabled={isProcessing}
              activeOpacity={0.88}
            >
              {isProcessing ? (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.mainDonateBtnText}>Connecting to Razorpay...</Text>
                </View>
              ) : (
                <>
                  <Ionicons name="lock-closed" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.mainDonateBtnText}>
                    Pay ₹{getEffectiveAmount() > 0 ? getEffectiveAmount().toLocaleString() : "..."} via Razorpay
                  </Text>
                  <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* ------------------ TAB 2: DIRECT STANDEE QR ------------------ */}
        {activeTab === "qr" && (
          <View>
            {/* Standee QR Card */}
            <View style={styles.qrHeroCard}>
              <Text style={styles.qrTitle}>Official Paytm Merchant Standee</Text>
              <Text style={styles.qrSub}>
                Scan with any UPI app (Paytm, PhonePe, Google Pay, BHIM or any Banking app)
              </Text>

              <View style={styles.qrImageWrapper}>
                <Image
                  source={require("../../assets/images/paytm-qr.png")}
                  style={styles.qrImage}
                  resizeMode="contain"
                />
              </View>

              <View style={styles.vpaInfoBox}>
                <View style={styles.vpaRow}>
                  <Text style={styles.vpaLabel}>Verified Payee:</Text>
                  <Text style={styles.vpaValue}>{MERCHANT_NAME}</Text>
                </View>
                <View style={styles.vpaRow}>
                  <Text style={styles.vpaLabel}>Merchant UPI ID:</Text>
                  <TouchableOpacity onPress={handleCopyUpiId} style={styles.copyRow}>
                    <Text style={styles.vpaIdText} selectable>{DEFAULT_UPI_VPA}</Text>
                    <Ionicons name="copy-outline" size={14} color="#166534" style={{ marginLeft: 4 }} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Direct Donation Form: No verification needed, just form is enough! */}
            <Text style={styles.sectionHeading}>Direct Contribution Form</Text>
            <Text style={styles.formInstruction}>
              After scanning and paying via your UPI app, submit this simple form to link and generate your official 80G tax receipt:
            </Text>

            {/* Amount Selection */}
            <View style={styles.amountChipsRow}>
              {PRESET_AMOUNTS.map((amt) => {
                const isSelected = !isOtherSelected && selectedAmount === amt;
                return (
                  <TouchableOpacity
                    key={amt}
                    style={[styles.amountChip, isSelected && styles.amountChipActive]}
                    onPress={() => {
                      setSelectedAmount(amt);
                      setCustomAmount(amt.toString());
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

              <TouchableOpacity
                style={[styles.amountChip, isOtherSelected && styles.amountChipActive]}
                onPress={() => setIsOtherSelected(true)}
                activeOpacity={0.8}
              >
                <Text style={[styles.amountChipText, isOtherSelected && styles.amountChipTextActive]}>
                  Custom
                </Text>
              </TouchableOpacity>
            </View>

            {/* Custom Amount Input Field */}
            <View
              style={[
                styles.customAmountInputWrapper,
                isOtherSelected && { borderColor: "#166534", backgroundColor: "#F0FDF4" },
              ]}
            >
              <Text style={styles.rupeeSymbol}>₹</Text>
              <TextInput
                style={styles.customAmountInput}
                placeholder="Transferred Amount (₹)"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={isOtherSelected ? customAmount : ""}
                onChangeText={(text) => {
                  const cleaned = text.replace(/[^0-9]/g, "");
                  setCustomAmount(cleaned);
                  setIsOtherSelected(true);
                }}
              />
            </View>

            {/* Form Fields */}
            <View style={styles.formCard}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Donor Full Name *</Text>
                <TextInput
                  style={styles.formInput}
                  value={donorName}
                  onChangeText={setDonorName}
                  placeholder="Full name for tax receipt"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Mobile Number * (Linked to My Receipts)</Text>
                <TextInput
                  style={styles.formInput}
                  value={donorPhone}
                  onChangeText={setDonorPhone}
                  placeholder="10-digit mobile number"
                  placeholderTextColor="#94A3B8"
                  keyboardType="phone-pad"
                  maxLength={15}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email Address (Optional)</Text>
                <TextInput
                  style={styles.formInput}
                  value={donorEmail}
                  onChangeText={setDonorEmail}
                  placeholder="donor@prayas.org"
                  placeholderTextColor="#94A3B8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>UPI Reference / UTR Number (Optional)</Text>
                <TextInput
                  style={styles.formInput}
                  value={utrNumber}
                  onChangeText={setUtrNumber}
                  placeholder="e.g. 4235XXXXXXXX"
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={styles.mainDonateBtn}
              onPress={handleDirectQrPaymentSubmit}
              disabled={isProcessing}
              activeOpacity={0.88}
            >
              {isProcessing ? (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.mainDonateBtnText}>Recording Contribution...</Text>
                </View>
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.mainDonateBtnText}>
                    Record Contribution & Get 80G Receipt
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Transparency Banner */}
        <View style={styles.transparencyBanner}>
          <View style={styles.transparencyIconCircle}>
            <MaterialCommunityIcons name="hand-heart-outline" size={24} color="#166534" />
          </View>
          <View style={styles.transparencyTextCol}>
            <Text style={styles.transparencyTitle}>100% of your donation goes directly to seva.</Text>
            <Text style={styles.transparencySubtitle}>
              Prayas Samiti is an 18-year registered society (Reg. 142/2006-07) operating with zero administrative deductions.
            </Text>
          </View>
        </View>

        {/* Trust & Benefits 4-Grid */}
        <View style={styles.trustGrid}>
          <View style={styles.trustItem}>
            <Ionicons name="shield-checkmark-outline" size={22} color="#166534" />
            <Text style={styles.trustTitle}>Trusted &{"\n"}Transparent</Text>
            <Text style={styles.trustDesc}>Zero commission deductions.</Text>
          </View>

          <View style={styles.trustItem}>
            <Ionicons name="document-text-outline" size={22} color="#166534" />
            <Text style={styles.trustTitle}>Official{"\n"}Receipts</Text>
            <Text style={styles.trustDesc}>Digital 80G tax exemption receipt.</Text>
          </View>

          <View style={styles.trustItem}>
            <Ionicons name="lock-closed-outline" size={22} color="#166534" />
            <Text style={styles.trustTitle}>Safe &{"\n"}Secure</Text>
            <Text style={styles.trustDesc}>Razorpay certified 256-bit SSL.</Text>
          </View>

          <View style={styles.trustItem}>
            <MaterialCommunityIcons name="account-group-outline" size={22} color="#166534" />
            <Text style={styles.trustTitle}>Support 5{"\n"}Causes</Text>
            <Text style={styles.trustDesc}>Education, Health, Trees & Care.</Text>
          </View>
        </View>
      </ScrollView>

      {/* Universal ActionDialog */}
      <ActionDialog
        visible={donateDialogState.visible}
        onClose={() => setDonateDialogState({ ...donateDialogState, visible: false })}
        onConfirm={donateDialogState.onConfirm}
        title={donateDialogState.title}
        description={donateDialogState.description}
        type={donateDialogState.type}
        icon={donateDialogState.icon}
        badge={donateDialogState.badge}
        confirmText={donateDialogState.confirmText || "Got It"}
        showCancel={false}
      />

      {/* Navigation Sidebar Drawer */}
      <SidebarDrawer isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
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
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  headerMenuBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginRight: 12,
  },
  headerTitleCol: {
    flex: 1,
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    fontSize: 11,
    color: "#166534",
    fontWeight: "600",
    marginTop: 2,
  },
  myDonationsBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 5,
  },
  myDonationsText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#166534",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 36,
  },
  tabToggleRow: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  tabToggleBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  tabToggleBtnActive: {
    backgroundColor: "#166534",
    ...Shadows.soft,
  },
  tabToggleText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#475569",
  },
  tabToggleTextActive: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 12,
    marginBottom: 10,
    letterSpacing: -0.2,
  },
  causesScroll: {
    paddingRight: 16,
    gap: 10,
    marginBottom: 10,
  },
  causeCard: {
    width: 105,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    ...Shadows.soft,
  },
  causeIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    marginBottom: 6,
  },
  causeCardTitle: {
    fontSize: 10,
    fontWeight: "700",
    color: "#1E293B",
    textAlign: "center",
    lineHeight: 13,
  },
  frequencySegmentWrapper: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderRadius: 10,
    padding: 3,
    marginBottom: 10,
  },
  freqSegment: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
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
    marginBottom: 10,
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
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
    marginBottom: 14,
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
  formCard: {
    backgroundColor: "#F8FAF9",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 14,
    gap: 10,
  },
  inputGroup: {
    gap: 4,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#475569",
  },
  formInput: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    fontSize: 13,
    color: "#0F172A",
    fontWeight: "600",
  },
  gatewayFeaturesBanner: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 16,
  },
  featurePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  featurePillText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#334155",
  },
  mainDonateBtn: {
    backgroundColor: "#166534",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 52,
    borderRadius: 14,
    marginBottom: 20,
    ...Shadows.primaryBtn,
  },
  mainDonateBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: -0.2,
  },
  qrHeroCard: {
    backgroundColor: "#F8FAF9",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 14,
  },
  qrTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
  },
  qrSub: {
    fontSize: 11,
    color: "#64748B",
    textAlign: "center",
    marginTop: 2,
    marginBottom: 14,
  },
  qrImageWrapper: {
    backgroundColor: "#FFFFFF",
    padding: 10,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.soft,
  },
  qrImage: {
    width: width - 88,
    height: Math.min((width - 88) * 1.3, 310),
    borderRadius: 10,
  },
  vpaInfoBox: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginTop: 12,
    gap: 4,
  },
  vpaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  vpaLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
  },
  vpaValue: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0F172A",
  },
  vpaIdText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#166534",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  copyRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  formInstruction: {
    fontSize: 11,
    color: "#64748B",
    marginBottom: 10,
    lineHeight: 16,
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
  },
  transparencyTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#166534",
  },
  transparencySubtitle: {
    fontSize: 10,
    color: "#475569",
    marginTop: 1,
    lineHeight: 14,
  },
  trustGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 20,
  },
  trustItem: {
    width: (width - 32 - 10) / 2,
    backgroundColor: "#F8FAF9",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  trustTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 6,
    marginBottom: 2,
  },
  trustDesc: {
    fontSize: 9,
    color: "#64748B",
    lineHeight: 13,
  },
});
