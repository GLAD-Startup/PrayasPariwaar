import React, { useState, useEffect, useRef } from "react";
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
import RazorpayCheckout from "react-native-razorpay";
import { Shadows } from "../../lib/theme";
import { api } from "../../lib/api";
import { getAuthUser, getItem } from "../../lib/secureStore";
import { sendLocalNotification } from "../../lib/notifications";
import ActionDialog from "../../components/ActionDialog";
import SidebarDrawer from "../../components/SidebarDrawer";

const RAZORPAY_KEY_ID =
  process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || "rzp_live_TeXwRoahNczEgu";

const { width } = Dimensions.get("window");

interface CauseItem {
  id: string;
  title: string;
  icon: string;
  iconType: "ionicons" | "material";
  iconColor: string;
}

const CAUSES: CauseItem[] = [
  {
    id: "education",
    title: "Free Education",
    icon: "book-outline",
    iconType: "ionicons",
    iconColor: "#166534",
  },
  {
    id: "medical",
    title: "Blood Donation",
    icon: "water",
    iconType: "ionicons",
    iconColor: "#DC2626",
  },
  {
    id: "plantation",
    title: "Plantation",
    icon: "leaf-outline",
    iconType: "ionicons",
    iconColor: "#15803D",
  },
  {
    id: "jeev",
    title: "Jeev Jal Seva",
    icon: "water-outline",
    iconType: "ionicons",
    iconColor: "#0284C7",
  },
  {
    id: "vocational",
    title: "Vocational Training",
    icon: "cog-outline",
    iconType: "material",
    iconColor: "#9333EA",
  },
];

const PRESET_AMOUNTS = [500, 1000, 2500, 5000];
const DEFAULT_UPI_VPA = "paytmqrjb4vvmyug2@paytm";
const MERCHANT_NAME = "Prayas Samiti";

