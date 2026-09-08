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

interface GoogleTokenInfo {
  aud?: string;
  email?: string;
  email_verified?: string | boolean;
  name?: string;
  picture?: string;
  sub?: string;
  error_description?: string;
}

interface GoogleUserInfo {
  sub?: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
  error?: { message: string };
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { idToken, accessToken: rawAccessToken } = body;

    if (!idToken && !rawAccessToken) {
      return NextResponse.json(
        { error: "Google idToken or accessToken is required." },
        { status: 400 }
      );
    }

    let verifiedEmail: string | undefined;
    let verifiedName: string | undefined;
    let verifiedPicture: string | undefined;

    // 1. Verify via ID Token if available
    if (idToken) {
      const googleRes = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`
      );
      if (googleRes.ok) {
        const tokenInfo: GoogleTokenInfo = await googleRes.json();
        if (tokenInfo.email && (tokenInfo.email_verified === "true" || tokenInfo.email_verified === true)) {
          verifiedEmail = tokenInfo.email.toLowerCase().trim();
          verifiedName = tokenInfo.name;
          verifiedPicture = tokenInfo.picture;
        }
      }
    }

    // 2. Fallback to Access Token verification / userinfo if ID token verification didn't resolve
    if (!verifiedEmail && rawAccessToken) {
      const userinfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: {
          Authorization: `Bearer ${rawAccessToken}`,
        },
      });
      if (userinfoRes.ok) {
        const userInfo: GoogleUserInfo = await userinfoRes.json();
        if (userInfo.email) {
          verifiedEmail = userInfo.email.toLowerCase().trim();
          verifiedName = userInfo.name;
          verifiedPicture = userInfo.picture;
        }
      }
    }

    if (!verifiedEmail) {
      return NextResponse.json(
        { error: "Google authentication failed. Invalid or expired Google token." },
        { status: 401 }
      );
    }

    // 3. Find or Create User in database
    let user = await prisma.user.findUnique({
      where: { email: verifiedEmail },
    });

    if (!user) {
      // Create new user with random hashed password
      const randomPassword = `oauth_google_${Math.random().toString(36).slice(2)}_${Date.now()}`;
      const passwordHash = await hashPassword(randomPassword);

      user = await prisma.user.create({
        data: {
          email: verifiedEmail,
          name: verifiedName || verifiedEmail.split("@")[0] || "Prayas Member",
          avatarUrl: verifiedPicture || null,
          passwordHash,
          role: "USER",
          isActive: true,
        },
      });
    } else {
      // Check if user is active
      if (!user.isActive) {
        return NextResponse.json(
          { error: "Your account has been deactivated. Please contact support." },
          { status: 403 }
        );
      }

      // Update avatar if none exists and Google provides one
      if (!user.avatarUrl && verifiedPicture) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { avatarUrl: verifiedPicture },
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

    const response = NextResponse.json({
      success: true,
      message: "Google sign-in successful",
      accessToken,
      refreshToken,
      user: safeUser,
    });

    // 5. Attach secure cookies for web session
    response.cookies.set("prayas_access_token", accessToken, AUTH_COOKIE_OPTIONS);
    response.cookies.set("prayas_refresh_token", refreshToken, REFRESH_COOKIE_OPTIONS);

    return response;
  } catch (error: any) {
    console.error("[Auth Google API Error]:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during Google sign-in." },
      { status: 500 }
    );
  }
}
