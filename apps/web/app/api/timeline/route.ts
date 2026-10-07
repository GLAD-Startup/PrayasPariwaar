import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { MILESTONES } from "@/lib/timeline-data";

// GET /api/timeline - List all timeline milestones
export async function GET() {
  try {
    let dbMilestones: any[] = [];
    const debugInfo: any = {
      hasTimeline: Boolean((prisma as any)?.timelineMilestone),
      hasAward: Boolean((prisma as any)?.award),
      keys: (prisma as any) ? Object.keys(prisma).filter((k: string) => !k.startsWith("$") && !k.startsWith("_")) : [],
      resolveClient: typeof require !== "undefined" ? require.resolve("@prisma/client") : null,
      resolveDotPrisma: typeof require !== "undefined" ? require.resolve(".prisma/client") : null,
    };
    if ((prisma as any)?.timelineMilestone) {
      try {
        dbMilestones = await (prisma as any).timelineMilestone.findMany({
          orderBy: [{ year: "asc" }, { order: "asc" }],
        });
        debugInfo.count = dbMilestones.length;
      } catch (err: any) {
        debugInfo.findError = err.message || String(err);
      }
    }

    // If database has milestones, return them; otherwise fallback to static MILESTONES
    const milestones = dbMilestones.length > 0 ? dbMilestones : MILESTONES;

    return NextResponse.json({
      success: true,
      data: milestones,
      source: dbMilestones.length > 0 ? "database" : "static_fallback",
      debugInfo,
    });
  } catch (error: any) {
    console.error("[Timeline GET Error]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch timeline milestones", details: error?.message },
      { status: 500 }
    );
  }
}

// POST /api/timeline - Create new timeline milestone (Admin only)
export async function POST(req: Request) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || (authUser.role !== "ADMIN" && authUser.role !== "EDITOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const {
      year,
      dateLabel,
      category,
      categoryLabel,
      title,
      subtitle,
      location,
      imageUrl,
      impactBadge,
      summary,
      story,
      quote,
      keyStats,
      highlightTag,
      linkUrl,
      linkLabel,
      order,
      published = true,
    } = body;

    if (!title || !year || !imageUrl) {
      return NextResponse.json(
        { error: "Title, year, and image URL are required" },
        { status: 400 }
      );
    }

    const parsedYear = parseInt(year, 10);
    if (isNaN(parsedYear)) {
      return NextResponse.json({ error: "Invalid year" }, { status: 400 });
    }

    const categoryFormatted = category || "education";
    const categoryLabelFormatted =
      categoryLabel ||
      (categoryFormatted === "education"
        ? "Free Education"
        : categoryFormatted === "health"
        ? "Emergency Blood & Health"
        : categoryFormatted === "plantation"
        ? "Ecology & Green Vrindavan"
        : "Trust & Governance");

    const milestone = await (prisma as any).timelineMilestone.create({
      data: {
        year: parsedYear,
        dateLabel: dateLabel || `${parsedYear}`,
        category: categoryFormatted,
        categoryLabel: categoryLabelFormatted,
        title,
        subtitle: subtitle || "",
        location: location || "Vrindavan, Mathura",
        imageUrl,
        impactBadge: impactBadge || "Grassroots Seva",
        summary: summary || title,
        story: story || summary || title,
        quote: quote || null,
        keyStats: Array.isArray(keyStats) ? keyStats : [],
        highlightTag: highlightTag || null,
        linkUrl: linkUrl || null,
        linkLabel: linkLabel || null,
        order: typeof order === "number" ? order : 0,
        published: Boolean(published),
      },
    });

    return NextResponse.json({ success: true, data: milestone }, { status: 201 });
  } catch (error: any) {
    console.error("[Timeline POST Error]", error);
    return NextResponse.json(
      { error: "Failed to create timeline milestone", details: error?.message },
      { status: 500 }
    );
  }
}
