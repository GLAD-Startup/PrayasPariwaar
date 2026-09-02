import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { RegisterPushTokenSchema } from "@prayas/utils";

// POST /api/push/register - Register or update mobile push token
export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (body.token && !body.expoPushToken) {
      body.expoPushToken = body.token;
    }
    const validated = RegisterPushTokenSchema.safeParse(body);


    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { expoPushToken, deviceType } = validated.data;
    const authUser = await getAuthUser(req);
    const rawUserId = validated.data.userId || authUser?.userId || null;

    let validUserId: string | null = null;
    if (rawUserId) {
      const userExists = await prisma.user.findUnique({
        where: { id: rawUserId },
        select: { id: true },
      });
      if (userExists) {
        validUserId = userExists.id;
      }
    }

    const tokenRecord = await prisma.pushToken.upsert({
      where: { expoPushToken },
      update: {
        deviceType: deviceType || "MOBILE",
        userId: validUserId,
        lastActiveAt: new Date(),
      },
      create: {
        expoPushToken,
        deviceType: deviceType || "MOBILE",
        userId: validUserId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Push token registered successfully",
      data: tokenRecord,
    });
  } catch (error: any) {
    console.error("[Push Register Error]", error);
    return NextResponse.json({ error: "Failed to register push token", details: error.message }, { status: 500 });
  }
}

// DELETE /api/push/register - Unregister push token when notifications are turned off
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    const userId = searchParams.get("userId");

    if (token) {
      await prisma.pushToken.deleteMany({
        where: { expoPushToken: token },
      });
    } else if (userId) {
      await prisma.pushToken.deleteMany({
        where: { userId },
      });
    }

    return NextResponse.json({ success: true, message: "Push token unregistered" });
  } catch (error: any) {
    console.error("[Push Unregister Error]", error);
    return NextResponse.json({ error: "Failed to unregister push token" }, { status: 500 });
  }
}
