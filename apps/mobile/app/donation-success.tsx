import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Dimensions,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Shadows } from "../lib/theme";

const { width } = Dimensions.get("window");

export default function DonationSuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    txId?: string;
    receiptNo?: string;
    date?: string;
    amount?: string;
    paymentMethod?: string;
    purpose?: string;
    donorEmail?: string;
    donorName?: string;
  }>();

  const formattedAmount = params.amount
    ? parseInt(params.amount, 10).toLocaleString("en-IN")
    : "1,000";

  const txId =
    params.txId ||
    params.receiptNo ||
    `SDT${new Date().getFullYear().toString().slice(-2)}${Math.floor(
      100000000 + Math.random() * 900000000
    )}`;

  const currentDateStr =
    params.date ||
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
      });

  const paymentMethod = params.paymentMethod || "UPI";
  const purpose = params.purpose || "Free Child Education";
  const donorEmail = params.donorEmail || "av.prayas@gmail.com";

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/(tabs)/donate");
            }
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color="#166534" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Donation Success</Text>

        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Confetti & Checkmark Graphic */}
        <View style={styles.graphicContainer}>
          {/* Confetti Sparkles / Dots */}
          <View style={[styles.dot, styles.dot1]} />
          <View style={[styles.dot, styles.dot2]} />
          <View style={[styles.dot, styles.dot3]} />
          <View style={[styles.dot, styles.dot4]} />
          <View style={[styles.dot, styles.dot5]} />
          <View style={[styles.dot, styles.dot6]} />
          <View style={[styles.dot, styles.dot7]} />
          <View style={[styles.dot, styles.dot8]} />
          <View style={[styles.dot, styles.dot9]} />
          <View style={[styles.dot, styles.dot10]} />

          {/* Central Green Success Circle */}
          <View style={styles.successCircle}>
            <Ionicons name="checkmark" size={44} color="#FFFFFF" />
          </View>
        </View>

        {/* Thank You & Subtitle */}
        <Text style={styles.heading}>Thank You!</Text>
        <Text style={styles.subtitle}>
          {"Your donation has been successful.\nTogether, we can create a better tomorrow."}
        </Text>

        {/* Donation Details Card */}
        <View style={styles.detailsCard}>
          <Text style={styles.cardTitle}>Donation Details</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Transaction ID</Text>
            <Text style={styles.detailValue} selectable>
              {txId}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>{currentDateStr}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Amount</Text>
            <Text style={[styles.detailValue, styles.amountHighlight]}>
              ₹{formattedAmount}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment Method</Text>
            <Text style={styles.detailValue}>{paymentMethod}</Text>
          </View>

          <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.detailLabel}>Purpose</Text>
            <Text style={styles.detailValue}>{purpose}</Text>
          </View>
        </View>

        {/* Receipt Dispatch Note */}
        <View style={styles.receiptNoticeRow}>
          <View style={styles.noticeIconWrapper}>
            <MaterialCommunityIcons
              name="hand-heart-outline"
              size={24}
              color="#166534"
            />
          </View>
          <Text style={styles.receiptNoticeText}>
            A receipt has been sent to{"\n"}
            <Text style={styles.emailHighlight}>{donorEmail}</Text>
          </Text>
        </View>

        {/* Bottom Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => router.push("/my-donations")}
            activeOpacity={0.88}
          >
            <Text style={styles.primaryBtnText}>View Receipt</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.homeLinkBtn}
            onPress={() => router.replace("/(tabs)/home")}
            activeOpacity={0.7}
          >
            <Text style={styles.homeLinkText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: "#FFFFFF",
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#166534",
    letterSpacing: -0.2,
  },
  headerPlaceholder: {
    width: 40,
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
    alignItems: "center",
  },
  graphicContainer: {
    width: 140,
    height: 140,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginBottom: 8,
  },
  successCircle: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: "#166534",
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.card,
  },
  dot: {
    position: "absolute",
    borderRadius: 6,
  },
  dot1: {
    width: 8,
    height: 8,
    backgroundColor: "#F97316",
    top: 10,
    left: 20,
  },
  dot2: {
    width: 6,
    height: 6,
    backgroundColor: "#10B981",
    top: 4,
    right: 32,
  },
  dot3: {
    width: 9,
    height: 9,
    backgroundColor: "#F43F5E",
    top: 40,
    right: 8,
  },
  dot4: {
    width: 7,
    height: 7,
    backgroundColor: "#3B82F6",
    bottom: 24,
    right: 14,
  },
  dot5: {
    width: 8,
    height: 8,
    backgroundColor: "#8B5CF6",
    bottom: 12,
    left: 26,
  },
  dot6: {
    width: 6,
    height: 6,
    backgroundColor: "#059669",
    top: 50,
    left: 10,
  },
  dot7: {
    width: 7,
    height: 7,
    backgroundColor: "#EAB308",
    bottom: 38,
    left: 4,
  },
  dot8: {
    width: 5,
    height: 5,
    backgroundColor: "#EC4899",
    top: 24,
    right: 18,
  },
  dot9: {
    width: 8,
    height: 8,
    backgroundColor: "#14B8A6",
    bottom: 4,
    right: 48,
  },
  dot10: {
    width: 6,
    height: 6,
    backgroundColor: "#6366F1",
    top: 14,
    left: 56,
  },
  heading: {
    fontSize: 26,
    fontWeight: "900",
    color: "#166534",
    textAlign: "center",
    letterSpacing: -0.5,
    marginTop: 4,
  },
  subtitle: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 19,
    marginTop: 8,
    fontWeight: "500",
  },
  detailsCard: {
    width: "100%",
    backgroundColor: "#F9FAF9",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginTop: 24,
    marginBottom: 20,
    ...Shadows.soft,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#166534",
    marginBottom: 14,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF2F6",
  },
  detailLabel: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
  },
  detailValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "right",
    flexShrink: 1,
    marginLeft: 16,
  },
  amountHighlight: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
  },
  receiptNoticeRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 8,
    marginBottom: 28,
    gap: 12,
  },
  noticeIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    alignItems: "center",
    justifyContent: "center",
  },
  receiptNoticeText: {
    fontSize: 12,
    color: "#334155",
    lineHeight: 18,
    fontWeight: "500",
    flex: 1,
  },
  emailHighlight: {
    fontWeight: "700",
    color: "#0F172A",
  },
  actionsContainer: {
    width: "100%",
    gap: 12,
  },
  primaryBtn: {
    width: "100%",
    height: 50,
    backgroundColor: "#166534",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.primaryBtn,
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  homeLinkBtn: {
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  homeLinkText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#166534",
  },
});
