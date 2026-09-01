import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { api } from "./api";

// Configure local notification display behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotificationsAsync(userId?: string): Promise<string | null> {
  if (Platform.OS === "web") {
    console.log("[Notifications] Push notifications are not supported on web.");
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

    // Configure Android notification channels (Android 8.0+)
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("emergency_alerts", {
        name: "🚨 Emergency Seva & Blood Alerts",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#1D4ED8",
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        sound: "default",
      });

      await Notifications.setNotificationChannelAsync("general_announcements", {
        name: "📢 Prayas Seva Updates",
        importance: Notifications.AndroidImportance.HIGH,
        lightColor: "#1D4ED8",
        sound: "default",
      });
    }

    let pushToken: string | null = null;
    try {
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: "c14d5e45-50f8-43f9-bd25-2a77cbd2aee5",
      });
      pushToken = tokenData.data;
    } catch (e: any) {
      console.log("[Notifications] Push token notice:", e?.message);
      return null;
    }

    if (!pushToken) return null;

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
  data?: Record<string, any>
): Promise<void> {
  if (Platform.OS === "web") return;
  try {
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
        sound: true,
      },
      trigger: null,
    });
  } catch (e) {
    console.log("[Local Notification Log]", e);
  }
}

