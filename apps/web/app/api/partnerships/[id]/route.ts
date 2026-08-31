import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

// PATCH /api/partnerships/[id] - Update status
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

    const inquiry = await prisma.partnershipInquiry.update({
      where: { id: params.id },
      data: {
        ...(status && { status }),
      },
    });

    return NextResponse.json({ success: true, data: inquiry });
  } catch (error: any) {
    console.error("[Partnership PATCH Error]", error);
    return NextResponse.json(
      { error: "Failed to update partnership inquiry", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/partnerships/[id] - Delete inquiry
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || authUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.partnershipInquiry.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: "Inquiry deleted successfully" });
  } catch (error: any) {
    console.error("[Partnership DELETE Error]", error);
    return NextResponse.json(
      { error: "Failed to delete partnership inquiry", details: error.message },
      { status: 500 }
    );
  }
}
