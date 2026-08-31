import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { MediaType } from "@prisma/client";

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

    return NextResponse.json({ success: true, data: items });
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
    const { title, type, source, url, imageUrl, publishedDate, order } = body;

    if (!title || title.trim().length < 2) {
      return NextResponse.json({ error: "Title is required (at least 2 characters)" }, { status: 400 });
    }

    const item = await prisma.mediaCoverage.create({
      data: {
        title: title.trim(),
        type: type === "ELECTRONIC" ? MediaType.ELECTRONIC : MediaType.PRINT,
        source: source ? source.trim() : null,
        url: url ? url.trim() : null,
        imageUrl: imageUrl || null,
        publishedDate: publishedDate ? new Date(publishedDate) : new Date(),
        order: Number(order) || 0,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Media coverage item created successfully",
        data: item,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[Media POST Error]", error);
    return NextResponse.json({ error: "Failed to create media item", details: error.message }, { status: 500 });
  }
}
