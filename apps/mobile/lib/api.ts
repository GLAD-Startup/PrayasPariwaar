import { getAccessToken, getRefreshToken, saveAuthSession, clearAuthSession } from "./secureStore";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api";

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
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
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
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

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
  if (typeof url !== "string") return url;
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return { uri: url };
  }
  if (url.startsWith("/")) {
    const baseUrl = (process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api").replace(/\/api$/, "");
    return { uri: `${baseUrl}${url}` };
  }
  return fallback || require("../assets/onboarding/education.jpg");
}

