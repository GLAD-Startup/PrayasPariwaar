import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { PostSchema, formatZodError } from "@prayas/utils";
import { syncImagesToAlbum } from "@/lib/gallery-sync";
import { broadcastNewDispatchNotification } from "@/lib/notifications-service";

// GET /api/posts - Public posts or filter
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const publishedOnly = searchParams.get("all") !== "true";

    const posts = await prisma.post.findMany({
      where: publishedOnly ? { published: true } : {},
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: { name: true },
        },
        images: {
          orderBy: { order: "asc" },
        },
        album: true,
      },
    });

    return NextResponse.json({ success: true, data: posts });
  } catch (error: any) {
    console.error("[Posts GET Error]", error);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

// POST /api/posts - Create post (Admin only)
export async function POST(req: Request) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || (authUser.role !== "ADMIN" && authUser.role !== "EDITOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const validated = PostSchema.safeParse(body);

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
      albumId,
    } = validated.data;

    const selectedAlbumId = albumId || body.albumId || null;

    const post = await prisma.post.create({
      data: {
        title,
        slug: slug.toLowerCase().trim().replace(/\s+/g, "-"),
        content,
        excerpt: excerpt || null,
        type: type as any,
        eventDate: eventDate ? new Date(eventDate) : null,
        location: location || null,
        coverImage: coverImage || null,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        published: published ?? true,
        albumId: selectedAlbumId,
        authorId: authUser.userId,
        images: imageUrls && imageUrls.length > 0
          ? {
              create: imageUrls.map((url, idx) => ({
                url,
                order: idx,
              })),
            }
          : undefined,
      },
      include: {
        images: true,
        album: true,
      },
    });

    // Auto-sync images to linked album
    if (selectedAlbumId) {
      const allImages = [coverImage, ...(imageUrls || [])].filter(
        (url): url is string => typeof url === "string" && url.trim().length > 0
      );
      if (allImages.length > 0) {
        await syncImagesToAlbum({
          albumId: selectedAlbumId,
          title: post.title,
          imageUrls: allImages,
          location: location || undefined,
        });
      }
    }

    // Broadcast push notification if published
    if (post.published) {
      broadcastNewDispatchNotification(post).catch((err) => {
        console.warn("[Posts] Broadcast dispatch push failed:", err);
      });
    }

    return NextResponse.json({ success: true, data: post }, { status: 201 });
  } catch (error: any) {
    console.error("[Posts POST Error]", error);
    return NextResponse.json({ error: "Failed to create post", details: error.message }, { status: 500 });
  }
}
