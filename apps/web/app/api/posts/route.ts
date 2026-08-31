import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { PostSchema, formatZodError } from "@prayas/utils";

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
          select: { name: true, email: true },
        },
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
    } = validated.data;

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
      },
    });

    return NextResponse.json({ success: true, data: post }, { status: 201 });
  } catch (error: any) {
    console.error("[Posts POST Error]", error);
    return NextResponse.json({ error: "Failed to create post", details: error.message }, { status: 500 });
  }
}
