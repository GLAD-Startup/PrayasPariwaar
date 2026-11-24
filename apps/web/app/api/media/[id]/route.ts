import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { MediaType } from "@prisma/client";
import { parseMediaImages, formatMediaImages } from "@/lib/media";

// GET /api/media/[id] - Get single media coverage item
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const item = await prisma.mediaCoverage.findUnique({
      where: { id: params.id },
    });

    if (!item) {
      return NextResponse.json({ error: "Media item not found" }, { status: 404 });
    }

    const parsedImages = parseMediaImages(item.imageUrl);
    const enriched = {
      ...item,
      images: parsedImages,
      primaryImage: parsedImages[0] || item.imageUrl || null,
    };

    return NextResponse.json({ success: true, data: enriched });
  } catch (error: any) {
    console.error("[Media GET Single Error]", error);
    return NextResponse.json(
      { error: "Failed to fetch media item", details: error.message },
      { status: 500 }
    );
  }
}

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
    const { title, type, source, url, imageUrl, images, publishedDate, order } = body;

    let finalImageUrl: string | null | undefined = undefined;
    if (images !== undefined) {
      finalImageUrl = Array.isArray(images) ? formatMediaImages(images) : null;
    } else if (imageUrl !== undefined) {
      if (Array.isArray(imageUrl)) {
        finalImageUrl = formatMediaImages(imageUrl);
      } else if (typeof imageUrl === "string") {
        finalImageUrl = imageUrl.trim() || null;
      } else {
        finalImageUrl = null;
      }
    }

    const item = await prisma.mediaCoverage.update({
      where: { id: params.id },
      data: {
        ...(title && { title: title.trim() }),
        ...(type && { type: type === "ELECTRONIC" ? MediaType.ELECTRONIC : MediaType.PRINT }),
        ...(source !== undefined && { source: source ? source.trim() : null }),
        ...(url !== undefined && { url: url ? url.trim() : null }),
        ...(finalImageUrl !== undefined && { imageUrl: finalImageUrl }),
        ...(publishedDate !== undefined && { publishedDate: publishedDate ? new Date(publishedDate) : null }),
        ...(order !== undefined && { order: Number(order) }),
      },
    });

    const parsedImages = parseMediaImages(item.imageUrl);
    const enriched = {
      ...item,
      images: parsedImages,
      primaryImage: parsedImages[0] || item.imageUrl || null,
    };

    return NextResponse.json({ success: true, data: enriched });
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
