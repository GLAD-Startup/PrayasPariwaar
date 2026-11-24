import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { MediaType } from "@prisma/client";
import { parseMediaImages, formatMediaImages } from "@/lib/media";

// GET /api/media - List media coverage items
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    const where: any = {};
    if (type && (type === "PRINT" || type === "ELECTRONIC")) {
      where.type = type as MediaType;
    }

    const items = await prisma.mediaCoverage.findMany({
      where,
      orderBy: [{ publishedDate: "desc" }, { createdAt: "desc" }],
    });

    const enriched = items.map((item) => {
      const parsedImages = parseMediaImages(item.imageUrl);
      return {
        ...item,
        images: parsedImages,
        primaryImage: parsedImages[0] || item.imageUrl || null,
      };
    });

    return NextResponse.json({ success: true, data: enriched });
  } catch (error: any) {
    console.error("[Media GET Error]", error);
    return NextResponse.json({ error: "Failed to fetch media coverage" }, { status: 500 });
  }
}

// POST /api/media - Create media coverage item (Admin)
export async function POST(req: Request) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || (authUser.role !== "ADMIN" && authUser.role !== "EDITOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { title, type, source, url, imageUrl, images, publishedDate, order } = body;

    if (!title || title.trim().length < 2) {
      return NextResponse.json({ error: "Title is required (at least 2 characters)" }, { status: 400 });
    }

    // Support both single imageUrl and multiple images array
    let finalImageUrl: string | null = null;
    if (Array.isArray(images) && images.length > 0) {
      finalImageUrl = formatMediaImages(images);
    } else if (typeof imageUrl === "string" && imageUrl.trim()) {
      finalImageUrl = imageUrl.trim();
    } else if (Array.isArray(imageUrl) && imageUrl.length > 0) {
      finalImageUrl = formatMediaImages(imageUrl);
    }

    const item = await prisma.mediaCoverage.create({
      data: {
        title: title.trim(),
        type: type === "ELECTRONIC" ? MediaType.ELECTRONIC : MediaType.PRINT,
        source: source ? source.trim() : null,
        url: url ? url.trim() : null,
        imageUrl: finalImageUrl,
        publishedDate: publishedDate ? new Date(publishedDate) : new Date(),
        order: Number(order) || 0,
      },
    });

    const parsedImages = parseMediaImages(item.imageUrl);
    const enriched = {
      ...item,
      images: parsedImages,
      primaryImage: parsedImages[0] || item.imageUrl || null,
    };

    return NextResponse.json(
      {
        success: true,
        message: "Media coverage item created successfully",
        data: enriched,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[Media POST Error]", error);
    return NextResponse.json({ error: "Failed to create media item", details: error.message }, { status: 500 });
  }
}
