import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, hashPassword } from "@/lib/auth";
import { Role } from "@prisma/client";

// PATCH /api/users/[id] - Update user details, role, status, or reset password
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || authUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only System Administrators can modify user accounts" },
        { status: 403 }
      );
    }

    const userId = params.id;
    const body = await req.json();
    const { name, email, role, phone, city, isActive, newPassword } = body;

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updateData: any = {};

    if (name && typeof name === "string") updateData.name = name.trim();
    if (phone !== undefined) updateData.phone = phone ? phone.trim() : null;
    if (city !== undefined) updateData.city = city ? city.trim() : null;
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

    if (role && Object.values(Role).includes(role)) {
      updateData.role = role as Role;
    }

    if (email && typeof email === "string" && email.includes("@")) {
      const cleanEmail = email.toLowerCase().trim();
      if (cleanEmail !== existingUser.email) {
        const emailTaken = await prisma.user.findUnique({
          where: { email: cleanEmail },
        });
        if (emailTaken) {
          return NextResponse.json(
            { error: `Email "${cleanEmail}" is already in use by another user` },
            { status: 400 }
          );
        }
        updateData.email = cleanEmail;
      }
    }

    if (newPassword && typeof newPassword === "string" && newPassword.length >= 6) {
      updateData.passwordHash = await hashPassword(newPassword);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        city: true,
        avatarUrl: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error: any) {
    console.error("[Users PATCH Error]", error);
    return NextResponse.json(
      { error: "Failed to update user", details: error?.message },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - Delete a user account (Admin only)
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || authUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only System Administrators can delete user accounts" },
        { status: 403 }
      );
    }

    const userId = params.id;

    if (authUser.userId === userId) {
      return NextResponse.json(
        { error: "You cannot delete your own admin account while logged in" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({
      success: true,
      message: `User account "${existingUser.name}" has been deleted`,
    });
  } catch (error: any) {
    console.error("[Users DELETE Error]", error);
    return NextResponse.json(
      { error: "Failed to delete user", details: error?.message },
      { status: 500 }
    );
  }
}
