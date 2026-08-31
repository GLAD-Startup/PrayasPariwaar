import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { MediaType } from "@prisma/client";

// PATCH /api/media/[id] - Update media coverage item
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
    const { title, type, source, url, imageUrl, publishedDate, order } = body;

    const item = await prisma.mediaCoverage.update({
      where: { id: params.id },
      data: {
        ...(title && { title: title.trim() }),
        ...(type && { type: type === "ELECTRONIC" ? MediaType.ELECTRONIC : MediaType.PRINT }),
        ...(source !== undefined && { source: source ? source.trim() : null }),
        ...(url !== undefined && { url: url ? url.trim() : null }),
        ...(imageUrl !== undefined && { imageUrl: imageUrl || null }),
        ...(publishedDate !== undefined && { publishedDate: publishedDate ? new Date(publishedDate) : null }),
        ...(order !== undefined && { order: Number(order) }),
      },
    });

    return NextResponse.json({ success: true, data: item });
  } catch (error: any) {
    console.error("[Media PATCH Error]", error);
    return NextResponse.json(
      { error: "Failed to update media item", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/media/[id] - Delete media coverage item
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || authUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.mediaCoverage.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: "Media coverage item deleted successfully" });
  } catch (error: any) {
    console.error("[Media DELETE Error]", error);
    return NextResponse.json(
      { error: "Failed to delete media item", details: error.message },
      { status: 500 }
    );
  }
}
