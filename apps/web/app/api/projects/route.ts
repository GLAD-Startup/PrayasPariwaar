import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { ProjectSchema, formatZodError } from "@prayas/utils";

// GET /api/projects - List projects
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    const where: any = {};
    if (category && category !== "ALL") {
      where.category = category;
    }

    const projects = await prisma.project.findMany({
      where,
      include: {
        images: { orderBy: { order: "asc" } },
        donations: {
          where: { status: "SUCCESS" },
          take: 5,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: projects });
  } catch (error: any) {
    console.error("[Projects GET Error]", error);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

// POST /api/projects - Create project (Admin)
export async function POST(req: Request) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || (authUser.role !== "ADMIN" && authUser.role !== "EDITOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const validated = ProjectSchema.safeParse(body);

    if (!validated.success) {
      const errorMessage = formatZodError(validated.error);
      return NextResponse.json(
        { error: errorMessage, details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const {
      title,
      slug,
      category,
      description,
      goalAmount,
      coverImage,
      metaTitle,
      metaDescription,
    } = validated.data;

    const project = await prisma.project.create({
      data: {
        title,
        slug: slug.toLowerCase().trim().replace(/\s+/g, "-"),
        category,
        description,
        goalAmount: Number(goalAmount) || 0,
        raisedAmount: Number(body.raisedAmount) || 0,
        coverImage: coverImage || null,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        status: body.status || "ACTIVE",
        createdById: authUser.userId,
        images: body.imageUrls && body.imageUrls.length > 0
          ? {
              create: body.imageUrls.map((url: string, idx: number) => ({
                url,
                order: idx,
              })),
            }
          : undefined,
      },
      include: {
        images: true,
      },
    });

    return NextResponse.json(
      { success: true, message: "Project created successfully", data: project },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[Projects POST Error]", error);
    return NextResponse.json(
      { error: "Failed to create project", details: error.message },
      { status: 500 }
    );
  }
}
