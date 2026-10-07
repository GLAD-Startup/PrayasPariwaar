import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

// PUT /api/timeline/[id] - Update a milestone (Admin only)
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || (authUser.role !== "ADMIN" && authUser.role !== "EDITOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = params;
    const body = await req.json();

    const dataToUpdate: any = {};
    if (body.title !== undefined) dataToUpdate.title = body.title;
    if (body.year !== undefined) dataToUpdate.year = parseInt(body.year, 10);
    if (body.dateLabel !== undefined) dataToUpdate.dateLabel = body.dateLabel;
    if (body.category !== undefined) dataToUpdate.category = body.category;
    if (body.categoryLabel !== undefined) dataToUpdate.categoryLabel = body.categoryLabel;
    if (body.subtitle !== undefined) dataToUpdate.subtitle = body.subtitle;
    if (body.location !== undefined) dataToUpdate.location = body.location;
    if (body.imageUrl !== undefined) dataToUpdate.imageUrl = body.imageUrl;
    if (body.impactBadge !== undefined) dataToUpdate.impactBadge = body.impactBadge;
    if (body.summary !== undefined) dataToUpdate.summary = body.summary;
    if (body.story !== undefined) dataToUpdate.story = body.story;
    if (body.quote !== undefined) dataToUpdate.quote = body.quote;
    if (body.keyStats !== undefined) dataToUpdate.keyStats = body.keyStats;
    if (body.highlightTag !== undefined) dataToUpdate.highlightTag = body.highlightTag;
    if (body.linkUrl !== undefined) dataToUpdate.linkUrl = body.linkUrl;
    if (body.linkLabel !== undefined) dataToUpdate.linkLabel = body.linkLabel;
    if (body.order !== undefined) dataToUpdate.order = parseInt(body.order, 10);
    if (body.published !== undefined) dataToUpdate.published = Boolean(body.published);

    let targetId = id;
    const existing = await (prisma as any).timelineMilestone.findUnique({
      where: { id },
    });

    if (!existing) {
      // If client was referencing a static ID (like "m-2011"), locate matching record by year/title
      const matching = await (prisma as any).timelineMilestone.findFirst({
        where: {
          OR: [
            ...(dataToUpdate.year ? [{ year: dataToUpdate.year }] : []),
            ...(dataToUpdate.title ? [{ title: dataToUpdate.title }] : []),
          ],
        },
      });

      if (matching) {
        targetId = matching.id;
      } else {
        // Create new milestone if not found
        const created = await (prisma as any).timelineMilestone.create({
          data: {
            year: dataToUpdate.year || 2026,
            dateLabel: dataToUpdate.dateLabel || `${dataToUpdate.year || 2026}`,
            category: dataToUpdate.category || "education",
            categoryLabel: dataToUpdate.categoryLabel || "Free Education",
            title: dataToUpdate.title || "Timeline Milestone",
            subtitle: dataToUpdate.subtitle || "",
            location: dataToUpdate.location || "Vrindavan, Mathura",
            imageUrl: dataToUpdate.imageUrl || "",
            impactBadge: dataToUpdate.impactBadge || "Grassroots Seva",
            summary: dataToUpdate.summary || "",
            story: dataToUpdate.story || "",
            quote: dataToUpdate.quote || null,
            keyStats: dataToUpdate.keyStats || [],
            highlightTag: dataToUpdate.highlightTag || null,
            linkUrl: dataToUpdate.linkUrl || null,
            linkLabel: dataToUpdate.linkLabel || null,
            order: dataToUpdate.order || 0,
            published: dataToUpdate.published !== false,
          },
        });
        return NextResponse.json({ success: true, data: created });
      }
    }

    const updated = await (prisma as any).timelineMilestone.update({
      where: { id: targetId },
      data: dataToUpdate,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("[Timeline PUT Error]", error);
    return NextResponse.json(
      { error: "Failed to update timeline milestone", details: error?.message },
      { status: 500 }
    );
  }
}

// DELETE /api/timeline/[id] - Delete a milestone (Admin only)
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || (authUser.role !== "ADMIN" && authUser.role !== "EDITOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = params;
    await (prisma as any).timelineMilestone.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Milestone deleted" });
  } catch (error: any) {
    console.error("[Timeline DELETE Error]", error);
    return NextResponse.json(
      { error: "Failed to delete timeline milestone", details: error?.message },
      { status: 500 }
    );
  }
}
