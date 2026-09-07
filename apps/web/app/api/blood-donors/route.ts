import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { BloodGroup } from "@prisma/client";

// Helper to convert UI Blood Group strings (e.g. "O+", "A-") to Prisma Enum
function formatBloodGroup(bg: string): BloodGroup {
  const map: Record<string, BloodGroup> = {
    "A+": "A_POSITIVE",
    "A-": "A_NEGATIVE",
    "B+": "B_POSITIVE",
    "B-": "B_NEGATIVE",
    "AB+": "AB_POSITIVE",
    "AB-": "AB_NEGATIVE",
    "O+": "O_POSITIVE",
    "O-": "O_NEGATIVE",
    "A_POS": "A_POSITIVE",
    "A_NEG": "A_NEGATIVE",
    "B_POS": "B_POSITIVE",
    "B_NEG": "B_NEGATIVE",
    "AB_POS": "AB_POSITIVE",
    "AB_NEG": "AB_NEGATIVE",
    "O_POS": "O_POSITIVE",
    "O_NEG": "O_NEGATIVE",
  };
  return map[bg] || "O_POSITIVE";
}

// GET /api/blood-donors - Lookup donor status by email/phone or list all (Admin)
export async function GET(req: Request) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const checkPhone = searchParams.get("phone") || searchParams.get("checkPhone");
    const checkEmail = searchParams.get("email") || searchParams.get("checkEmail");
    const isMe = searchParams.get("me") === "true";

    // 1. Non-admin users: can only access their own donor record
    if (authUser.role !== "ADMIN") {
      // Prevent cross-user enumeration/scraping
      if (checkEmail && checkEmail.toLowerCase().trim() !== authUser.email.toLowerCase().trim()) {
        return NextResponse.json({ error: "Forbidden. Cannot query other donor records." }, { status: 403 });
      }

      // If neither self-lookup nor specific check is present, non-admins cannot list the directory
      if (!isMe && !checkPhone && !checkEmail) {
        return NextResponse.json({ error: "Forbidden. Admin privileges required to view donor directory." }, { status: 403 });
      }

      const donor = await prisma.user.findFirst({
        where: {
          id: authUser.userId,
          bloodGroup: { not: null },
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          bloodGroup: true,
          city: true,
          isActive: true,
          createdAt: true,
        },
      });

      return NextResponse.json({
        success: true,
        registered: !!donor,
        data: donor || null,
      });
    }

    // 2. Admin: Lookup specific donor by phone/email or list directory
    if (checkPhone || checkEmail) {
      const emailQuery = checkEmail?.toLowerCase().trim();
      const phoneQuery = checkPhone?.trim().replace(/[\s-]/g, "");

      const donor = await prisma.user.findFirst({
        where: {
          OR: [
            ...(emailQuery ? [{ email: emailQuery }] : []),
            ...(phoneQuery ? [{ phone: phoneQuery }] : []),
          ],
          bloodGroup: { not: null },
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          bloodGroup: true,
          city: true,
          isActive: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json({
        success: true,
        registered: !!donor,
        data: donor || null,
      });
    }

    const bloodGroupFilter = searchParams.get("bloodGroup");
    const cityFilter = searchParams.get("city");

    const donors = await prisma.user.findMany({
      where: {
        bloodGroup: bloodGroupFilter ? formatBloodGroup(bloodGroupFilter) : { not: null },
        ...(cityFilter ? { city: { contains: cityFilter, mode: "insensitive" } } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        bloodGroup: true,
        city: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: donors });
  } catch (error: any) {
    console.error("[Blood Donors GET Error]", error);
    return NextResponse.json({ error: "Failed to fetch blood donors" }, { status: 500 });
  }
}

// POST /api/blood-donors - Register voluntary blood donor with duplicate detection
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, email, bloodGroup, city } = body;

    if (!name || !phone || !bloodGroup) {
      return NextResponse.json(
        { error: "Name, Phone Number, and Blood Group are required." },
        { status: 400 }
      );
    }

    const cleanPhone = phone.trim().replace(/[\s-]/g, "");
    const searchPhone = cleanPhone.length >= 10 ? cleanPhone.slice(-10) : cleanPhone;
    const normalizedEmail = email ? email.toLowerCase().trim() : undefined;

    // 1. Check if already registered
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: { contains: searchPhone } },
          ...(normalizedEmail ? [{ email: normalizedEmail }] : []),
        ],
        bloodGroup: { not: null },
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        bloodGroup: true,
        city: true,
        createdAt: true,
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          alreadyRegistered: true,
          error: `${existing.name} is already registered as a voluntary ${existing.bloodGroup?.replace("_POSITIVE", "+").replace("_NEGATIVE", "-")} blood donor with Prayas Pariwaar.`,
          data: existing,
        },
        { status: 409 }
      );
    }

    // 2. Register new donor
    const authUser = await getAuthUser(req);
    const prismaBloodGroup = formatBloodGroup(bloodGroup);

    // If logged in, update user record with donor status
    if (authUser?.userId) {
      const updatedUser = await prisma.user.update({
        where: { id: authUser.userId },
        data: {
          name: name.trim(),
          phone: phone.trim(),
          bloodGroup: prismaBloodGroup,
          city: city?.trim() || "Mathura / Vrindavan",
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          bloodGroup: true,
          city: true,
          createdAt: true,
        },
      });

      return NextResponse.json({ success: true, data: updatedUser }, { status: 201 });
    }

    // Otherwise create or update by phone
    const fallbackEmail = normalizedEmail || `donor.${searchPhone}@prayas.donor.local`;

    const donorUser = await prisma.user.upsert({
      where: { email: fallbackEmail },
      create: {
        name: name.trim(),
        phone: phone.trim(),
        email: fallbackEmail,
        passwordHash: "DONOR_REGISTERED_WITHOUT_PASSWORD",
        bloodGroup: prismaBloodGroup,
        city: city?.trim() || "Mathura / Vrindavan",
        role: "VOLUNTEER",
      },
      update: {
        name: name.trim(),
        phone: phone.trim(),
        bloodGroup: prismaBloodGroup,
        city: city?.trim() || "Mathura / Vrindavan",
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        bloodGroup: true,
        city: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, data: donorUser }, { status: 201 });
  } catch (error: any) {
    console.error("[Blood Donors POST Error]", error);
    return NextResponse.json(
      { error: "Failed to register blood donor", details: error.message },
      { status: 500 }
    );
  }
}