export default function DonateScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const customInputRef = useRef<TextInput>(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [paymentMode, setPaymentMode] = useState<"gateway" | "qr">("gateway");
  const [selectedCause, setSelectedCause] = useState<string>("education");
  const [frequency, setFrequency] = useState<"one-time" | "monthly" | "yearly">("one-time");

  // Amount State: always numeric string, prefilled with 1000
  const [amountInput, setAmountInput] = useState<string>("1000");

  // Donor Contact Info
  const [donorName, setDonorName] = useState<string>("");
  const [donorPhone, setDonorPhone] = useState<string>("");
  const [donorEmail, setDonorEmail] = useState<string>("");

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

  const getEffectiveAmount = (): number => {
    const val = parseInt(amountInput, 10);
    return isNaN(val) ? 0 : val;
  };

  const handleSelectPreset = (amt: number) => {
    setAmountInput(amt.toString());
  };

  const handleSelectOther = () => {
    setAmountInput("");
    setTimeout(() => {
      customInputRef.current?.focus();
    }, 100);
  };

  const getCauseTitle = () => {
    return CAUSES.find((c) => c.id === selectedCause)?.title || "Free Child Education";
  };

  const scrollToPaymentOptions = () => {
    scrollViewRef.current?.scrollTo({ y: 380, animated: true });
  };

  /**
   * Official Razorpay Payment Flow (Verified checkout)
   */
  const handleRazorpayPayment = async () => {
    const amount = getEffectiveAmount();
    if (amount <= 0) {
      setDonateDialogState({
        visible: true,
        title: "Amount Required",
        description: "Please enter a valid contribution amount.",
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
        description:
          "Please provide a valid 10-digit mobile number so your 80G tax receipt is linked to your account.",
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

      const orderRes = await api.post("/create-order", {
        amount: amountInPaise,
        currency: "INR",
        donorName: donorName.trim() || "Mobile Seva Donor",
        donorEmail: donorEmail.trim() || "av.prayas@gmail.com",
        donorPhone: donorPhone.trim(),
        projectOrCause: causeTitle,
        frequency:
          frequency === "monthly"
            ? "MONTHLY"
            : frequency === "yearly"
            ? "YEARLY"
            : "ONE_TIME",
        isAnonymous: false,
      });

      if (orderRes.error || !orderRes.data?.order_id) {
        throw new Error(orderRes.error || "Could not initialize Razorpay payment order.");
      }

      const { order_id, amount: orderAmount, currency } = orderRes.data;

      const checkoutOptions = {
        key: RAZORPAY_KEY_ID,
        amount: String(orderAmount),
        currency: currency || "INR",
        name: "Prayas Samiti",
        description: `${causeTitle} • Seva Contribution`,
        image: "https://gladstudio.net/prayas/images/logo.png",
        order_id: order_id,
        prefill: {
          email: donorEmail.trim() || "av.prayas@gmail.com",
          contact: donorPhone.trim(),
          name: donorName.trim() || "Supporter",
        },
        theme: { color: "#166534" },
        retry: { enabled: true, max_count: 4 },
        send_sms_hash: true,
      };

      const paymentData = await RazorpayCheckout.open(checkoutOptions);

      const [storedPushToken, authUser] = await Promise.all([
        getItem("prayas_expo_push_token"),
        getAuthUser(),
      ]);

      const verifyRes = await api.post("/verify-payment", {
        razorpay_order_id: paymentData.razorpay_order_id,
        razorpay_payment_id: paymentData.razorpay_payment_id,
        razorpay_signature: paymentData.razorpay_signature,
        donorPhone: donorPhone.trim(),
        donorName: donorName.trim() || "Supporter",
        donorEmail: donorEmail.trim() || "av.prayas@gmail.com",
        projectOrCause: causeTitle,
        amount: orderAmount,
        currency: currency || "INR",
        expoPushToken: storedPushToken || undefined,
        clientUserId: authUser?.id || undefined,
      });

      if (verifyRes.error || !verifyRes.data?.success) {
        throw new Error(verifyRes.error || "Payment verification failed on server.");
      }

      const receiptNo =
        verifyRes.data.receipt ||
        verifyRes.data.donation?.receiptNumber ||
        `SDT-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;

      // Trigger immediate confirmation notification locally
      sendLocalNotification(
        "🙏 Seva Contribution Confirmed",
        `Thank you, ${donorName.trim() || "Kind Donor"}! Your ₹${amount.toLocaleString("en-IN")} contribution has been received. 80G tax-exempt receipt #${receiptNo} generated.`,
        {
          type: "donation",
          receiptNumber: receiptNo,
          amount: String(amount),
          url: "/my-donations",
        },
        "donation_receipts"
      );

      router.push({
        pathname: "/donation-success",
        params: {
          txId: paymentData.razorpay_payment_id || receiptNo,
          receiptNo: receiptNo,
          amount: String(amount),
          paymentMethod: "UPI / Card (Razorpay)",
          purpose: causeTitle,
          donorEmail: donorEmail.trim() || "av.prayas@gmail.com",
          donorName: donorName.trim() || "Supporter",
          date:
            new Date().toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }) +
            ", " +
            new Date().toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }),
        },
      });
    } catch (err: any) {
      console.log("[Razorpay Flow Result]:", err);

      let isUserCancel = false;
      let errorObj = err?.error || null;

      if (!errorObj && typeof err?.description === "string") {
        try {
          const parsed = JSON.parse(err.description);
          errorObj = parsed.error || parsed;
        } catch {
          // not json
        }
      }

      if (
        err?.code === 2 ||
        err?.code === 0 ||
        errorObj?.source === "customer" ||
        errorObj?.reason === "payment_cancelled" ||
        (errorObj?.step === "payment_authentication" &&
          (errorObj?.description === "undefined" || !errorObj?.description))
      ) {
        isUserCancel = true;
      }

      if (isUserCancel) {
        setDonateDialogState({
          visible: true,
          title: "Payment Cancelled",
          description:
            "You closed the payment screen. No amount has been deducted from your account. You can retry whenever you are ready.",
          type: "info",
          icon: "close-circle-outline",
          badge: "PAYMENT CANCELLED",
          confirmText: "Close",
        });
      } else {
        let cleanMsg = errorObj?.description || err?.description || err?.message || "";
        if (
          typeof cleanMsg !== "string" ||
          cleanMsg === "undefined" ||
          cleanMsg.trim().startsWith("{") ||
          cleanMsg.trim().length === 0
        ) {
          cleanMsg =
            "The payment could not be completed. Please check your internet connection or try another payment method.";
        }

        setDonateDialogState({
          visible: true,
          title: "Payment Unsuccessful",
          description: cleanMsg,
          type: "danger",
          icon: "alert-circle-outline",
          badge: "PAYMENT ISSUE",
          confirmText: "Try Again",
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyUpiId = () => {
    Alert.alert("Paytm UPI ID Copied", `${DEFAULT_UPI_VPA}\n\nPayee: ${MERCHANT_NAME}\n\nYou can now paste this UPI ID in Google Pay, PhonePe, Paytm or BHIM.`);
  };

  // Determine which chip is currently selected
  const activePreset = PRESET_AMOUNTS.find((amt) => amt.toString() === amountInput);
  const isOtherActive = !activePreset;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Header matching reference design */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerMenuBtn}
          onPress={() => setSidebarOpen(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="menu" size={24} color="#166534" />
        </TouchableOpacity>

        <View style={styles.headerCenterCol}>
          <Text style={styles.headerTitle}>Donate</Text>
          <Text style={styles.headerSubtitle}>
            Your support can change lives and build a better tomorrow.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.myDonationsBtn}
          onPress={() => router.push("/my-donations")}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="hand-heart-outline"
            size={22}
            color="#166534"
          />
          <Text style={styles.myDonationsText}>My Donations</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Banner Card with fixed height matching reference design */}
        <View style={styles.heroBannerCard}>
          <View style={styles.heroBannerLeft}>
            <View>
              <Text style={styles.heroBannerTitle}>
                Small Contribution,{"\n"}
                <Text style={styles.heroBannerTitleHighlight}>Big Transformation</Text>
              </Text>
              <Text style={styles.heroBannerDesc} numberOfLines={3}>
                Your donation helps us continue our mission in education, health,
                environment, animal care and skill development.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.heroDonateBtn}
              onPress={scrollToPaymentOptions}
              activeOpacity={0.85}
            >
              <Text style={styles.heroDonateBtnText}>Donate Now</Text>
              <Ionicons name="heart" size={12} color="#FFFFFF" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>

          <View style={styles.heroBannerRight}>
            <Image
              source={require("../../assets/images/donate_hero_kids.jpg")}
              style={styles.heroImage}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* Section: Choose a Cause */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>Choose a Cause</Text>
          <TouchableOpacity
            style={styles.viewAllRow}
            onPress={() => router.push("/(tabs)/seva")}
            activeOpacity={0.7}
          >
            <Text style={styles.viewAllText}>View All Causes</Text>
            <Ionicons name="chevron-forward" size={13} color="#166534" />
          </TouchableOpacity>
        </View>

        {/* 5 Cause Cards row matching reference design */}
        <View style={styles.causesRow}>
          {CAUSES.map((cause) => {
            const isSelected = selectedCause === cause.id;
            return (
              <TouchableOpacity
                key={cause.id}
                style={[
                  styles.causeCard,
                  isSelected && styles.causeCardSelected,
                ]}
                onPress={() => setSelectedCause(cause.id)}
                activeOpacity={0.8}
              >
                <View style={styles.causeIconWrapper}>
                  {cause.iconType === "ionicons" ? (
                    <Ionicons
                      name={cause.icon as any}
                      size={22}
                      color={cause.iconColor}
                    />
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
                    isSelected && styles.causeCardTitleSelected,
                  ]}
                  numberOfLines={2}
                >
                  {cause.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Section: Choose Donation Amount */}
        <Text style={styles.sectionHeading}>Choose Donation Amount</Text>

        {/* Frequency Segmented Pill */}
        <View style={styles.frequencySegmentWrapper}>
          <TouchableOpacity
            style={[
              styles.freqSegment,
              frequency === "one-time" && styles.freqSegmentActive,
            ]}
            onPress={() => setFrequency("one-time")}
            activeOpacity={0.85}
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
            style={[
              styles.freqSegment,
              frequency === "monthly" && styles.freqSegmentActive,
            ]}
            onPress={() => setFrequency("monthly")}
            activeOpacity={0.85}
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
            style={[
              styles.freqSegment,
              frequency === "yearly" && styles.freqSegmentActive,
            ]}
            onPress={() => setFrequency("yearly")}
            activeOpacity={0.85}
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

        {/* Preset Amount Chips Row */}
        <View style={styles.amountChipsRow}>
          {PRESET_AMOUNTS.map((amt) => {
            const isSelected = activePreset === amt;
            return (
              <TouchableOpacity
                key={amt}
                style={[styles.amountChip, isSelected && styles.amountChipActive]}
                onPress={() => handleSelectPreset(amt)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.amountChipText,
                    isSelected && styles.amountChipTextActive,
                  ]}
                >
                  ₹{amt.toLocaleString("en-IN")}
                </Text>
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity
            style={[styles.amountChip, isOtherActive && styles.amountChipActive]}
            onPress={handleSelectOther}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.amountChipText,
                isOtherActive && styles.amountChipTextActive,
              ]}
            >
              Other
            </Text>
          </TouchableOpacity>
        </View>

        {/* Custom Amount Input Field - Always accessible and editable */}
        <View style={styles.customAmountInputWrapper}>
          <Text style={styles.rupeeSymbol}>₹</Text>
          <TextInput
            ref={customInputRef}
            style={styles.customAmountInput}
            placeholder="Enter custom amount in ₹"
            placeholderTextColor="#94A3B8"
            keyboardType="numeric"
            value={amountInput}
            onChangeText={(text) => {
              const cleaned = text.replace(/[^0-9]/g, "");
              setAmountInput(cleaned);
            }}
          />
          {amountInput.length > 0 && (
            <TouchableOpacity
              onPress={() => setAmountInput("")}
              style={{ padding: 4 }}
            >
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        {/* 100% Transparency Banner */}
        <View style={styles.guaranteeBanner}>
          <View style={styles.guaranteeLeft}>
            <View style={styles.guaranteeIconCircle}>
              <MaterialCommunityIcons
                name="hand-heart-outline"
                size={22}
                color="#166534"
              />
            </View>
            <View style={styles.guaranteeTextCol}>
              <Text style={styles.guaranteeTitle}>
                100% of your donation goes to our programs.
              </Text>
              <Text style={styles.guaranteeSubtitle}>
                We are a registered trust and your donation is eligible for tax benefits.
              </Text>
            </View>
          </View>

          <View style={styles.guaranteeRight}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#166534" />
            <Text style={styles.guaranteeSecureText}>Secure{"\n"}Donation</Text>
          </View>
        </View>

        {/* Payment Options Header & Mode Switcher */}
        <View style={styles.paymentSectionHeader}>
          <Text style={styles.sectionHeading}>Payment Options</Text>
          <View style={styles.paymentModeToggle}>
            <TouchableOpacity
              style={[
                styles.modePill,
                paymentMode === "gateway" && styles.modePillActive,
              ]}
              onPress={() => setPaymentMode("gateway")}
            >
              <Text
                style={[
                  styles.modePillText,
                  paymentMode === "gateway" && styles.modePillTextActive,
                ]}
              >
                Online Gateway
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modePill,
                paymentMode === "qr" && styles.modePillActive,
              ]}
              onPress={() => setPaymentMode("qr")}
            >
              <Text
                style={[
                  styles.modePillText,
                  paymentMode === "qr" && styles.modePillTextActive,
                ]}
              >
                Standee QR
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {paymentMode === "gateway" ? (
          <View>
            {/* Compact Donor Details (Only required for 80G tax receipt on Online Gateway) */}
            <View style={styles.donorCardCompact}>
              <Text style={styles.donorCardTitle}>Donor Details (For 80G Tax Receipt)</Text>
              <View style={styles.donorInputsRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.donorInputLabel}>Mobile Number *</Text>
                  <TextInput
                    style={styles.donorInput}
                    value={donorPhone}
                    onChangeText={setDonorPhone}
                    placeholder="10-digit mobile"
                    placeholderTextColor="#94A3B8"
                    keyboardType="phone-pad"
                    maxLength={15}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.donorInputLabel}>Full Name</Text>
                  <TextInput
                    style={styles.donorInput}
                    value={donorName}
                    onChangeText={setDonorName}
                    placeholder="Full Name"
                    placeholderTextColor="#94A3B8"
                  />
                </View>
              </View>
            </View>

            <View style={styles.paymentOptionsList}>
              {/* UPI / QR Code */}
              <TouchableOpacity
                style={styles.paymentOptionCard}
                onPress={handleRazorpayPayment}
                activeOpacity={0.8}
              >
                <View style={styles.paymentOptionIconWrap}>
                  <Ionicons name="flash-outline" size={18} color="#166534" />
                </View>
                <View style={styles.paymentOptionTextCol}>
                  <Text style={styles.paymentOptionTitle}>UPI / QR Code</Text>
                  <Text style={styles.paymentOptionSubtitle}>Pay using any UPI app</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
              </TouchableOpacity>

              {/* Cards */}
              <TouchableOpacity
                style={styles.paymentOptionCard}
                onPress={handleRazorpayPayment}
                activeOpacity={0.8}
              >
                <View style={styles.paymentOptionIconWrap}>
                  <Ionicons name="card-outline" size={18} color="#166534" />
                </View>
                <View style={styles.paymentOptionTextCol}>
                  <Text style={styles.paymentOptionTitle}>Cards</Text>
                  <Text style={styles.paymentOptionSubtitle}>Debit / Credit Cards</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
              </TouchableOpacity>

              {/* Net Banking */}
              <TouchableOpacity
                style={styles.paymentOptionCard}
                onPress={handleRazorpayPayment}
                activeOpacity={0.8}
              >
                <View style={styles.paymentOptionIconWrap}>
                  <MaterialCommunityIcons name="bank-outline" size={18} color="#166534" />
                </View>
                <View style={styles.paymentOptionTextCol}>
                  <Text style={styles.paymentOptionTitle}>Net Banking</Text>
                  <Text style={styles.paymentOptionSubtitle}>All major banks supported</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
              </TouchableOpacity>

              {/* Wallets */}
              <TouchableOpacity
                style={styles.paymentOptionCard}
                onPress={handleRazorpayPayment}
                activeOpacity={0.8}
              >
                <View style={styles.paymentOptionIconWrap}>
                  <Ionicons name="wallet-outline" size={18} color="#166534" />
                </View>
                <View style={styles.paymentOptionTextCol}>
                  <Text style={styles.paymentOptionTitle}>Wallets</Text>
                  <Text style={styles.paymentOptionSubtitle}>
                    PhonePe, Paytm, Amazon Pay & more
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* Standee QR View - Strictly for direct scan, NO direct payment recording */
          <View style={styles.qrSectionWrapper}>
            <View style={styles.qrHeroCard}>
              <Text style={styles.qrTitle}>Official Paytm Merchant Standee</Text>
              <Text style={styles.qrSub}>
                Scan with Paytm, PhonePe, Google Pay or any banking app
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
                    <Text style={styles.vpaIdText} selectable>
                      {DEFAULT_UPI_VPA}
                    </Text>
                    <Ionicons
                      name="copy-outline"
                      size={13}
                      color="#166534"
                      style={{ marginLeft: 4 }}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={styles.copyUpiBtn}
                onPress={handleCopyUpiId}
                activeOpacity={0.85}
              >
                <Ionicons name="copy-outline" size={15} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.copyUpiBtnText}>Copy UPI ID ({DEFAULT_UPI_VPA})</Text>
              </TouchableOpacity>

              <View style={styles.directQrNotice}>
                <Ionicons name="information-circle" size={16} color="#166534" style={{ marginRight: 6 }} />
                <Text style={styles.directQrNoticeText}>
                  Direct transfers go directly into the official Prayas Samiti society account. No in-app record or transaction is stored for direct standee scans.
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Trust & Benefits 4-Grid matching reference design */}
        <View style={styles.trustGrid}>
          <View style={styles.trustItem}>
            <Ionicons name="shield-checkmark-outline" size={22} color="#166534" />
            <Text style={styles.trustTitle}>
              Trusted &{"\n"}
              <Text style={styles.trustTitleHighlight}>Transparent</Text>
            </Text>
            <Text style={styles.trustDesc}>Your trust means everything to us.</Text>
          </View>

          <View style={styles.trustItem}>
            <Ionicons name="document-text-outline" size={22} color="#166534" />
            <Text style={styles.trustTitle}>Tax{"\n"}Benefits</Text>
            <Text style={styles.trustDesc}>
              80G certificate available for your donation.
            </Text>
          </View>

          <View style={styles.trustItem}>
            <Ionicons name="lock-closed-outline" size={22} color="#166534" />
            <Text style={styles.trustTitle}>Safe & Secure</Text>
            <Text style={styles.trustDesc}>
              Your payment information is{" "}
              <Text style={styles.trustDescHighlight}>100% secure.</Text>
            </Text>
          </View>

          <View style={styles.trustItem}>
            <MaterialCommunityIcons
              name="account-group-outline"
              size={22}
              color="#166534"
            />
            <Text style={styles.trustTitle}>Support 5 Causes</Text>
            <Text style={styles.trustDesc}>
              Education, Health, Environment, Animal Care & Skill Training
            </Text>
          </View>
        </View>

        {/* Bottom Banner matching reference design */}
        <View style={styles.bottomCtaBanner}>
          <View style={styles.bottomCtaLeft}>
            <MaterialCommunityIcons
              name="hand-heart"
              size={28}
              color="#F87171"
              style={{ marginRight: 8 }}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.bottomCtaTitle}>
                Together, we can create a better world.
              </Text>
              <Text style={styles.bottomCtaSub}>
                Thank you for your generosity!
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.bottomDonateBtn}
            onPress={
              paymentMode === "gateway"
                ? handleRazorpayPayment
                : handleCopyUpiId
            }
            disabled={isProcessing}
            activeOpacity={0.88}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color="#166534" />
            ) : (
              <>
                <Text style={styles.bottomDonateBtnText}>
                  {paymentMode === "gateway"
                    ? `Donate ₹${getEffectiveAmount() > 0 ? getEffectiveAmount().toLocaleString("en-IN") : "..."}`
                    : "Copy UPI ID"}
                </Text>
                <Ionicons
                  name={paymentMode === "gateway" ? "arrow-forward" : "copy-outline"}
                  size={15}
                  color="#166534"
                  style={{ marginLeft: 4 }}
                />
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Action Dialog for feedback/warnings */}
      <ActionDialog
        visible={donateDialogState.visible}
        onClose={() =>
          setDonateDialogState({ ...donateDialogState, visible: false })
        }
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
    paddingTop: 4,
    paddingBottom: 8,
    backgroundColor: "#FFFFFF",
  },
  headerMenuBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenterCol: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 6,
  },
  headerTitle: {
    fontSize: 21,
    fontWeight: "900",
    color: "#166534",
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 10.5,
    color: "#64748B",
    textAlign: "center",
    marginTop: 2,
    fontWeight: "500",
  },
  myDonationsBtn: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 50,
  },
  myDonationsText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#166534",
    marginTop: 2,
    textAlign: "center",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 32,
  },
  heroBannerCard: {
    height: 165,
    backgroundColor: "#F7FAF7",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    overflow: "hidden",
    marginBottom: 16,
    ...Shadows.soft,
  },
  heroBannerLeft: {
    flex: 1.15,
    padding: 12,
    justifyContent: "space-between",
  },
  heroBannerTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#0F172A",
    lineHeight: 19,
    letterSpacing: -0.3,
  },
  heroBannerTitleHighlight: {
    color: "#166534",
  },
  heroBannerDesc: {
    fontSize: 9.5,
    color: "#475569",
    lineHeight: 13.5,
    marginTop: 4,
  },
  heroDonateBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#166534",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  heroDonateBtnText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  heroBannerRight: {
    width: 135,
    height: 165,
    overflow: "hidden",
  },
  heroImage: {
    width: 135,
    height: 165,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  sectionHeading: {
    fontSize: 13.5,
    fontWeight: "800",
    color: "#166534",
    letterSpacing: -0.2,
  },
  viewAllRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  viewAllText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#166534",
  },
  causesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  causeCard: {
    width: (width - 32 - 24) / 5,
    height: 68,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
    padding: 4,
    ...Shadows.soft,
  },
  causeCardSelected: {
    borderColor: "#166534",
    backgroundColor: "#F0FDF4",
    borderWidth: 1.5,
  },
  causeIconWrapper: {
    marginBottom: 3,
  },
  causeCardTitle: {
    fontSize: 9,
    fontWeight: "700",
    color: "#334155",
    textAlign: "center",
    lineHeight: 11,
  },
  causeCardTitleSelected: {
    color: "#166534",
    fontWeight: "800",
  },
  frequencySegmentWrapper: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 2,
    marginTop: 6,
    marginBottom: 10,
  },
  freqSegment: {
    flex: 1,
    paddingVertical: 7,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
  },
  freqSegmentActive: {
    backgroundColor: "#166534",
  },
  freqSegmentText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#64748B",
  },
  freqSegmentTextActive: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  amountChipsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  amountChip: {
    width: (width - 32 - 24) / 5,
    height: 40,
    borderRadius: 8,
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
    fontSize: 11.5,
    fontWeight: "800",
    color: "#1E293B",
  },
  amountChipTextActive: {
    color: "#166534",
  },
  customAmountInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    borderWidth: 1.5,
    borderColor: "#166534",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    marginBottom: 10,
  },
  rupeeSymbol: {
    fontSize: 15,
    fontWeight: "800",
    color: "#166534",
    marginRight: 6,
  },
  customAmountInput: {
    flex: 1,
    fontSize: 13,
    color: "#0F172A",
    fontWeight: "700",
  },
  guaranteeBanner: {
    backgroundColor: "#F7FAF7",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2EFE2",
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  guaranteeLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 8,
  },
  guaranteeIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#EAF5EA",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  guaranteeTextCol: {
    flex: 1,
  },
  guaranteeTitle: {
    fontSize: 10.5,
    fontWeight: "800",
    color: "#166534",
  },
  guaranteeSubtitle: {
    fontSize: 9,
    color: "#64748B",
    marginTop: 1,
    lineHeight: 12,
  },
  guaranteeRight: {
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: 8,
    borderLeftWidth: 1,
    borderLeftColor: "#E2EFE2",
  },
  guaranteeSecureText: {
    fontSize: 8.5,
    fontWeight: "700",
    color: "#334155",
    textAlign: "center",
    marginTop: 1,
    lineHeight: 10,
  },
  paymentSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  paymentModeToggle: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    padding: 2,
  },
  modePill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  modePillActive: {
    backgroundColor: "#166534",
  },
  modePillText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#64748B",
  },
  modePillTextActive: {
    color: "#FFFFFF",
  },
  paymentOptionsList: {
    marginBottom: 12,
    gap: 6,
  },
  paymentOptionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    ...Shadows.soft,
  },
  paymentOptionIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  paymentOptionTextCol: {
    flex: 1,
  },
  paymentOptionTitle: {
    fontSize: 12.5,
    fontWeight: "800",
    color: "#0F172A",
  },
  paymentOptionSubtitle: {
    fontSize: 10,
    color: "#64748B",
    marginTop: 1,
  },
  qrSectionWrapper: {
    marginBottom: 12,
  },
  qrHeroCard: {
    backgroundColor: "#F8FAF9",
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 8,
  },
  qrTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
  },
  qrSub: {
    fontSize: 10,
    color: "#64748B",
    textAlign: "center",
    marginTop: 2,
    marginBottom: 10,
  },
  qrImageWrapper: {
    backgroundColor: "#FFFFFF",
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.soft,
  },
  qrImage: {
    width: width - 110,
    height: Math.min((width - 110) * 1.25, 260),
    borderRadius: 6,
  },
  vpaInfoBox: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginTop: 10,
    gap: 3,
  },
  vpaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  vpaLabel: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "#64748B",
  },
  vpaValue: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0F172A",
  },
  vpaIdText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#166534",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  copyRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  copyUpiBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#166534",
    width: "100%",
    height: 40,
    borderRadius: 10,
    marginTop: 10,
    ...Shadows.soft,
  },
  copyUpiBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  directQrNotice: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    borderRadius: 8,
    padding: 8,
    marginTop: 10,
    width: "100%",
  },
  directQrNoticeText: {
    flex: 1,
    fontSize: 10,
    color: "#166534",
    lineHeight: 14,
    fontWeight: "500",
  },
  donorCardCompact: {
    backgroundColor: "#F8FAF9",
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 10,
    gap: 6,
  },
  donorCardTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#166534",
  },
  donorInputsRow: {
    flexDirection: "row",
    gap: 8,
  },
  donorInputLabel: {
    fontSize: 9.5,
    fontWeight: "700",
    color: "#475569",
    marginBottom: 2,
  },
  donorInput: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 6,
    paddingHorizontal: 8,
    height: 34,
    fontSize: 11.5,
    color: "#0F172A",
    fontWeight: "600",
  },
  trustGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 14,
  },
  trustItem: {
    width: (width - 32 - 8) / 2,
    backgroundColor: "#F9FAF9",
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  trustTitle: {
    fontSize: 10.5,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 4,
    marginBottom: 2,
    lineHeight: 13,
  },
  trustTitleHighlight: {
    color: "#166534",
  },
  trustDesc: {
    fontSize: 9,
    color: "#64748B",
    lineHeight: 12,
  },
  trustDescHighlight: {
    color: "#166534",
    fontWeight: "700",
  },
  bottomCtaBanner: {
    backgroundColor: "#166534",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...Shadows.primaryBtn,
  },
  bottomCtaLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 6,
  },
  bottomCtaTitle: {
    fontSize: 11.5,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  bottomCtaSub: {
    fontSize: 9.5,
    color: "#BBF7D0",
    marginTop: 1,
  },
  bottomDonateBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    ...Shadows.soft,
  },
  bottomDonateBtnText: {
    fontSize: 11.5,
    fontWeight: "800",
    color: "#166534",
  },
});
