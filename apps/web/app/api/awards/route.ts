import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

// GET /api/awards - List all awards & honors
export async function GET() {
  try {
    const awards = await prisma.award.findMany({
      orderBy: [{ order: "asc" }, { year: "desc" }],
    });

    return NextResponse.json({ success: true, data: awards });
  } catch (error: any) {
    console.error("[Awards GET Error]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch awards", details: error?.message },
      { status: 500 }
    );
  }
}

// POST /api/awards - Create new award / recognition (Admin only)
export async function POST(req: Request) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || (authUser.role !== "ADMIN" && authUser.role !== "EDITOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, imageUrl, year, order } = body;

    if (!title) {
      return NextResponse.json({ error: "Award title is required" }, { status: 400 });
    }

    const award = await prisma.award.create({
      data: {
        title,
        description: description || null,
        imageUrl: imageUrl || null,
        year: year ? parseInt(year, 10) : null,
        order: typeof order === "number" ? order : 0,
      },
    });

    return NextResponse.json({ success: true, data: award }, { status: 201 });
  } catch (error: any) {
    console.error("[Awards POST Error]", error);
    return NextResponse.json(
      { error: "Failed to create award", details: error?.message },
      { status: 500 }
    );
  }
}
