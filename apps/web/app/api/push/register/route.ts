import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { RegisterPushTokenSchema } from "@prayas/utils";

// POST /api/push/register - Register or update mobile push token
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = RegisterPushTokenSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { expoPushToken, deviceType } = validated.data;
    const authUser = await getAuthUser(req);
    const userId = validated.data.userId || authUser?.userId || null;

    const tokenRecord = await prisma.pushToken.upsert({
      where: { expoPushToken },
      update: {
        deviceType: deviceType || "MOBILE",
        userId: userId,
      },
      create: {
        expoPushToken,
        deviceType: deviceType || "MOBILE",
        userId: userId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Push token registered successfully",
      data: tokenRecord,
    });
  } catch (error: any) {
    console.error("[Push Register Error]", error);
    return NextResponse.json({ error: "Failed to register push token" }, { status: 500 });
  }
}
