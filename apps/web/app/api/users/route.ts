import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, hashPassword } from "@/lib/auth";
import { Role } from "@prisma/client";

// GET /api/users - List users with filters (Admin only)
export async function GET(req: Request) {
  try {
    const authUser = await getAuthUser(req);
    // Allow ADMIN or EDITOR to view user directory
    if (!authUser || (authUser.role !== "ADMIN" && authUser.role !== "EDITOR")) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role");
    const status = searchParams.get("status");

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
      ];
    }

    if (role && role !== "ALL" && Object.values(Role).includes(role as any)) {
      where.role = role as Role;
    }

    if (status === "ACTIVE") {
      where.isActive = true;
    } else if (status === "INACTIVE") {
      where.isActive = false;
    }

    const users = await prisma.user.findMany({
      where,
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
        _count: {
          select: {
            posts: true,
            projects: true,
            donations: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: users });
  } catch (error: any) {
    console.error("[Users GET Error]", error);
    return NextResponse.json(
      { error: "Failed to fetch users", details: error?.message },
      { status: 500 }
    );
  }
}

// POST /api/users - Create new admin or staff user (Admin only)
export async function POST(req: Request) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || authUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only System Administrators can create new user accounts" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, email, password, role, phone, city, isActive } = body;

    // Validation
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { error: "Full name is required (at least 2 characters)" },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "A valid email address is required" },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check for existing user
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: `A user with email "${cleanEmail}" already exists` },
        { status: 400 }
      );
    }

    // Validate role
    const assignedRole = role && Object.values(Role).includes(role) ? (role as Role) : Role.EDITOR;

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user in DB
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        passwordHash,
        role: assignedRole,
        phone: phone ? phone.trim() : null,
        city: city ? city.trim() : null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
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

    return NextResponse.json({ success: true, data: newUser }, { status: 201 });
  } catch (error: any) {
    console.error("[Users POST Error]", error);
    return NextResponse.json(
      { error: "Failed to create user", details: error?.message },
      { status: 500 }
    );
  }
}
