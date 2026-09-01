import Constants from "expo-constants";
import { Platform } from "react-native";
import { getAccessToken, getRefreshToken, saveAuthSession, clearAuthSession } from "./secureStore";

export function getApiBaseUrl(): string {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl && !envUrl.includes("localhost") && !envUrl.includes("127.0.0.1")) {
    return envUrl;
  }

  // When running on a native mobile device or emulator in development:
  if (Platform.OS !== "web") {
    // 1. Extract host IP from Expo Metro bundler connection (works for both physical devices & emulators)
    const hostUri =
      Constants.expoConfig?.hostUri ||
      (Constants as any).manifest2?.extra?.expoClient?.hostUri ||
      (Constants as any).manifest?.debuggerHost;

    if (hostUri) {
      const hostIp = hostUri.split(":")[0];
      if (hostIp && hostIp !== "localhost" && hostIp !== "127.0.0.1") {
        return `http://${hostIp}:3000/api`;
      }
    }

    // 2. Android emulator loopback alias
    if (Platform.OS === "android") {
      return "http://10.0.2.2:3000/api";
    }
  }

  return envUrl || "http://localhost:3000/api";
}

export const API_BASE_URL = getApiBaseUrl();

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) {
    await clearAuthSession();
    return null;
  }

  try {
    const res = await fetch(`${getApiBaseUrl()}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      await clearAuthSession();
      return null;
    }

    const data = await res.json();
    if (data.accessToken && data.refreshToken) {
      await saveAuthSession(data.accessToken, data.refreshToken, data.user);
      return data.accessToken;
    }
  } catch (error) {
    console.error("[API Client] Failed to refresh token:", error);
  }

  await clearAuthSession();
  return null;
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<{ data?: T; error?: string; status: number }> {
  const baseUrl = getApiBaseUrl();
  const url = endpoint.startsWith("http") ? endpoint : `${baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (!options.skipAuth) {
    const token = await getAccessToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  try {
    let response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle 401 Unauthorized with automatic JWT refresh
    if (response.status === 401 && !options.skipAuth) {
      if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = refreshAccessToken().finally(() => {
          isRefreshing = false;
          refreshPromise = null;
        });
      }

      const newToken = await refreshPromise;
      if (newToken) {
        headers["Authorization"] = `Bearer ${newToken}`;
        response = await fetch(url, {
          ...options,
          headers,
        });
      }
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        error: data?.error || data?.message || `Request failed with status ${response.status}`,
        status: response.status,
      };
    }

    return { data, status: response.status };
  } catch (error: any) {
    console.error(`[API Error] ${options.method || "GET"} ${url}:`, error);
    return {
      error: error.message || "Network request failed. Please check your connection.",
      status: 0,
    };
  }
}

export const api = {
  get: <T = any>(endpoint: string, options?: FetchOptions) =>
    apiRequest<T>(endpoint, { ...options, method: "GET" }),
  post: <T = any>(endpoint: string, body?: any, options?: FetchOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),
  patch: <T = any>(endpoint: string, body?: any, options?: FetchOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),
  delete: <T = any>(endpoint: string, options?: FetchOptions) =>
    apiRequest<T>(endpoint, { ...options, method: "DELETE" }),
};

export function resolveImageUrl(url: any, fallback?: any): any {
  if (!url) return fallback || require("../assets/onboarding/education.jpg");
  if (typeof url === "object" && url.uri) return url;
  if (typeof url === "number") return url;
  if (typeof url !== "string") return fallback || require("../assets/onboarding/education.jpg");
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("file://") || url.startsWith("data:")) {
    return { uri: url };
  }
  if (url.startsWith("/")) {
    const baseUrl = getApiBaseUrl().replace(/\/api$/, "");
    return { uri: `${baseUrl}${url}` };
  }
  return fallback || require("../assets/onboarding/education.jpg");
}

export async function uploadFile(
  uri: string,
  fileName = "profile.jpg",
  mimeType = "image/jpeg"
): Promise<{ url?: string; error?: string }> {
  try {
    const formData = new FormData();
    formData.append("file", {
      uri,
      name: fileName,
      type: mimeType,
    } as any);

    const token = await getAccessToken();
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/upload`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      return { error: data?.error || "Failed to upload image" };
    }
    return { url: data?.url || data?.files?.[0]?.url };
  } catch (e: any) {
    return { error: e.message || "Upload network error" };
  }
}


