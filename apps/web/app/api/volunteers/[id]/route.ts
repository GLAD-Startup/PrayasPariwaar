import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { sendExpoPushNotification } from "@/lib/expo-push";

// PATCH /api/volunteers/[id] - Update status or details
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || (authUser.role !== "ADMIN" && authUser.role !== "EDITOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { status, notes } = body;

    const volunteer = await prisma.volunteer.update({
      where: { id: params.id },
      data: {
        ...(status && { status }),
      },
    });

    // Send push notification when volunteer is approved or activated
    if (status === "APPROVED" || status === "ACTIVE") {
      try {
        let targetUserId = volunteer.userId;
        if (!targetUserId) {
          const matchedUser = await prisma.user.findFirst({
            where: {
              OR: [
                { phone: volunteer.phone },
                { email: { equals: volunteer.email, mode: "insensitive" } },
              ],
            },
            select: { id: true },
          });
          if (matchedUser) {
            targetUserId = matchedUser.id;
          }
        }

        let tokens: string[] = [];
        if (targetUserId) {
          const tokenRecords = await prisma.pushToken.findMany({
            where: { userId: targetUserId },
            select: { expoPushToken: true },
          });
          tokens = tokenRecords.map((t) => t.expoPushToken).filter(Boolean);
        }

        if (tokens.length > 0) {
          await sendExpoPushNotification({
            to: tokens,
            title: "🎉 Volunteer Application Approved!",
            body: `Namaste ${volunteer.name}! Your volunteer application for Prayas Pariwaar has been approved. Welcome to the seva taskforce!`,
            priority: "high",
            channelId: "general_announcements",
            data: {
              type: "VOLUNTEER_UPDATE",
              volunteerId: volunteer.id,
              status,
            },
          });
        }

        if (targetUserId) {
          await prisma.userNotification.create({
            data: {
              userId: targetUserId,
              title: "🎉 Volunteer Application Approved!",
              message: `Namaste ${volunteer.name}! Your volunteer application for Prayas Pariwaar has been approved. Welcome to the seva taskforce!`,
              type: "VOLUNTEER_UPDATE",
              isRead: false,
            },
          });
        }
      } catch (notifErr: any) {
        console.warn("[Volunteer Approval Push Notice]", notifErr?.message);
      }
    }

    return NextResponse.json({ success: true, data: volunteer });
  } catch (error: any) {
    console.error("[Volunteer PATCH Error]", error);
    return NextResponse.json(
      { error: "Failed to update volunteer", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/volunteers/[id] - Delete application
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || authUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.volunteer.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: "Volunteer record deleted" });
  } catch (error: any) {
    console.error("[Volunteer DELETE Error]", error);
    return NextResponse.json(
      { error: "Failed to delete volunteer", details: error.message },
      { status: 500 }
    );
  }
}
