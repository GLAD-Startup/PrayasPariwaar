import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { ProjectSchema, formatZodError } from "@prayas/utils";
import { syncImagesToAlbum } from "@/lib/gallery-sync";

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
        album: true,
        donations: {
          where: { status: "SUCCESS" },
          select: {
            id: true,
            donorName: true,
            amount: true,
            currency: true,
            createdAt: true,
            isAnonymous: true,
          },
          take: 5,
        },
      } as any,
      orderBy: { createdAt: "desc" },
    });

    const sanitizedProjects = projects.map((project: any) => ({
      ...project,
      donations: (project.donations || []).map((d: any) => ({
        id: d.id,
        donorName: d.isAnonymous ? "Anonymous Donor" : d.donorName,
        amount: d.amount,
        currency: d.currency,
        createdAt: d.createdAt,
        isAnonymous: d.isAnonymous,
      })),
    }));

    return NextResponse.json({ success: true, data: sanitizedProjects });
  } catch (error: any) {
    console.error("[Projects GET Error]", error);
    return NextResponse.json({ error: "Failed to fetch projects", details: error?.message }, { status: 500 });
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
      albumId,
    } = validated.data;

    const selectedAlbumId = albumId || body.albumId || null;

    const project: any = await prisma.project.create({
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
        albumId: selectedAlbumId,
        createdById: authUser.userId,
        images: body.imageUrls && body.imageUrls.length > 0
          ? {
              create: body.imageUrls.map((url: string, idx: number) => ({
                url,
                order: idx,
              })),
            }
          : undefined,
      } as any,
      include: {
        images: true,
        album: true,
      } as any,
    });

    // Auto-sync images to linked album
    if (selectedAlbumId) {
      const allImages = [coverImage, ...(body.imageUrls || [])].filter(
        (url): url is string => typeof url === "string" && url.trim().length > 0
      );
      if (allImages.length > 0) {
        await syncImagesToAlbum({
          albumId: selectedAlbumId,
          title: project.title,
          imageUrls: allImages,
        });
      }
    }

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
