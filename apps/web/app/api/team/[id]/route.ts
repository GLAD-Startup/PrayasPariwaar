import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

// GET /api/team/[id] - Get individual team member details
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || (authUser.role !== "ADMIN" && authUser.role !== "EDITOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = params;
    const member = await prisma.teamMember.findUnique({
      where: { id },
    });

    if (!member) {
      return NextResponse.json({ error: "Team member not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: member });
  } catch (error: any) {
    console.error("[Team GET ID Error]", error);
    return NextResponse.json(
      { error: "Failed to fetch team member", details: error?.message },
      { status: 500 }
    );
  }
}

// PUT /api/team/[id] - Update team member profile
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || (authUser.role !== "ADMIN" && authUser.role !== "EDITOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = params;
    const body = await req.json();

    const dataToUpdate: any = {};
    if (body.name !== undefined) dataToUpdate.name = body.name.trim();
    if (body.designation !== undefined) dataToUpdate.designation = body.designation.trim();
    if (body.category !== undefined) dataToUpdate.category = body.category;
    if (body.department !== undefined) dataToUpdate.department = body.department ? body.department.trim() : null;
    if (body.imageUrl !== undefined) dataToUpdate.imageUrl = body.imageUrl ? body.imageUrl.trim() : null;
    if (body.phone !== undefined) dataToUpdate.phone = body.phone ? body.phone.trim() : null;
    if (body.email !== undefined) dataToUpdate.email = body.email ? body.email.trim() : null;
    if (body.bio !== undefined) dataToUpdate.bio = body.bio ? body.bio.trim() : null;
    if (body.location !== undefined) dataToUpdate.location = body.location ? body.location.trim() : null;

    if (body.joinedYear !== undefined) {
      const year = parseInt(body.joinedYear, 10);
      dataToUpdate.joinedYear = isNaN(year) ? null : year;
    }

    if (body.order !== undefined) {
      const orderNum = parseInt(body.order, 10);
      dataToUpdate.order = isNaN(orderNum) ? 0 : orderNum;
    }

    if (body.isActive !== undefined) {
      dataToUpdate.isActive = Boolean(body.isActive);
    }

    const updated = await prisma.teamMember.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("[Team PUT Error]", error);
    return NextResponse.json(
      { error: "Failed to update team member", details: error?.message },
      { status: 500 }
    );
  }
}

// DELETE /api/team/[id] - Delete team member profile
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || (authUser.role !== "ADMIN" && authUser.role !== "EDITOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = params;
    await prisma.teamMember.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Team member deleted successfully." });
  } catch (error: any) {
    console.error("[Team DELETE Error]", error);
    return NextResponse.json(
      { error: "Failed to delete team member", details: error?.message },
      { status: 500 }
    );
  }
}
