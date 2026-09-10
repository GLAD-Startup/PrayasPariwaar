import { useEffect, useState, useCallback } from "react";
import { Linking } from "react-native";
import * as WebBrowser from "expo-web-browser";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { saveAuthSession, getAuthUser } from "./secureStore";
import { registerForPushNotificationsAsync } from "./notifications";
import { getApiBaseUrl } from "./api";
import { generateCodeVerifier, generateCodeChallenge } from "./pkce";

// Complete any pending auth sessions on web/native
WebBrowser.maybeCompleteAuthSession();

// Track in-flight and redeemed codes to prevent duplicate token exchange requests
const inFlightClientExchanges = new Map<string, Promise<any>>();
export const redeemedAuthCodes = new Set<string>();

const GOOGLE_WEB_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
  "258806422821-dme2jv73q5cn9ehk8d01i58324qp8n9r.apps.googleusercontent.com";

/**
 * Returns an authorized Google OAuth redirect URI.
 * Google OAuth strictly forbids private IP addresses (e.g. 192.168.x.x).
 * Uses the authorized Expo Auth Proxy or explicit environment variable.
 */
export function getGoogleRedirectUri(): string {
  if (process.env.EXPO_PUBLIC_GOOGLE_REDIRECT_URI) {
    return process.env.EXPO_PUBLIC_GOOGLE_REDIRECT_URI;
  }

  const base = getApiBaseUrl().replace(/\/api\/?$/, "");

  // If testing directly on localhost / 127.0.0.1
  if (base.includes("localhost") || base.includes("127.0.0.1")) {
    return "http://localhost:3005/api/auth/google/callback";
  }

  // For LAN devices / Expo development client, use the pre-authorized Expo Auth proxy:
  return "https://auth.expo.io/@glad-studio/prayas-sanstha";
}

/**
 * Exchanges a Google OAuth authorization code for session tokens with the backend.
 * Uses promise deduplication so concurrent calls (e.g. from WebBrowser & deep link)
 * share a single network request.
 */
export async function redeemGoogleAuthCode(code: string, state?: string): Promise<any> {
  if (!code) throw new Error("No authorization code provided.");

  // 1. If code was already redeemed, check if user session exists
  if (redeemedAuthCodes.has(code)) {
    const user = await getAuthUser().catch(() => null);
    if (user?.id) return user;
  }

  // 2. If code is currently in flight, return the existing promise
  if (inFlightClientExchanges.has(code)) {
    return inFlightClientExchanges.get(code)!;
  }

  // 3. Start code exchange
  const exchangePromise = (async () => {
    try {
      redeemedAuthCodes.add(code);
      const redirectUri = getGoogleRedirectUri();
      const storedVerifier = await AsyncStorage.getItem("oauth_code_verifier");

      const queryParams = new URLSearchParams({
        code,
        redirect_uri: redirectUri,
        format: "json",
      });

      if (state) {
        queryParams.append("state", state);
      }
      if (storedVerifier) {
        queryParams.append("code_verifier", storedVerifier);
      }

      const exchangeUrl = `${getApiBaseUrl()}/auth/google/callback?${queryParams.toString()}`;

      const res = await fetch(exchangeUrl, {
        headers: {
          Accept: "application/json",
        },
      });

      const data = await res.json();

      if (!res.ok || !data.success || !data.accessToken) {
        // If server failed but user is already logged in, resolve cleanly
        const existingUser = await getAuthUser().catch(() => null);
        if (existingUser?.id) {
          return existingUser;
        }
        throw new Error(data.error || "Failed to exchange Google authorization code.");
      }

      await AsyncStorage.removeItem("oauth_code_verifier").catch(() => {});
      await saveAuthSession(data.accessToken, data.refreshToken, data.user);

      if (data.user?.id) {
        registerForPushNotificationsAsync(data.user.id);
      }

      return data.user;
    } catch (err: any) {
      const existingUser = await getAuthUser().catch(() => null);
      if (existingUser?.id) {
        return existingUser;
      }
      throw err;
    } finally {
      inFlightClientExchanges.delete(code);
    }
  })();

  inFlightClientExchanges.set(code, exchangePromise);
  return exchangePromise;
}

export interface UseGoogleAuthOptions {
  onSuccess?: (user: any) => void;
  onError?: (errorMessage: string) => void;
}

