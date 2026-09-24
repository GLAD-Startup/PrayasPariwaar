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
 * Dispatches push notifications to Expo Push API.
 * Automatically expands array recipients and isolates each token so that
 * tokens belonging to different Expo experience IDs or accounts do not conflict
 * or block each other (PUSH_TOO_MANY_EXPERIENCE_IDS).
 */
export async function sendExpoPushNotification(
  messages: ExpoPushMessage | ExpoPushMessage[]
): Promise<{ success: boolean; count: number; error?: string }> {
  const messageList = Array.isArray(messages) ? messages : [messages];
  if (messageList.length === 0) {
    return { success: true, count: 0 };
  }

  // Deconstruct into individual single-token messages
  const individualMessages: (Omit<ExpoPushMessage, "to"> & { to: string })[] = [];
  for (const msg of messageList) {
    const recipients = Array.isArray(msg.to) ? msg.to : [msg.to];
    const validTokens = recipients.filter(isExpoPushToken);
    for (const token of validTokens) {
      individualMessages.push({
        ...msg,
        to: token,
        sound: msg.sound ?? "default",
        priority: msg.priority ?? "high",
      });
    }
  }

  if (individualMessages.length === 0) {
    console.warn("[ExpoPush] No valid Expo push tokens found among recipients.");
    return { success: true, count: 0 };
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "Accept-Encoding": "gzip, deflate",
  };

  if (process.env.EXPO_ACCESS_TOKEN) {
    headers["Authorization"] = `Bearer ${process.env.EXPO_ACCESS_TOKEN}`;
  }

  let successCount = 0;
  let lastError: string | undefined;

  // Function to send a single message payload
  const sendSingle = async (msg: typeof individualMessages[0]): Promise<boolean> => {
    try {
      const response = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers,
        body: JSON.stringify(msg),
      });

      if (!response.ok) {
        const text = await response.text();
        console.warn(`[ExpoPush] HTTP error for ${msg.to.slice(0, 20)}:`, text);
        lastError = text;
        return false;
      }

      const resJson = await response.json();
      const ticket = resJson.data;

      if (ticket?.status === "ok") {
        return true;
      } else if (ticket?.status === "error") {
        console.warn(`[ExpoPush] Delivery error for ${msg.to.slice(0, 20)}:`, ticket.message, ticket.details);
        lastError = ticket.message;
        return false;
      }
      return true;
    } catch (err: any) {
      console.warn(`[ExpoPush] Network error for ${msg.to.slice(0, 20)}:`, err?.message);
      lastError = err?.message;
      return false;
    }
  };

  // Dispatch all with controlled concurrency (chunks of 10)
  const CHUNK_SIZE = 10;
  for (let i = 0; i < individualMessages.length; i += CHUNK_SIZE) {
    const chunk = individualMessages.slice(i, i + CHUNK_SIZE);
    const results = await Promise.allSettled(chunk.map((msg) => sendSingle(msg)));
    for (const r of results) {
      if (r.status === "fulfilled" && r.value) {
        successCount++;
      }
    }
  }

  console.log(`[ExpoPush] Completed dispatch. Sent ${successCount}/${individualMessages.length} messages.`);
  return {
    success: successCount > 0,
    count: successCount,
    error: successCount === 0 && individualMessages.length > 0 ? lastError : undefined,
  };
}
