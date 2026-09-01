import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    let userId: string | null = null;

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const payload = verifyAccessToken(token);
      if (payload) {
        userId = payload.userId;
      }
    }

    const { searchParams } = new URL(req.url);
    const queryUserId = searchParams.get("userId");
    const targetId = userId || queryUserId;

    if (!targetId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: targetId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatarUrl: true,
        bio: true,
        role: true,
        bloodGroup: true,
        city: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    console.error("[Profile GET Error]", error);
    return NextResponse.json({ error: "Failed to fetch profile", details: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    let tokenUserId: string | null = null;

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const payload = verifyAccessToken(token);
      if (payload) {
        tokenUserId = payload.userId;
      }
    }

    const body = await req.json();
    const targetUserId = tokenUserId || body.userId || body.id;

    if (!targetUserId && !body.email) {
      return NextResponse.json({ error: "User identification required" }, { status: 400 });
    }

    const updateData: any = {};
    if (typeof body.name === "string" && body.name.trim()) updateData.name = body.name.trim();
    if (typeof body.phone === "string") updateData.phone = body.phone.trim();
    if (typeof body.avatarUrl === "string") updateData.avatarUrl = body.avatarUrl.trim();
    if (typeof body.bio === "string") updateData.bio = body.bio.trim();
    if (typeof body.city === "string") updateData.city = body.city.trim();
    if (body.bloodGroup) updateData.bloodGroup = body.bloodGroup;

    const user = targetUserId
      ? await prisma.user.update({
          where: { id: targetUserId },
          data: updateData,
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            avatarUrl: true,
            bio: true,
            role: true,
            bloodGroup: true,
            city: true,
          },
        })
      : await prisma.user.update({
          where: { email: body.email.toLowerCase().trim() },
          data: updateData,
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            avatarUrl: true,
            bio: true,
            role: true,
            bloodGroup: true,
            city: true,
          },
        });

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    console.error("[Profile PATCH Error]", error);
    return NextResponse.json({ error: "Failed to update profile", details: error.message }, { status: 500 });
  }
}
