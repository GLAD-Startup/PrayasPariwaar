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
      take: 20,
    });
    return NextResponse.json({ success: true, data: notifications });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

// POST /api/notifications - Broadcast notification via Expo Push and log to DB
export async function POST(req: Request) {
  try {
    const authUser = await getAuthUser(req);
    const body = await req.json();
    const { title, body: notifBody, type, targetBloodGroup, targetCity, relatedPostId } = body;

    if (!title || !notifBody) {
      return NextResponse.json({ error: "Title and body are required" }, { status: 400 });
    }

    // Query matching tokens
    const tokens = await prisma.pushToken.findMany({
      select: { expoPushToken: true },
      take: 500,
    });

    const tokenList = tokens.map((t) => t.expoPushToken);

    // Send push if tokens exist
    let pushResult = { success: false, count: 0 };
    if (tokenList.length > 0) {
      pushResult = await sendExpoPushNotification({
        to: tokenList,
        title,
        body: notifBody,
        priority: "high",
        data: {
          type: type || "GENERAL",
          targetBloodGroup,
          targetCity,
        },
      });
    }

    // Log to Notification table
    const record = await prisma.notification.create({
      data: {
        title,
        body: notifBody,
        type: type || "GENERAL",
        targetBloodGroup: targetBloodGroup && targetBloodGroup !== "ALL" ? (targetBloodGroup as BloodGroup) : null,
        targetCity: targetCity || null,
        relatedPostId: relatedPostId || null,
        recipientCount: tokenList.length,
        createdById: authUser?.userId || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Notification broadcasted to ${tokenList.length} devices and logged.`,
      data: record,
      pushResult,
    });
  } catch (error: any) {
    console.error("[Notifications POST Error]", error);
    return NextResponse.json({ error: "Failed to broadcast notification", details: error.message }, { status: 500 });
  }
}
