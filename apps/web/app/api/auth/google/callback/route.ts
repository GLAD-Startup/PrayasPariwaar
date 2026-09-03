import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  signAccessToken,
  signRefreshToken,
  hashPassword,
  AUTH_COOKIE_OPTIONS,
  REFRESH_COOKIE_OPTIONS,
  type AuthUserPayload,
} from "@/lib/auth";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error || !code) {
    const errorMsg = error || "No authorization code returned from Google.";
    const errorDeepLink = `prayas://oauth?error=${encodeURIComponent(errorMsg)}`;
    return new Response(
      `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0;url=${errorDeepLink}"/><script>window.location.replace("${errorDeepLink}");</script></head><body style="background:#FFFFFF;margin:0;"></body></html>`,
      {
        status: 302,
        headers: {
          Location: errorDeepLink,
          "Content-Type": "text/html; charset=utf-8",
        },
      }
    );
  }

  try {
    // Must match the exact redirect_uri sent by client and authorized in Google Cloud Console
    const redirectUri = "http://localhost:3005/api/auth/google/callback";
    const state = url.searchParams.get("state");
    let codeVerifier: string | undefined;
    if (state) {
      try {
        const parsedState = JSON.parse(decodeURIComponent(state));
        codeVerifier = parsedState.verifier;
      } catch {
        // Raw string state
        if (state.length >= 43) {
          codeVerifier = state;
        }
      }
    }

    const tokenParams: Record<string, string> = {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID || "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    };

    if (codeVerifier) {
      tokenParams.code_verifier = codeVerifier;
    }

    // 1. Exchange authorization code with Google for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(tokenParams),
    });

    const tokenData = await tokenRes.json();
    console.log("[Google Token Exchange Response]:", {
      status: tokenRes.status,
      tokenData,
      sentParams: {
        ...tokenParams,
        client_secret: tokenParams.client_secret ? "***" : "missing",
      },
    });

    if (!tokenRes.ok || !tokenData.access_token) {
      throw new Error(
        tokenData.error_description || tokenData.error || "Failed to exchange authorization code with Google."
      );
    }

    // 2. Fetch user profile from Google
    const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const googleUser = await userRes.json();

    if (!googleUser.email) {
      throw new Error("Unable to retrieve verified email address from Google.");
    }

    const email = googleUser.email.toLowerCase().trim();

    // 3. Upsert User in database
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      const passwordHash = await hashPassword(
        `oauth_google_${Math.random().toString(36).slice(2)}_${Date.now()}`
      );
      user = await prisma.user.create({
        data: {
          email,
          name: googleUser.name || email.split("@")[0] || "Prayas Member",
          avatarUrl: googleUser.picture || null,
          passwordHash,
          role: "USER",
          isActive: true,
        },
      });
    } else {
      if (!user.isActive) {
        throw new Error("Your account has been deactivated. Please contact support.");
      }
      if (!user.avatarUrl && googleUser.picture) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { avatarUrl: googleUser.picture },
        });
      }
    }

    // 4. Issue Prayas JWT tokens
    const tokenPayload: AuthUserPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      bloodGroup: user.bloodGroup,
    };

    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    const safeUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      role: user.role,
      bloodGroup: user.bloodGroup,
      city: user.city,
    };

    const safeUserData = encodeURIComponent(JSON.stringify(safeUser));
    const redirectDeepLink = `prayas://oauth?accessToken=${accessToken}&refreshToken=${refreshToken}&user=${safeUserData}`;

    return new Response(
      `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0;url=${redirectDeepLink}"/><script>window.location.replace("${redirectDeepLink}");</script></head><body style="background:#FFFFFF;margin:0;"></body></html>`,
      {
        status: 302,
        headers: {
          Location: redirectDeepLink,
          "Content-Type": "text/html; charset=utf-8",
          "Set-Cookie": `prayas_access_token=${accessToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`,
        },
      }
    );
  } catch (err: any) {
    console.error("[Google OAuth Callback Error]:", err);
    const errorDeepLink = `prayas://oauth?error=${encodeURIComponent(err?.message || "Authentication error")}`;
    return new Response(
      `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0;url=${errorDeepLink}"/><script>window.location.replace("${errorDeepLink}");</script></head><body style="background:#FFFFFF;margin:0;"></body></html>`,
      {
        status: 302,
        headers: {
          Location: errorDeepLink,
          "Content-Type": "text/html; charset=utf-8",
        },
      }
    );
  }
}
