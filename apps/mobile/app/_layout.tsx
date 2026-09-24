import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef } from "react";
import * as SplashScreen from "expo-splash-screen";
import * as Notifications from "expo-notifications";
import { registerForPushNotificationsAsync } from "../lib/notifications";
import { getAuthUser } from "../lib/secureStore";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const router = useRouter();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    // Attempt push notification registration with stored user credentials on startup
    getAuthUser()
      .then((user) => registerForPushNotificationsAsync(user?.id))
      .catch(() => registerForPushNotificationsAsync())
      .finally(() => {
        SplashScreen.hideAsync().catch(() => {});
      });

    // Listen for notification taps and navigate accordingly
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      try {
        const data = response.notification.request.content.data || {};
        if (data.url && typeof data.url === "string") {
          router.push(data.url as any);
        } else if (data.slug) {
          router.push(`/blog/${data.slug}` as any);
        } else if (data.type === "donation" || data.type === "DONATION_RECEIPT") {
          router.push("/my-donations" as any);
        } else if (data.type === "medical_request" || data.type === "EQUIPMENT_UPDATE") {
          router.push("/medical-request" as any);
        } else if (data.type === "volunteer_status" || data.type === "VOLUNTEER_UPDATE") {
          router.push("/volunteer-form" as any);
        } else if (data.type === "BLOOD_REQUEST") {
          router.push("/blood-request" as any);
        } else {
          router.push("/notifications" as any);
        }
      } catch (err) {
        console.warn("[Notification Tap Navigation]", err);
      }
    });

    return () => {
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [router]);

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#FFFFFF" },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/signup" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/complete-profile" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/forgot-password" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="seva/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="blog/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="gallery" options={{ headerShown: false }} />
        <Stack.Screen name="volunteer-form" options={{ headerShown: false }} />
        <Stack.Screen name="contact-us" options={{ headerShown: false }} />
        <Stack.Screen name="my-donations" options={{ headerShown: false }} />
        <Stack.Screen name="blood-donor-registration" options={{ headerShown: false }} />
        <Stack.Screen name="notifications" options={{ headerShown: false }} />
        <Stack.Screen name="blood-request" options={{ headerShown: false }} />
        <Stack.Screen name="medical-request" options={{ headerShown: false }} />
        <Stack.Screen name="donation-success" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
