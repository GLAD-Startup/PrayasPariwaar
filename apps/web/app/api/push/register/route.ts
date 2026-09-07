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
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token")?.trim();
    const userId = searchParams.get("userId")?.trim();

    // 1. If a userId is supplied, prevent cross-user deletion & user enumeration
    if (userId && userId !== authUser.userId && authUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: You cannot delete another user's push tokens" },
        { status: 403 }
      );
    }

    // 2. Specific push token deletion
    if (token) {
      const existing = await prisma.pushToken.findUnique({
        where: { expoPushToken: token },
        select: { id: true, userId: true },
      });

      if (existing?.userId && existing.userId !== authUser.userId && authUser.role !== "ADMIN") {
        return NextResponse.json(
          { error: "Forbidden: You cannot delete another user's push token" },
          { status: 403 }
        );
      }

      // Enforce ownership condition at the database operation level
      await prisma.pushToken.deleteMany({
        where: {
          expoPushToken: token,
          ...(authUser.role === "ADMIN"
            ? {}
            : {
                OR: [
                  { userId: authUser.userId },
                  { userId: null },
                ],
              }),
        },
      });

      return NextResponse.json({ success: true, message: "Push token unregistered" });
    }

    // 3. If userId parameter is provided (and authorized)
    if (userId) {
      const targetUserId = authUser.role === "ADMIN" ? userId : authUser.userId;
      await prisma.pushToken.deleteMany({
        where: { userId: targetUserId },
      });

      return NextResponse.json({ success: true, message: "Push tokens unregistered" });
    }

    // 4. Default: unregister all push tokens belonging to the authenticated user
    await prisma.pushToken.deleteMany({
      where: { userId: authUser.userId },
    });

    return NextResponse.json({ success: true, message: "Push tokens unregistered" });
  } catch (error: any) {
    console.error("[Push Unregister Error]", error);
    return NextResponse.json({ error: "Failed to unregister push token" }, { status: 500 });
  }
}
