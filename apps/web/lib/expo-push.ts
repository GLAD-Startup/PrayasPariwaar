export interface ExpoPushMessage {
  to: string | string[];
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: "default" | null;
  priority?: "default" | "normal" | "high";
  channelId?: string;
  badge?: number;
}

export interface ExpoPushTicket {
  id?: string;
  status: "ok" | "error";
  message?: string;
  details?: {
    error?: "DeviceNotRegistered" | "InvalidCredentials" | "MessageTooBig" | "MessageRateExceeded";
  };
}

export function isExpoPushToken(token: string): boolean {
  return typeof token === "string" && (token.startsWith("ExponentPushToken[") || token.startsWith("ExpoPushToken["));
}

/**
 * Dispatches push notifications to Expo Push API in batches of 100
 */
export async function sendExpoPushNotification(
  messages: ExpoPushMessage | ExpoPushMessage[]
): Promise<{ success: boolean; count: number; error?: string }> {
  const messageList = Array.isArray(messages) ? messages : [messages];
  if (messageList.length === 0) {
    return { success: true, count: 0 };
  }

  // Filter valid recipients
  const flattened: ExpoPushMessage[] = [];
  for (const msg of messageList) {
    const recipients = Array.isArray(msg.to) ? msg.to : [msg.to];
    const validTokens = recipients.filter(isExpoPushToken);
    if (validTokens.length > 0) {
      flattened.push({
        ...msg,
        to: validTokens,
        sound: msg.sound ?? "default",
        priority: msg.priority ?? "high",
      });
    }
  }

  if (flattened.length === 0) {
    console.warn("[ExpoPush] No valid Expo push tokens found among recipients.");
    return { success: true, count: 0 };
  }

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
      "Accept-Encoding": "gzip, deflate",
    };

    if (process.env.EXPO_ACCESS_TOKEN) {
      headers["Authorization"] = `Bearer ${process.env.EXPO_ACCESS_TOKEN}`;
    }

    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers,
      body: JSON.stringify(flattened),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[ExpoPush] HTTP error from Expo Push API:", response.status, errorText);
      return { success: false, count: 0, error: errorText };
    }

    const data = await response.json();
    console.log(`[ExpoPush] Successfully sent ${flattened.length} notifications:`, data);
    return { success: true, count: flattened.length };
  } catch (error: any) {
    console.error("[ExpoPush] Failed to dispatch notifications:", error);
    return { success: false, count: 0, error: error.message };
  }
}
