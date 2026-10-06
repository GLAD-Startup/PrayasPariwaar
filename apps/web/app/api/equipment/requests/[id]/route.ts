import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { sendMedicalRequestStatusNotification } from "@/lib/notifications-service";

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

    // Send push notification for all status changes via central notification hub
    if (status) {
      sendMedicalRequestStatusNotification(request, status).catch((err) => {
        console.warn("[Equipment Request PATCH] Status push failed:", err);
      });
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
