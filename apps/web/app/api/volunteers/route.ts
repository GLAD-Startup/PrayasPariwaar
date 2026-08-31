import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { VolunteerSchema, formatZodError } from "@prayas/utils";

// GET /api/volunteers - List volunteers or check individual application status
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const checkEmail = searchParams.get("email") || searchParams.get("checkEmail");
    const checkPhone = searchParams.get("phone") || searchParams.get("checkPhone");
    const isMe = searchParams.get("me") === "true";

    const authUser = await getAuthUser(req);

    // 1. Specific applicant status lookup (User/Self-service)
    if (checkEmail || checkPhone || isMe) {
      const emailQuery = checkEmail?.toLowerCase().trim() || (isMe && authUser?.email ? authUser.email.toLowerCase().trim() : undefined);
      const phoneQuery = checkPhone?.trim().replace(/[\s-]/g, "");
      const searchPhone = phoneQuery && phoneQuery.length >= 10 ? phoneQuery.slice(-10) : phoneQuery;

      const volunteer = await prisma.volunteer.findFirst({
        where: {
          OR: [
            ...(emailQuery ? [{ email: emailQuery }] : []),
            ...(searchPhone ? [{ phone: { contains: searchPhone } }] : []),
            ...(authUser ? [{ userId: authUser.userId }] : []),
          ],
        },
        orderBy: { createdAt: "desc" },
      });

      if (volunteer) {
        return NextResponse.json({
          success: true,
          registered: true,
          data: volunteer,
        });
      }

      return NextResponse.json({
        success: true,
        registered: false,
        data: null,
      });
    }

    // 2. Full roster list (Admin/Editor only)
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

// POST /api/volunteers - Submit volunteer registration with duplicate check & multi-select areas
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
      dob,
      gender,
      address,
      city,
      state,
      pincode,
      areasOfInterest,
      skills,
      availability,
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
          error: `You are already registered under ${existing.email} (Status: ${existing.status}). Our coordination desk has your contact information on record. Please call +91 94122 79000 if you wish to update your seva preferences.`,
          data: existing,
        },
        { status: 409 }
      );
    }

    const authUser = await getAuthUser(req);

    // Ensure areasOfInterest has array
    const finalAreas: string[] = Array.isArray(areasOfInterest) && areasOfInterest.length > 0
      ? areasOfInterest
      : body.areaOfInterest ? [body.areaOfInterest] : ["Education"];

    const volunteer = await prisma.volunteer.create({
      data: {
        name,
        email: normalizedEmail,
        phone: phone.trim(),
        dob: dob ? new Date(dob) : null,
        gender: gender || null,
        address: address || null,
        city: city || null,
        state: state || null,
        pincode: pincode || null,
        areasOfInterest: finalAreas,
        skills: skills || null,
        availability: availability || null,
        previousExperience: previousExperience || null,
        userId: authUser?.userId || null,
        status: "PENDING",
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Thank you for joining our volunteer taskforce! Our volunteer coordinator will reach out to you shortly.",
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
