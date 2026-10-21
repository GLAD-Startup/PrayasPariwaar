import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

// GET /api/team - List team members (Public can view active members; Admin/Editor can view all)
export async function GET(req: Request) {
  try {
    const authUser = await getAuthUser(req);
    const isAdminOrEditor = authUser && (authUser.role === "ADMIN" || authUser.role === "EDITOR");

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim();
    const category = searchParams.get("category");
    const status = searchParams.get("status");

    const where: any = {};

    // For public visitors, strictly only return active members
    if (!isAdminOrEditor) {
      where.isActive = true;
    } else if (status && status !== "ALL") {
      if (status === "ACTIVE") where.isActive = true;
      if (status === "INACTIVE") where.isActive = false;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { designation: { contains: search, mode: "insensitive" } },
        { department: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
        { bio: { contains: search, mode: "insensitive" } },
      ];
    }

    const [members, totalCount, activeCount] = await Promise.all([
      prisma.teamMember.findMany({
        where,
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      }),
      prisma.teamMember.count(),
      prisma.teamMember.count({ where: { isActive: true } }),
    ]);

    // Group counts by category
    const categoryCountsRaw = await prisma.teamMember.groupBy({
      by: ["category"],
      _count: { _all: true },
    });

    const categoryCounts: Record<string, number> = {};
    for (const item of categoryCountsRaw) {
      categoryCounts[item.category] = item._count._all;
    }

    return NextResponse.json({
      success: true,
      data: members,
      meta: {
        total: totalCount,
        active: activeCount,
        categoryCounts,
      },
    });
  } catch (error: any) {
    console.error("[Team GET Error]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch team members", details: error?.message },
      { status: 500 }
    );
  }
}

// POST /api/team - Create a new team member
export async function POST(req: Request) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || (authUser.role !== "ADMIN" && authUser.role !== "EDITOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const {
      name,
      designation,
      category = "OPERATIONS",
      department,
      imageUrl,
      phone,
      email,
      bio,
      joinedYear,
      location,
      order,
      isActive = true,
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Member name is required." }, { status: 400 });
    }

    if (!designation || !designation.trim()) {
      return NextResponse.json({ error: "Designation / Title is required." }, { status: 400 });
    }

    // Default order if not provided
    let calculatedOrder = typeof order === "number" ? order : parseInt(order, 10);
    if (isNaN(calculatedOrder)) {
      const highestOrder = await prisma.teamMember.findFirst({
        orderBy: { order: "desc" },
        select: { order: true },
      });
      calculatedOrder = (highestOrder?.order ?? -1) + 1;
    }

    const parsedJoinedYear = joinedYear ? parseInt(joinedYear, 10) : null;

    const newMember = await prisma.teamMember.create({
      data: {
        name: name.trim(),
        designation: designation.trim(),
        category,
        department: department?.trim() || null,
        imageUrl: imageUrl?.trim() || null,
        phone: phone?.trim() || null,
        email: email?.trim() || null,
        bio: bio?.trim() || null,
        joinedYear: isNaN(parsedJoinedYear as number) ? null : parsedJoinedYear,
        location: location?.trim() || null,
        order: calculatedOrder,
        isActive: Boolean(isActive),
      },
    });

    return NextResponse.json({ success: true, data: newMember }, { status: 201 });
  } catch (error: any) {
    console.error("[Team POST Error]", error);
    return NextResponse.json(
      { error: "Failed to create team member", details: error?.message },
      { status: 500 }
    );
  }
}
