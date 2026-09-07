import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { VolunteerSchema, formatZodError } from "@prayas/utils";

// GET /api/volunteers - List volunteers or check individual application status
export async function GET(req: Request) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const checkEmail = searchParams.get("email") || searchParams.get("checkEmail");
    const checkPhone = searchParams.get("phone") || searchParams.get("checkPhone");
    const isMe = searchParams.get("me") === "true";

    // 1. Non-admin users: can only access their own volunteer application
    if (authUser.role !== "ADMIN") {
      // Prevent cross-user enumeration/scraping
      if (checkEmail && checkEmail.toLowerCase().trim() !== authUser.email.toLowerCase().trim()) {
        return NextResponse.json({ error: "Forbidden. Cannot query other volunteer applications." }, { status: 403 });
      }

      // Non-admins cannot dump the full directory
      if (!isMe && !checkEmail && !checkPhone) {
        return NextResponse.json({ error: "Forbidden. Admin privileges required to view volunteer directory." }, { status: 403 });
      }

      const volunteer = await prisma.volunteer.findFirst({
        where: {
          OR: [
            { userId: authUser.userId },
            { email: authUser.email.toLowerCase().trim() },
          ],
        },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json({
        success: true,
        registered: !!volunteer,
        data: volunteer || null,
      });
    }

    // 2. Admin: Specific applicant status lookup by Email or Phone
    if (checkEmail || checkPhone) {
      const emailQuery = checkEmail?.toLowerCase().trim();
      const phoneQuery = checkPhone?.trim().replace(/[\s-]/g, "");

      const whereOr: any[] = [];
      if (emailQuery) whereOr.push({ email: emailQuery });
      if (phoneQuery) whereOr.push({ phone: phoneQuery });

      const volunteer = await prisma.volunteer.findFirst({
        where: { OR: whereOr },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json({
        success: true,
        registered: !!volunteer,
        data: volunteer || null,
      });
    }

    // 3. Admin: Full roster list
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
      // If already registered, update existing record with new details instead of failing
      const finalAreas: string[] = Array.isArray(areasOfInterest) && areasOfInterest.length > 0
        ? areasOfInterest
        : body.areaOfInterest ? [body.areaOfInterest] : ["Free Education"];

      const updated = await prisma.volunteer.update({
        where: { id: existing.id },
        data: {
          name,
          phone: phone.trim(),
          dob: dob ? new Date(dob) : existing.dob,
          gender: gender || existing.gender,
          address: address || existing.address,
          city: city || existing.city,
          state: state || existing.state,
          pincode: pincode || existing.pincode,
          areasOfInterest: finalAreas,
          skills: skills || existing.skills,
          availability: availability || existing.availability,
          previousExperience: previousExperience || existing.previousExperience,
        },
      });

      return NextResponse.json(
        {
          success: true,
          alreadyRegistered: true,
          message: "Your existing volunteer profile has been updated.",
          data: updated,
        },
        { status: 200 }
      );
    }

    const authUser = await getAuthUser(req);
    let validUserId: string | null = null;
    if (authUser?.userId) {
      const userExists = await prisma.user.findUnique({
        where: { id: authUser.userId },
        select: { id: true },
      });
      if (userExists) {
        validUserId = userExists.id;
      }
    }

    if (!validUserId) {
      const userByEmail = await prisma.user.findUnique({
        where: { email: normalizedEmail },
        select: { id: true },
      });
      if (userByEmail) {
        validUserId = userByEmail.id;
      }
    }

    // Ensure areasOfInterest has array
    const finalAreas: string[] = Array.isArray(areasOfInterest) && areasOfInterest.length > 0
      ? areasOfInterest
      : body.areaOfInterest ? [body.areaOfInterest] : ["Free Education"];

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
        userId: validUserId,
        status: "PENDING",
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Thank you for joining our volunteer taskforce! Your application has been submitted to the admin desk.",
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
