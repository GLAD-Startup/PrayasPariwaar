import { useEffect, useState, useCallback } from "react";
import { Linking } from "react-native";
import { saveAuthSession } from "./secureStore";
import { registerForPushNotificationsAsync } from "./notifications";
import { getApiBaseUrl } from "./api";
import { generateCodeVerifier, generateCodeChallenge } from "./pkce";

const GOOGLE_WEB_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
  "258806422821-dme2jv73q5cn9ehk8d01i58324qp8n9r.apps.googleusercontent.com";

function getGoogleRedirectUri(): string {
  const base = getApiBaseUrl().replace(/\/api\/?$/, "");
  return `${base}/api/auth/google/callback`;
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
          options.onError?.(params.error);
          return true;
        }

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

        return false;
      } catch (err: any) {
        setLoading(false);
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
      const codeVerifier = generateCodeVerifier();
      const codeChallenge = generateCodeChallenge(codeVerifier);
      const state = encodeURIComponent(JSON.stringify({ verifier: codeVerifier }));

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
        GOOGLE_WEB_CLIENT_ID
      )}&redirect_uri=${encodeURIComponent(
        getGoogleRedirectUri()
      )}&response_type=code&scope=openid%20profile%20email&code_challenge=${encodeURIComponent(
        codeChallenge
      )}&code_challenge_method=S256&state=${state}&prompt=select_account`;

      const canOpen = await Linking.canOpenURL(authUrl);
      if (canOpen) {
        await Linking.openURL(authUrl);
      } else {
        setLoading(false);
        options.onError?.("Unable to open browser for Google sign-in.");
      }
    } catch (err: any) {
      setLoading(false);
      options.onError?.(err?.message || "Failed to launch Google sign-in.");
    }
  };

  return {
    signInWithGoogle,
    loading,
    isReady: true,
  };
}
