import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

// PATCH /api/equipment/[id] - Update device info or status
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
    const { name, category, description, status, quantity, totalUnits, imageUrl } = body;

    const item = await prisma.medicalEquipment.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(category && { category }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        ...(quantity !== undefined || totalUnits !== undefined
          ? { quantity: Number(quantity ?? totalUnits) }
          : {}),
        ...(imageUrl !== undefined && { imageUrl }),
      },
    });

    return NextResponse.json({ success: true, data: item });
  } catch (error: any) {
    console.error("[Equipment PATCH Error]", error);
    return NextResponse.json(
      { error: "Failed to update equipment", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/equipment/[id] - Delete device
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || authUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.medicalEquipment.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: "Equipment record deleted" });
  } catch (error: any) {
    console.error("[Equipment DELETE Error]", error);
    return NextResponse.json(
      { error: "Failed to delete equipment", details: error.message },
      { status: 500 }
    );
  }
}
