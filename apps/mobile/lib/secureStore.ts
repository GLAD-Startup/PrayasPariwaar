import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const ACCESS_TOKEN_KEY = "prayas_access_token";
const REFRESH_TOKEN_KEY = "prayas_refresh_token";
const USER_DATA_KEY = "prayas_user_data";

// ---------------------------------------------------------------------------
// Auth Listeners
// ---------------------------------------------------------------------------
type AuthListener = (user: any | null) => void;
const authListeners = new Set<AuthListener>();

export function subscribeToAuthChanges(listener: AuthListener): () => void {
  authListeners.add(listener);
  return () => {
    authListeners.delete(listener);
  };
}

function notifyAuthListeners(user: any | null) {
  authListeners.forEach((listener) => {
    try {
      listener(user);
    } catch (err) {
      console.warn("[Auth Listener Error]", err);
    }
  });
}

// ---------------------------------------------------------------------------
// Base64 & JWT Payload Decoder (Works in React Native, Web, Hermes)
// ---------------------------------------------------------------------------
export function decodeJwtPayload(token?: string | null): any | null {
  if (!token || typeof token !== "string") return null;
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    let base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4 !== 0) {
      base64 += "=";
    }

    if (typeof atob === "function") {
      try {
        const decoded = decodeURIComponent(
          Array.prototype.map
            .call(atob(base64), (c: string) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
        );
        return JSON.parse(decoded);
      } catch {
        return JSON.parse(atob(base64));
      }
    }

    // Pure JS base64 fallback if atob is unavailable
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    let output = "";
    for (
      let bc = 0, bs = 0, buffer, idx = 0;
      (buffer = base64.charAt(idx++));
      ~buffer && ((bs = bc % 4 ? bs * 64 + buffer : buffer), bc++ % 4)
        ? (output += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6))))
        : 0
    ) {
      buffer = chars.indexOf(buffer);
    }
    return JSON.parse(output);
  } catch (e) {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Resilient Dual-Storage Implementation (SecureStore + AsyncStorage fallback)
// ---------------------------------------------------------------------------

export async function setItem(key: string, value: string): Promise<void> {
  if (Platform.OS === "web") {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn("[Storage] LocalStorage unavailable", e);
    }
    try {
      await AsyncStorage.setItem(key, value);
    } catch {}
    return;
  }

  // Native: Always persist to AsyncStorage (no 2KB limit, immune to KeyStore locks)
  try {
    await AsyncStorage.setItem(key, value);
  } catch (e) {
    console.warn("[Storage] AsyncStorage setItem failed for key:", key, e);
  }

  // Mirror to SecureStore if possible
  try {
    await SecureStore.setItemAsync(key, value);
  } catch (e) {
    // If SecureStore fails (e.g. 2KB limit or KeyStore glitch), AsyncStorage has already stored it
    console.warn("[Storage] SecureStore setItemAsync failed for key:", key, e);
  }
}

export async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === "web") {
    try {
      const val = localStorage.getItem(key);
      if (val !== null) return val;
    } catch (e) {}
    try {
      return await AsyncStorage.getItem(key);
    } catch {
      return null;
    }
  }

  // Native: Try SecureStore first
  try {
    const val = await SecureStore.getItemAsync(key);
    if (val !== null && val !== undefined) {
      return val;
    }
  } catch (e) {
    console.warn("[Storage] SecureStore.getItemAsync threw, falling back to AsyncStorage:", key);
  }

  // Fallback to AsyncStorage
  try {
    return await AsyncStorage.getItem(key);
  } catch (e) {
    return null;
  }
}

export async function deleteItem(key: string): Promise<void> {
  if (Platform.OS === "web") {
    try {
      localStorage.removeItem(key);
    } catch (e) {}
    try {
      await AsyncStorage.removeItem(key);
    } catch {}
    return;
  }

  try {
    await AsyncStorage.removeItem(key);
  } catch {}

  try {
    await SecureStore.deleteItemAsync(key);
  } catch {}
}

export const removeItem = deleteItem;

// ---------------------------------------------------------------------------
// Convenience Token & User Helpers
// ---------------------------------------------------------------------------

export async function getAccessToken(): Promise<string | null> {
  return getItem(ACCESS_TOKEN_KEY);
}

export async function getRefreshToken(): Promise<string | null> {
  return getItem(REFRESH_TOKEN_KEY);
}

export async function saveAuthSession(
  accessToken: string,
  refreshToken: string,
  user?: any
): Promise<void> {
  // Execute sequentially to prevent Android KeyStore concurrency issues
  await setItem(ACCESS_TOKEN_KEY, accessToken);
  await setItem(REFRESH_TOKEN_KEY, refreshToken);

  let resolvedUser = user;
  if (!resolvedUser || (!resolvedUser.id && !resolvedUser.userId)) {
    const payload = decodeJwtPayload(accessToken);
    if (payload && (payload.userId || payload.id)) {
      resolvedUser = {
        id: payload.userId || payload.id,
        email: payload.email,
        name: payload.name,
        role: payload.role,
        bloodGroup: payload.bloodGroup,
      };
    }
  }

  if (resolvedUser) {
    await setItem(USER_DATA_KEY, JSON.stringify(resolvedUser));
  }

  notifyAuthListeners(resolvedUser || null);
}

export async function clearAuthSession(): Promise<void> {
  await deleteItem(ACCESS_TOKEN_KEY);
  await deleteItem(REFRESH_TOKEN_KEY);
  await deleteItem(USER_DATA_KEY);
  await deleteItem("prayas_my_volunteer_record");
  await deleteItem("prayas_user_avatar");

  notifyAuthListeners(null);
}

export async function getStoredUser(): Promise<any | null> {
  const data = await getItem(USER_DATA_KEY);
  if (data) {
    try {
      const parsed = JSON.parse(data);
      if (parsed && typeof parsed === "object" && (parsed.id || parsed.userId || parsed.email)) {
        return parsed;
      }
    } catch {}
  }

  // Fallback: If user data was lost but accessToken exists, reconstruct user from JWT
  const token = await getAccessToken();
  if (token) {
    const payload = decodeJwtPayload(token);
    if (payload && (payload.userId || payload.id)) {
      const reconstructedUser = {
        id: payload.userId || payload.id,
        email: payload.email,
        name: payload.name,
        role: payload.role,
        bloodGroup: payload.bloodGroup,
      };
      await setItem(USER_DATA_KEY, JSON.stringify(reconstructedUser)).catch(() => {});
      return reconstructedUser;
    }
  }

  return null;
}

export async function getAuthUser(): Promise<any | null> {
  return getStoredUser();
}
