import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import {
  verifyRefreshToken,
  signAccessToken,
  signRefreshToken,
  AUTH_COOKIE_OPTIONS,
  REFRESH_COOKIE_OPTIONS,
} from "@/lib/auth";

export async function POST(req: Request) {
  try {
    let token: string | undefined;

    // Check request body
    try {
      const body = await req.json();
      token = body?.refreshToken;
    } catch {
      // Body may be empty if called from web with cookies
    }

    // Check cookies
    if (!token) {
      const cookieStore = cookies();
      token = cookieStore.get("prayas_refresh_token")?.value;
    }

    if (!token) {
      return NextResponse.json({ error: "Refresh token is missing" }, { status: 401 });
    }

    const payload = verifyRefreshToken(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: "Invalid or expired refresh token" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User no longer exists" }, { status: 401 });
    }

    const newPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role as any,
      bloodGroup: user.bloodGroup,
    };

    const newAccessToken = signAccessToken(newPayload);
    const newRefreshToken = signRefreshToken(newPayload);

    const response = NextResponse.json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        bloodGroup: user.bloodGroup,
      },
    });

    response.cookies.set("prayas_access_token", newAccessToken, {
      ...AUTH_COOKIE_OPTIONS,
      maxAge: 15 * 60,
    });
    response.cookies.set("prayas_refresh_token", newRefreshToken, REFRESH_COOKIE_OPTIONS);

    return response;
  } catch (error: any) {
    console.error("[Refresh API Error]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
