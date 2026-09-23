import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { sendExpoPushNotification } from "@/lib/expo-push";

// PATCH /api/equipment/requests/[id] - Update borrower request status
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
    const { status } = body;

    const request = await prisma.equipmentRequest.update({
      where: { id: params.id },
      data: {
        ...(status && { status }),
      },
      include: {
        equipment: {
          select: { name: true },
        },
      },
    });

    // Send push notification when medical equipment is approved or staged/active
    if (status === "APPROVED" || status === "ACTIVE") {
      try {
        let targetUserId = request.requesterId;
        if (!targetUserId && request.contactPhone) {
          const matchedUser = await prisma.user.findFirst({
            where: { phone: request.contactPhone },
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

        const equipName = request.equipment?.name || "Medical Equipment";
        const messageTitle = status === "APPROVED"
          ? "📦 Medical Equipment Request Approved"
          : "✅ Medical Equipment Staged & Active";
        const messageBody = status === "APPROVED"
          ? `Your loan request for ${equipName} has been approved and staged for dispatch/pickup at our Raman Reti Seva Desk.`
          : `Your ${equipName} is ready and staged for active seva care. Contact Seva Desk: +91 99270 81650 for assistance.`;

        if (tokens.length > 0) {
          await sendExpoPushNotification({
            to: tokens,
            title: messageTitle,
            body: messageBody,
            priority: "high",
            channelId: "general_announcements",
            data: {
              type: "EQUIPMENT_UPDATE",
              requestId: request.id,
              status,
              equipmentName: equipName,
            },
          });
        }

        if (targetUserId) {
          await prisma.userNotification.create({
            data: {
              userId: targetUserId,
              title: messageTitle,
              message: messageBody,
              type: "EQUIPMENT_UPDATE",
              isRead: false,
            },
          });
        }
      } catch (notifErr: any) {
        console.warn("[Equipment Approval Push Notice]", notifErr?.message);
      }
    }

    return NextResponse.json({ success: true, data: request });
  } catch (error: any) {
    console.error("[Equipment Request PATCH Error]", error);
    return NextResponse.json(
      { error: "Failed to update equipment request", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/equipment/requests/[id] - Delete request
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || authUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.equipmentRequest.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: "Request record deleted" });
  } catch (error: any) {
    console.error("[Equipment Request DELETE Error]", error);
    return NextResponse.json(
      { error: "Failed to delete request", details: error.message },
      { status: 500 }
    );
  }
}
