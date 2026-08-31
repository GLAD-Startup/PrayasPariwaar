import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { UpdateBloodRequestStatusSchema } from "@prayas/utils";

// PATCH /api/blood-requests/[id] - Update status
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || (authUser.role !== "ADMIN" && authUser.role !== "EDITOR")) {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    const body = await req.json();
    const validated = UpdateBloodRequestStatusSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const updated = await prisma.bloodRequest.update({
      where: { id: params.id },
      data: { status: validated.data.status },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("[BloodRequest PATCH Error]", error);
    return NextResponse.json({ error: "Failed to update blood request" }, { status: 500 });
  }
}

// DELETE /api/blood-requests/[id] - Delete request
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || authUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.bloodRequest.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: "Blood request deleted successfully" });
  } catch (error: any) {
    console.error("[BloodRequest DELETE Error]", error);
    return NextResponse.json({ error: "Failed to delete blood request" }, { status: 500 });
  }
}