export function useGoogleAuth(options: UseGoogleAuthOptions = {}) {
  const [loading, setLoading] = useState(false);

  const parseAuthDeepLink = useCallback(
    async (url: string) => {
      try {
        if (!url) return false;

        if (!url.startsWith("prayas://")) {
          return false;
        }

        const rawParams = url.includes("?")
          ? url.split("?")[1]
          : url.includes("#")
          ? url.split("#")[1]
          : "";

        if (!rawParams) return false;

        const params: Record<string, string> = {};
        const pairs = rawParams.split("&");
        for (const pair of pairs) {
          const [k, v] = pair.split("=");
          if (k && v) {
            params[decodeURIComponent(k)] = decodeURIComponent(v);
          }
        }

        if (params.error) {
          setLoading(false);
          const user = await getAuthUser().catch(() => null);
          if (user?.id) {
            options.onSuccess?.(user);
            return true;
          }
          options.onError?.(params.error);
          return true;
        }

        // Direct tokens returned from callback
        if (params.accessToken && params.refreshToken) {
          let user: any = null;
          if (params.user) {
            try {
              user = JSON.parse(decodeURIComponent(params.user));
            } catch {
              try {
                user = JSON.parse(params.user);
              } catch {
                user = null;
              }
            }
          }

          await saveAuthSession(params.accessToken, params.refreshToken, user);

          if (user?.id) {
            registerForPushNotificationsAsync(user.id);
          }

          setLoading(false);
          options.onSuccess?.(user);
          return true;
        }

        // If authorization code is returned, exchange it with backend
        if (params.code) {
          try {
            const user = await redeemGoogleAuthCode(params.code, params.state);
            setLoading(false);
            if (user?.id) {
              options.onSuccess?.(user);
            }
            return true;
          } catch (err: any) {
            setLoading(false);
            const user = await getAuthUser().catch(() => null);
            if (user?.id) {
              options.onSuccess?.(user);
              return true;
            }
            options.onError?.(err?.message || "Failed to process authentication.");
            return false;
          }
        }

        return false;
      } catch (err: any) {
        setLoading(false);
        // If user is already authenticated, gracefully treat as success
        const user = await getAuthUser().catch(() => null);
        if (user?.id) {
          options.onSuccess?.(user);
          return true;
        }
        options.onError?.(err?.message || "Failed to process authentication.");
        return false;
      }
    },
    [options]
  );

  useEffect(() => {
    const handleUrlEvent = (event: { url: string }) => {
      if (event?.url) {
        parseAuthDeepLink(event.url);
      }
    };

    const sub = Linking.addEventListener("url", handleUrlEvent);

    Linking.getInitialURL().then((url) => {
      if (url) parseAuthDeepLink(url);
    });

    return () => {
      sub.remove();
    };
  }, [parseAuthDeepLink]);

  const signInWithGoogle = async () => {
    setLoading(true);

    try {
      const redirectUri = getGoogleRedirectUri();
      const codeVerifier = generateCodeVerifier();
      const codeChallenge = generateCodeChallenge(codeVerifier);
      const state = encodeURIComponent(JSON.stringify({ verifier: codeVerifier }));
      await AsyncStorage.setItem("oauth_code_verifier", codeVerifier).catch(() => {});

      let authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
        GOOGLE_WEB_CLIENT_ID
      )}&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&response_type=code&scope=openid%20profile%20email&code_challenge=${encodeURIComponent(
        codeChallenge
      )}&code_challenge_method=S256&state=${state}&prompt=select_account`;

      // If using the Expo Auth Proxy, wrap through the /start endpoint with returnUrl
      if (redirectUri.includes("auth.expo.io")) {
        const startParams = new URLSearchParams({
          authUrl,
          returnUrl: "prayas://oauth",
        });
        authUrl = `${redirectUri}/start?${startParams.toString()}`;
      }

      // Open seamless in-app authentication session
      const result = await WebBrowser.openAuthSessionAsync(authUrl, "prayas://");

      if (result.type === "success" && result.url) {
        await parseAuthDeepLink(result.url);
      } else {
        setLoading(false);
        const user = await getAuthUser().catch(() => null);
        if (user?.id) {
          options.onSuccess?.(user);
        }
      }
    } catch (err: any) {
      setLoading(false);
      const user = await getAuthUser().catch(() => null);
      if (user?.id) {
        options.onSuccess?.(user);
      } else {
        options.onError?.(err?.message || "Failed to launch Google sign-in.");
      }
    }
  };

  return {
    signInWithGoogle,
    loading,
    isReady: true,
  };
}
