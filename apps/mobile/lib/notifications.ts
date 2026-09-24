import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { api } from "./api";
import { getItem, setItem } from "./secureStore";

// Configure local notification display behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface NotificationPreferences {
  pushEnabled: boolean;
  emergencyBloodAlerts: boolean;
  sevaDrivesAnnouncements: boolean;
  soundEnabled: boolean;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  pushEnabled: true,
  emergencyBloodAlerts: true,
  sevaDrivesAnnouncements: true,
  soundEnabled: true,
};

export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  try {
    const raw = await getItem("prayas_notif_preferences");
    if (raw) {
      return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
    }
  } catch (e) {}
  return DEFAULT_PREFERENCES;
}

export async function saveNotificationPreferences(
  prefs: NotificationPreferences,
  userId?: string
): Promise<void> {
  try {
    await setItem("prayas_notif_preferences", JSON.stringify(prefs));

    if (prefs.pushEnabled) {
      await registerForPushNotificationsAsync(userId);
    } else {
      await unregisterPushNotificationsAsync(userId);
    }
  } catch (e) {
    console.warn("Failed to save notification preferences:", e);
  }
}

export async function unregisterPushNotificationsAsync(userId?: string): Promise<void> {
  try {
    const storedToken = await getItem("prayas_expo_push_token");
    if (storedToken) {
      await api.delete(`/push/register?token=${encodeURIComponent(storedToken)}`);
    } else if (userId) {
      await api.delete(`/push/register?userId=${encodeURIComponent(userId)}`);
    }
    console.log("[Notifications] Unregistered push token from server.");
  } catch (e) {
    console.warn("[Notifications] Failed to unregister push token:", e);
  }
}

export async function registerForPushNotificationsAsync(userId?: string): Promise<string | null> {
  if (Platform.OS === "web") {
    console.log("[Notifications] Push notifications are not supported on web.");
    return null;
  }

  // Check user preference
  const prefs = await getNotificationPreferences();
  if (!prefs.pushEnabled) {
    console.log("[Notifications] Push notifications are disabled in user settings.");
    return null;
  }

  if (!Device.isDevice) {
    console.log("[Notifications] Must use physical device for Push Notifications");
    return null;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.warn("[Notifications] Failed to get push token for push notification permission!");
      return null;
    }

    // Configure all 5 Android notification channels (Android 8.0+)
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("emergency_alerts", {
        name: "🚨 Emergency Seva & Blood Alerts",
        description: "Urgent emergency blood donation and disaster relief requests",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#DC2626",
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        sound: "default",
      });

      await Notifications.setNotificationChannelAsync("general_announcements", {
        name: "📢 Prayas Seva Updates & Dispatches",
        description: "New field dispatches, community stories, and project announcements",
        importance: Notifications.AndroidImportance.HIGH,
        lightColor: "#166534",
        sound: "default",
      });

      await Notifications.setNotificationChannelAsync("medical_requests", {
        name: "🏥 Medical Equipment & Relief Updates",
        description: "Status updates regarding medical equipment and aid applications",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#0284C7",
        sound: "default",
      });

      await Notifications.setNotificationChannelAsync("volunteer_updates", {
        name: "🤝 Volunteer Status & Seva Drives",
        description: "Volunteer application status updates, drive approvals, and certificates",
        importance: Notifications.AndroidImportance.HIGH,
        lightColor: "#9333EA",
        sound: "default",
      });

      await Notifications.setNotificationChannelAsync("donation_receipts", {
        name: "🙏 Donation Confirmations & 80G Receipts",
        description: "Official donation receipts, tax deduction certificates, and contribution acknowledgments",
        importance: Notifications.AndroidImportance.HIGH,
        lightColor: "#166534",
        sound: "default",
      });
    }

    let pushToken: string | null = null;
    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ||
        (Constants as any)?.easConfig?.projectId ||
        "d70fa887-d99f-4217-9dbd-dc089248db05";

      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId,
      });
      pushToken = tokenData.data;
    } catch (e: any) {
      console.log("[Notifications] Push token notice:", e?.message);
      return null;
    }

    if (!pushToken) return null;

    // Cache locally
    await setItem("prayas_expo_push_token", pushToken);

    // Send token to backend API
    await api.post("/push/register", {
      expoPushToken: pushToken,
      deviceType: Platform.OS.toUpperCase(),
      userId,
    });

    console.log("[Notifications] Registered Expo Push Token:", pushToken);
    return pushToken;
  } catch (error) {
    console.log("[Notifications] Push notifications not active:", error);
    return null;
  }
}

export async function sendLocalNotification(
  title: string,
  body: string,
  data?: Record<string, any>,
  channelId: string = "general_announcements"
): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    const prefs = await getNotificationPreferences();
    if (!prefs.pushEnabled) return;

    const { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") {
      const req = await Notifications.requestPermissionsAsync();
      if (req.status !== "granted") return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: prefs.soundEnabled ? "default" : undefined,
        ...(Platform.OS === "android" && channelId ? { channelId } : {}),
      },
      trigger: null,
    });
  } catch (e) {
    console.log("[Local Notification Log]", e);
  }
}
