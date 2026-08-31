import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  verifyPassword,
  signAccessToken,
  signRefreshToken,
  AUTH_COOKIE_OPTIONS,
  REFRESH_COOKIE_OPTIONS,
} from "@/lib/auth";
import { LoginSchema } from "@prayas/utils";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = LoginSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email, password } = validated.data;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const payload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role as any,
      bloodGroup: user.bloodGroup,
    };

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        bloodGroup: user.bloodGroup,
        phone: user.phone,
      },
      accessToken,
      refreshToken,
    });

    // Set secure HTTP-only cookies for web clients
    response.cookies.set("prayas_access_token", accessToken, {
      ...AUTH_COOKIE_OPTIONS,
      maxAge: 15 * 60, // 15 mins
    });

    response.cookies.set("prayas_refresh_token", refreshToken, REFRESH_COOKIE_OPTIONS);

    return response;
  } catch (error: any) {
    console.error("[Login API Error]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
