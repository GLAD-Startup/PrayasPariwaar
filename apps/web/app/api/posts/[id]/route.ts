import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

// GET /api/posts/[id] - Fetch single post by id or slug with author and images
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const post = await prisma.post.findFirst({
      where: {
        OR: [{ id: params.id }, { slug: params.id }],
      },
      include: {
        author: { select: { name: true } },
        images: { orderBy: { order: "asc" } },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: post });
  } catch (error: any) {
    console.error("[Post GET Error]", error);
    return NextResponse.json({ error: "Failed to fetch post", details: error.message }, { status: 500 });
  }
}

// PATCH /api/posts/[id] - Update post
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
      content,
      excerpt,
      type,
      eventDate,
      location,
      coverImage,
      metaTitle,
      metaDescription,
      published,
      imageUrls,
    } = body;

    // Update images if provided
    if (imageUrls && Array.isArray(imageUrls)) {
      await prisma.postImage.deleteMany({
        where: { postId: params.id },
      });
      if (imageUrls.length > 0) {
        await prisma.postImage.createMany({
          data: imageUrls.map((url: string, idx: number) => ({
            postId: params.id,
            url,
            order: idx,
          })),
        });
      }
    }

    const post = await prisma.post.update({
      where: { id: params.id },
      data: {
        ...(title && { title }),
        ...(slug && { slug: slug.toLowerCase().trim().replace(/\s+/g, "-") }),
        ...(content !== undefined && { content }),
        ...(excerpt !== undefined && { excerpt }),
        ...(type && { type }),
        ...(eventDate !== undefined && { eventDate: eventDate ? new Date(eventDate) : null }),
        ...(location !== undefined && { location }),
        ...(coverImage !== undefined && { coverImage }),
        ...(metaTitle !== undefined && { metaTitle }),
        ...(metaDescription !== undefined && { metaDescription }),
        ...(published !== undefined && { published }),
      },
      include: {
        images: true,
      },
    });

    return NextResponse.json({ success: true, data: post });
  } catch (error: any) {
    console.error("[Posts PATCH Error]", error);
    return NextResponse.json(
      { error: "Failed to update post", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/posts/[id] - Delete post
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
    await prisma.postImage.deleteMany({
      where: { postId: params.id },
    });

    await prisma.post.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: "Post deleted successfully" });
  } catch (error: any) {
    console.error("[Posts DELETE Error]", error);
    return NextResponse.json(
      { error: "Failed to delete post", details: error.message },
      { status: 500 }
    );
  }
}
