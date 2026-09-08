import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { syncImagesToAlbum } from "@/lib/gallery-sync";

// PATCH /api/projects/[id] - Update project
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
    const {
      title,
      slug,
      category,
      description,
      goalAmount,
      raisedAmount,
      status,
      coverImage,
      metaTitle,
      metaDescription,
      imageUrls,
      albumId,
    } = body;

    // Update images if provided
    if (imageUrls && Array.isArray(imageUrls)) {
      await prisma.projectImage.deleteMany({
        where: { projectId: params.id },
      });
      if (imageUrls.length > 0) {
        await prisma.projectImage.createMany({
          data: imageUrls.map((url: string, idx: number) => ({
            projectId: params.id,
            url,
            order: idx,
          })),
        });
      }
    }

    const project: any = await prisma.project.update({
      where: { id: params.id },
      data: {
        ...(title && { title }),
        ...(slug && { slug: slug.toLowerCase().trim().replace(/\s+/g, "-") }),
        ...(category && { category }),
        ...(description !== undefined && { description }),
        ...(goalAmount !== undefined && { goalAmount: Number(goalAmount) }),
        ...(raisedAmount !== undefined && { raisedAmount: Number(raisedAmount) }),
        ...(status && { status }),
        ...(coverImage !== undefined && { coverImage }),
        ...(metaTitle !== undefined && { metaTitle }),
        ...(metaDescription !== undefined && { metaDescription }),
        ...(albumId !== undefined && { albumId: albumId || null }),
      } as any,
      include: {
        images: true,
        album: true,
      } as any,
    });

    // Auto-sync images to linked album if albumId is provided or project has one
    const targetAlbumId = albumId || project.albumId;
    if (targetAlbumId) {
      const allImages = [
        coverImage || project.coverImage,
        ...(imageUrls || project.images?.map((i: any) => i.url) || []),
      ].filter((url): url is string => typeof url === "string" && url.trim().length > 0);

      if (allImages.length > 0) {
        await syncImagesToAlbum({
          albumId: targetAlbumId,
          title: project.title,
          imageUrls: allImages,
        });
      }
    }

    return NextResponse.json({ success: true, data: project });
  } catch (error: any) {
    console.error("[Projects PATCH Error]", error);
    return NextResponse.json(
      { error: "Failed to update project", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id] - Delete project
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || authUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Delete related images first
    await prisma.projectImage.deleteMany({
      where: { projectId: params.id },
    });

    await prisma.project.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: "Project deleted successfully" });
  } catch (error: any) {
    console.error("[Projects DELETE Error]", error);
    return NextResponse.json(
      { error: "Failed to delete project", details: error.message },
      { status: 500 }
    );
  }
}
