import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { BloodGroup } from "@prisma/client";

function formatBloodGroup(bg: string): BloodGroup | undefined {
  const map: Record<string, BloodGroup> = {
    "A+": "A_POSITIVE",
    "A-": "A_NEGATIVE",
    "B+": "B_POSITIVE",
    "B-": "B_NEGATIVE",
    "AB+": "AB_POSITIVE",
    "AB-": "AB_NEGATIVE",
    "O+": "O_POSITIVE",
    "O-": "O_NEGATIVE",
    "A_POSITIVE": "A_POSITIVE",
    "A_NEGATIVE": "A_NEGATIVE",
    "B_POSITIVE": "B_POSITIVE",
    "B_NEGATIVE": "B_NEGATIVE",
    "AB_POSITIVE": "AB_POSITIVE",
    "AB_NEGATIVE": "AB_NEGATIVE",
    "O_POSITIVE": "O_POSITIVE",
    "O_NEGATIVE": "O_NEGATIVE",
  };
  return map[bg];
}

// PATCH /api/blood-donors/[id] - Update donor profile (Admin)
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
    const { name, phone, city, bloodGroup, isActive } = body;

    const data: any = {};
    if (typeof name === "string") data.name = name.trim();
    if (typeof phone === "string") data.phone = phone.trim();
    if (typeof city === "string") data.city = city.trim();
    if (typeof isActive === "boolean") data.isActive = isActive;
    if (bloodGroup) {
      const parsedBg = formatBloodGroup(bloodGroup);
      if (parsedBg) data.bloodGroup = parsedBg;
    }

    const updated = await prisma.user.update({
      where: { id: params.id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        bloodGroup: true,
        city: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("[Blood Donor PATCH Error]", error);
    return NextResponse.json(
      { error: "Failed to update donor record", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/blood-donors/[id] - Remove from voluntary donor registry (Admin)
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || authUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Unset bloodGroup so they are no longer in the active donor registry
    await prisma.user.update({
      where: { id: params.id },
      data: {
        bloodGroup: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Donor removed from voluntary blood donor registry",
    });
  } catch (error: any) {
    console.error("[Blood Donor DELETE Error]", error);
    return NextResponse.json(
      { error: "Failed to remove blood donor", details: error.message },
      { status: 500 }
    );
  }
}
