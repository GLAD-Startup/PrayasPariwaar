import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { VolunteerSchema, formatZodError } from "@prayas/utils";

// GET /api/volunteers - List volunteers (Admin only)
export async function GET(req: Request) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || (authUser.role !== "ADMIN" && authUser.role !== "EDITOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const volunteers = await prisma.volunteer.findMany({
      include: {
        user: {
          select: {
            bloodGroup: true,
            city: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: volunteers });
  } catch (error: any) {
    console.error("[Volunteers GET Error]", error);
    return NextResponse.json({ error: "Failed to fetch volunteers" }, { status: 500 });
  }
}

// POST /api/volunteers - Submit volunteer registration with duplicate check & blood donor support
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = VolunteerSchema.safeParse(body);

    if (!validated.success) {
      const errorMessage = formatZodError(validated.error);
      return NextResponse.json(
        { error: errorMessage, details: validated.error.flatten().fieldErrors },
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

    const normalizedEmail = email.toLowerCase().trim();
    const cleanPhone = phone.trim().replace(/[\s-]/g, "");
    const searchPhone = cleanPhone.length >= 10 ? cleanPhone.slice(-10) : cleanPhone;

    // 1. Check if already registered
    const existing = await prisma.volunteer.findFirst({
      where: {
        OR: [
          { email: normalizedEmail },
          { phone: { contains: searchPhone } },
        ],
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          alreadyRegistered: true,
          error: `You are already registered with Prayas Pariwaar under ${existing.email} (Status: ${existing.status}). Our coordination desk has your contact information on record. Please call +91 94122 79000 if you wish to update your seva preferences.`,
          data: existing,
        },
        { status: 409 }
      );
    }

    const authUser = await getAuthUser(req);

    // Format Area of Interest with Blood Donor Tag if specified
    const isBloodDonor = Boolean(body.isBloodDonor || body.bloodGroup);
    let finalArea = areaOfInterest;
    if (isBloodDonor) {
      const bloodGroupLabel = body.bloodGroup ? ` (${body.bloodGroup.replace("_", "+").replace("POSITIVE", "+").replace("NEGATIVE", "-")})` : "";
      if (!finalArea.toLowerCase().includes("blood")) {
        finalArea = `${finalArea} + Emergency Blood Donor${bloodGroupLabel}`;
      } else {
        finalArea = `Emergency Blood Donor${bloodGroupLabel} • ${finalArea}`;
      }
    }

    let finalSkills = skills;
    if (body.bloodGroup) {
      finalSkills = `Blood Group: ${body.bloodGroup} | ${skills}`;
    }
    if (body.city) {
      finalSkills = `${finalSkills} | City: ${body.city}`;
    }

    const volunteer = await prisma.volunteer.create({
      data: {
        name,
        email: normalizedEmail,
        phone: phone.trim(),
        skills: finalSkills,
        availability,
        areaOfInterest: finalArea,
        previousExperience: previousExperience || null,
        userId: authUser?.userId || null,
        status: "PENDING",
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: isBloodDonor
          ? "Thank you! You are successfully registered as a Prayas Volunteer and added to the Emergency Blood Donor Registry. Our coordination desk will reach out soon."
          : "Thank you for joining Prayas Pariwaar! Our volunteer coordinator will reach out to you shortly.",
        data: volunteer,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[Volunteers POST Error]", error);
    return NextResponse.json(
      { error: "Failed to register volunteer", details: error.message },
      { status: 500 }
    );
  }
}
