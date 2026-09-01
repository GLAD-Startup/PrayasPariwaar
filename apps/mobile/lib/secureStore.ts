import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const ACCESS_TOKEN_KEY = "prayas_access_token";
const REFRESH_TOKEN_KEY = "prayas_refresh_token";
const USER_DATA_KEY = "prayas_user_data";

export async function setItem(key: string, value: string): Promise<void> {
  if (Platform.OS === "web") {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn("LocalStorage unavailable", e);
    }
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

export async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === "web") {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }
  return await SecureStore.getItemAsync(key);
}

export async function deleteItem(key: string): Promise<void> {
  if (Platform.OS === "web") {
    try {
      localStorage.removeItem(key);
    } catch (e) {}
    return;
  }
  await SecureStore.deleteItemAsync(key);
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
  await Promise.all([
    setItem(ACCESS_TOKEN_KEY, accessToken),
    setItem(REFRESH_TOKEN_KEY, refreshToken),
    user ? setItem(USER_DATA_KEY, JSON.stringify(user)) : Promise.resolve(),
  ]);
}

export async function clearAuthSession(): Promise<void> {
  await Promise.all([
    deleteItem(ACCESS_TOKEN_KEY),
    deleteItem(REFRESH_TOKEN_KEY),
    deleteItem(USER_DATA_KEY),
    deleteItem("prayas_my_volunteer_record"),
    deleteItem("prayas_user_avatar"),
  ]);
}

export async function getStoredUser(): Promise<any | null> {
  const data = await getItem(USER_DATA_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export async function getAuthUser(): Promise<any | null> {
  return getStoredUser();
}
