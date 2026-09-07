import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { sendExpoPushNotification } from "@/lib/expo-push";
import { BloodGroup } from "@prisma/client";

// GET /api/notifications - List past broadcast notifications
export async function GET() {
  try {
    const notifications = await prisma.notification.findMany({
      include: { createdBy: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 30,
    });
    return NextResponse.json({ success: true, data: notifications });
  } catch (error: any) {
    console.error("[Notifications GET Error]", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

// POST /api/notifications - Broadcast notification via Expo Push, log to DB and save user notifications
export async function POST(req: Request) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json(
        { error: "Unauthorized. Authentication required." },
        { status: 401 }
      );
    }

    if (authUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden. Admin privileges required." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { title, body: notifBody, type, targetBloodGroup, targetCity, relatedPostId } = body;

    if (!title || !notifBody) {
      return NextResponse.json({ error: "Title and body are required" }, { status: 400 });
    }

    // 1. Query matching device push tokens
    const whereCondition: any = {};
    if (targetBloodGroup && targetBloodGroup !== "ALL") {
      whereCondition.user = { bloodGroup: targetBloodGroup };
    }
    if (targetCity && targetCity !== "ALL") {
      whereCondition.user = {
        ...(whereCondition.user || {}),
        city: { contains: targetCity, mode: "insensitive" },
      };
    }

    let pushTokens = await prisma.pushToken.findMany({
      where: Object.keys(whereCondition).length > 0 ? whereCondition : undefined,
      select: { expoPushToken: true, userId: true },
      take: 1000,
    });

    // If targeted search returned 0 tokens, fallback to all registered devices so message delivers
    if (pushTokens.length === 0) {
      pushTokens = await prisma.pushToken.findMany({
        select: { expoPushToken: true, userId: true },
        take: 1000,
      });
    }

    const tokenList = Array.from(new Set(pushTokens.map((t) => t.expoPushToken).filter(Boolean)));

    // 2. Select appropriate Android channel & priority
    const isEmergency = type === "BLOOD_REQUEST" || title.includes("EMERGENCY") || title.includes("🚨");
    const channelId = isEmergency ? "emergency_alerts" : "general_announcements";

    // 3. Dispatch real Push Notification to Expo Push API
    let pushResult = { success: false, count: 0 };
    if (tokenList.length > 0) {
      pushResult = await sendExpoPushNotification({
        to: tokenList,
        title,
        body: notifBody,
        priority: "high",
        channelId,
        sound: "default",
        data: {
          type: type || "GENERAL",
          targetBloodGroup,
          targetCity,
          relatedPostId,
          timestamp: new Date().toISOString(),
        },
      });
    }

    // 4. Validate createdById foreign key
    let validCreatorId: string | null = null;
    if (authUser.userId) {
      const userExists = await prisma.user.findUnique({
        where: { id: authUser.userId },
        select: { id: true },
      });
      if (userExists) {
        validCreatorId = userExists.id;
      }
    }

    // 5. Log to Notification History table
    const record = await prisma.notification.create({
      data: {
        title,
        body: notifBody,
        type: type || "GENERAL",
        targetBloodGroup: targetBloodGroup && targetBloodGroup !== "ALL" ? (targetBloodGroup as BloodGroup) : null,
        targetCity: targetCity && targetCity !== "ALL" ? targetCity : null,
        relatedPostId: relatedPostId || null,
        recipientCount: tokenList.length,
        createdById: validCreatorId,
      },
    });

    // 6. Also create UserNotification records for in-app notification center
    const userIds = Array.from(new Set(pushTokens.filter((t) => t.userId).map((t) => t.userId as string)));
    if (userIds.length > 0) {
      await prisma.userNotification.createMany({
        data: userIds.map((uid) => ({
          userId: uid,
          title,
          message: notifBody,
          type: (type as any) || "GENERAL",
          isRead: false,
        })),
        skipDuplicates: true,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Notification broadcasted to ${tokenList.length} device(s) and logged to database.`,
      data: record,
      pushResult,
    });
  } catch (error: any) {
    console.error("[Notifications POST Error]", error);
    return NextResponse.json({ error: "Failed to broadcast notification", details: error.message }, { status: 500 });
  }
}
