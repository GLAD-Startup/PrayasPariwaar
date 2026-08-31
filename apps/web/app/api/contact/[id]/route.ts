import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

// PATCH /api/contact/[id] - Toggle isRead
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
    const { isRead } = body;

    const message = await prisma.contactMessage.update({
      where: { id: params.id },
      data: {
        ...(isRead !== undefined && { isRead }),
      },
    });

    return NextResponse.json({ success: true, data: message });
  } catch (error: any) {
    console.error("[Contact PATCH Error]", error);
    return NextResponse.json(
      { error: "Failed to update contact message", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/contact/[id] - Delete contact message
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || authUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.contactMessage.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: "Message deleted successfully" });
  } catch (error: any) {
    console.error("[Contact DELETE Error]", error);
    return NextResponse.json(
      { error: "Failed to delete contact message", details: error.message },
      { status: 500 }
    );
  }
}
