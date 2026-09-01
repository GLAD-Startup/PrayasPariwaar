import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Dimensions,
} from "react-native";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { Colors, Shadows } from "../lib/theme";

const { width } = Dimensions.get("window");

export interface ActionDialogProps {
  visible: boolean;
  onClose: () => void;
  onConfirm?: () => void | Promise<void>;
  title: string;
  description: string;
  badge?: string;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  type?: "danger" | "warning" | "success" | "primary" | "info";
  icon?: string;
  iconType?: "ionicons" | "material" | "fa5";
  loading?: boolean;
  children?: React.ReactNode;
}

export default function ActionDialog({
  visible,
  onClose,
  onConfirm,
  title,
  description,
  badge,
  confirmText = "OK",
  cancelText = "Cancel",
  showCancel = true,
  type = "primary",
  icon = "information-circle-outline",
  iconType = "ionicons",
  loading = false,
  children,
}: ActionDialogProps) {
  const getThemeColors = () => {
    switch (type) {
      case "danger":
        return {
          iconBg: "#FEF2F2",
          iconBorder: "#FECACA",
          iconColor: "#DC2626",
          confirmBtnBg: "#DC2626",
          confirmBtnText: "#FFFFFF",
          badgeBg: "#FEF2F2",
          badgeColor: "#DC2626",
        };
      case "warning":
        return {
          iconBg: "#FFFBEB",
          iconBorder: "#FDE68A",
          iconColor: "#D97706",
          confirmBtnBg: "#D97706",
          confirmBtnText: "#FFFFFF",
          badgeBg: "#FFFBEB",
          badgeColor: "#D97706",
        };
      case "success":
        return {
          iconBg: "#F0FDF4",
          iconBorder: "#BBF7D0",
          iconColor: "#16A34A",
          confirmBtnBg: "#166534",
          confirmBtnText: "#FFFFFF",
          badgeBg: "#F0FDF4",
          badgeColor: "#166534",
        };
      case "info":
        return {
          iconBg: "#F0FDF4",
          iconBorder: "#BBF7D0",
          iconColor: "#166534",
          confirmBtnBg: "#166534",
          confirmBtnText: "#FFFFFF",
          badgeBg: "#F0FDF4",
          badgeColor: "#166534",
        };
      case "primary":
      default:
        return {
          iconBg: "#EFF6FF",
          iconBorder: "#BFDBFE",
          iconColor: "#1D4ED8",
          confirmBtnBg: "#1D4ED8",
          confirmBtnText: "#FFFFFF",
          badgeBg: "#EFF6FF",
          badgeColor: "#1D4ED8",
        };
    }
  };

  const theme = getThemeColors();

  const handleConfirmPress = () => {
    if (onConfirm) {
      onConfirm();
    } else {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={loading ? undefined : onClose}
    >
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={loading ? undefined : onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <View style={styles.card}>
          {/* Top Badge (Optional) */}
          {badge ? (
            <View style={[styles.badgePill, { backgroundColor: theme.badgeBg }]}>
              <Text style={[styles.badgeText, { color: theme.badgeColor }]}>{badge}</Text>
            </View>
          ) : null}

          {/* Top Icon Circle */}
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: theme.iconBg, borderColor: theme.iconBorder },
            ]}
          >
            {iconType === "material" ? (
              <MaterialCommunityIcons name={icon as any} size={28} color={theme.iconColor} />
            ) : iconType === "fa5" ? (
              <FontAwesome5 name={icon as any} size={24} color={theme.iconColor} />
            ) : (
              <Ionicons name={icon as any} size={28} color={theme.iconColor} />
            )}
          </View>

          {/* Title & Description */}
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>

          {/* Custom Inner Content / Schedule Highlights */}
          {children ? <View style={styles.childrenContainer}>{children}</View> : null}

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            {showCancel ? (
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={onClose}
                disabled={loading}
                activeOpacity={0.75}
              >
                <Text style={styles.cancelBtnText}>{cancelText}</Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              style={[
                styles.confirmBtn,
                { backgroundColor: theme.confirmBtnBg },
                !showCancel && { flex: 1 },
                loading && { opacity: 0.8 },
              ]}
              onPress={handleConfirmPress}
              disabled={loading}
              activeOpacity={0.88}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={[styles.confirmBtnText, { color: theme.confirmBtnText }]}>
                  {confirmText}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.62)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 22,
    alignItems: "center",
    ...Shadows.card,
  },
  badgePill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 14,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  iconCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
    letterSpacing: -0.4,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 18,
    paddingHorizontal: 4,
  },
  childrenContainer: {
    width: "100%",
    marginBottom: 18,
  },
  buttonRow: {
    flexDirection: "row",
    width: "100%",
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#475569",
  },
  confirmBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.soft,
  },
  confirmBtnText: {
    fontSize: 15,
    fontWeight: "800",
  },
});
