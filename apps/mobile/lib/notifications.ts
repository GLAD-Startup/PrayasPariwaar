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

    const tokenData = await Notifications.getExpoPushTokenAsync();
    const pushToken = tokenData.data;

    // Send token to backend API
    await api.post("/push/register", {
      expoPushToken: pushToken,
      deviceType: Platform.OS.toUpperCase(),
      userId,
    });

    console.log("[Notifications] Registered Expo Push Token:", pushToken);
    return pushToken;
  } catch (error) {
    console.error("[Notifications] Error registering push notification:", error);
    return null;
  }
}
