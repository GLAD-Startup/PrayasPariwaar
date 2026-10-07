import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

// PUT /api/awards/[id] - Update an award (Admin only)
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
    if (body.title !== undefined) dataToUpdate.title = body.title;
    if (body.description !== undefined) dataToUpdate.description = body.description;
    if (body.imageUrl !== undefined) dataToUpdate.imageUrl = body.imageUrl;
    if (body.year !== undefined) dataToUpdate.year = body.year ? parseInt(body.year, 10) : null;
    if (body.order !== undefined) dataToUpdate.order = parseInt(body.order, 10);

    const updated = await prisma.award.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("[Awards PUT Error]", error);
    return NextResponse.json(
      { error: "Failed to update award", details: error?.message },
      { status: 500 }
    );
  }
}

// DELETE /api/awards/[id] - Delete an award (Admin only)
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
    await prisma.award.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Award deleted" });
  } catch (error: any) {
    console.error("[Awards DELETE Error]", error);
    return NextResponse.json(
      { error: "Failed to delete award", details: error?.message },
      { status: 500 }
    );
  }
}
