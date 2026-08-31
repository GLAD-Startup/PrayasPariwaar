import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  hashPassword,
  signAccessToken,
  signRefreshToken,
  AUTH_COOKIE_OPTIONS,
  REFRESH_COOKIE_OPTIONS,
} from "@/lib/auth";
import { SignupSchema } from "@prayas/utils";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = SignupSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email, password, name, phone, role, bloodGroup } = validated.data;
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        name,
        phone: phone || null,
        role: (role as any) || "DONOR",
        bloodGroup: (bloodGroup as any) || null,
      },
    });

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

    // Set secure cookies for web clients
    response.cookies.set("prayas_access_token", accessToken, {
      ...AUTH_COOKIE_OPTIONS,
      maxAge: 15 * 60,
    });
    response.cookies.set("prayas_refresh_token", refreshToken, REFRESH_COOKIE_OPTIONS);

    return response;
  } catch (error: any) {
    console.error("[Signup API Error]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
