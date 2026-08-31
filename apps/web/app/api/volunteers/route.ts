import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { VolunteerSchema } from "@prayas/utils";

// GET /api/volunteers - List volunteers (Admin only)
export async function GET(req: Request) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || authUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const volunteers = await prisma.volunteer.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: volunteers });
  } catch (error: any) {
    console.error("[Volunteers GET Error]", error);
    return NextResponse.json({ error: "Failed to fetch volunteers" }, { status: 500 });
  }
}

// POST /api/volunteers - Submit volunteer registration
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = VolunteerSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const {
      name,
      email,
      phone,
      skills,
      availability,
      areaOfInterest,
      previousExperience,
    } = validated.data;

    const authUser = await getAuthUser(req);

    const volunteer = await prisma.volunteer.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        phone,
        skills,
        availability,
        areaOfInterest,
        previousExperience: previousExperience || null,
        userId: authUser?.userId || null,
        status: "PENDING",
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Thank you for joining Prayas! Our volunteer coordinator will reach out to you.",
        data: volunteer,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[Volunteers POST Error]", error);
    return NextResponse.json({ error: "Failed to register volunteer" }, { status: 500 });
  }
}
