import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { sendVolunteerStatusNotification } from "@/lib/notifications-service";

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

    // Send push notification for all volunteer status changes via central notification hub
    if (status) {
      sendVolunteerStatusNotification(volunteer, status).catch((err) => {
        console.warn("[Volunteer PATCH] Status push failed:", err);
      });
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
