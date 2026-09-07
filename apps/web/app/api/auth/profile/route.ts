import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const queryUserId = searchParams.get("userId");

    // Only ADMIN can view another user's profile
    if (queryUserId && queryUserId !== authUser.userId && authUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden. Cannot access other user profiles." }, { status: 403 });
    }

    const targetId = (authUser.role === "ADMIN" && queryUserId) ? queryUserId : authUser.userId;

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
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Only ADMIN can modify another user's profile
    if (body.userId && body.userId !== authUser.userId && authUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden. Cannot modify other user profiles." }, { status: 403 });
    }

    if (body.email && body.email.toLowerCase().trim() !== authUser.email.toLowerCase().trim() && authUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden. Cannot modify other user profiles." }, { status: 403 });
    }

    const targetUserId = (authUser.role === "ADMIN" && body.userId) ? body.userId : authUser.userId;

    const updateData: any = {};
    if (typeof body.name === "string" && body.name.trim()) updateData.name = body.name.trim();
    if (typeof body.phone === "string") updateData.phone = body.phone.trim();
    if (typeof body.avatarUrl === "string") updateData.avatarUrl = body.avatarUrl.trim();
    if (typeof body.bio === "string") updateData.bio = body.bio.trim();
    if (typeof body.city === "string") updateData.city = body.city.trim();
    if (body.bloodGroup) updateData.bloodGroup = body.bloodGroup;

    const user = await prisma.user.update({
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
    });

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    console.error("[Profile PATCH Error]", error);
    return NextResponse.json({ error: "Failed to update profile", details: error.message }, { status: 500 });
  }
}
