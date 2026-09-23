import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { CreateDonationOrderSchema, formatZodError } from "@prayas/utils";

// GET /api/donations - List donations (for authenticated user or admin overview)
export async function GET(req: Request) {
  try {
    const authUser = await getAuthUser(req);
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    const phoneParam = searchParams.get("phone") || searchParams.get("donorPhone");
    const emailParam = searchParams.get("email");

    let dbUser: any = null;
    if (authUser?.userId) {
      dbUser = await prisma.user.findUnique({
        where: { id: authUser.userId },
        select: { id: true, email: true, phone: true },
      });
    }

    const whereCondition: any = {};
    const orConditions: any[] = [];

    // Helper: generate common phone variants to guarantee database match regardless of formatting
    const getPhoneSearchVariants = (rawPhone: string): string[] => {
      if (!rawPhone) return [];
      const cleanDigits = rawPhone.replace(/\D/g, "");
      if (!cleanDigits) return [];
      const last10 = cleanDigits.length >= 10 ? cleanDigits.slice(-10) : cleanDigits;
      const variants = new Set<string>();
      variants.add(last10);
      variants.add(cleanDigits);
      if (last10.length === 10) {
        variants.add(`+91${last10}`);
        variants.add(`+91 ${last10}`);
        variants.add(`0${last10}`);
        variants.add(`${last10.slice(0, 5)} ${last10.slice(5)}`);
        variants.add(`${last10.slice(0, 5)}-${last10.slice(5)}`);
        variants.add(`+91 ${last10.slice(0, 5)} ${last10.slice(5)}`);
        variants.add(`+91-${last10}`);
      }
      return Array.from(variants);
    };

    const targetPhones = new Set<string>();
    if (dbUser?.phone) targetPhones.add(dbUser.phone);
    if (phoneParam) targetPhones.add(phoneParam);

    for (const phone of targetPhones) {
      const variants = getPhoneSearchVariants(phone);
      for (const variant of variants) {
        orConditions.push({ donorPhone: { contains: variant, mode: "insensitive" } });
      }
    }

    if (authUser && authUser.role !== "ADMIN") {
      if (authUser.userId) {
        orConditions.push({ donorId: authUser.userId });
      }
      if (authUser.email) {
        orConditions.push({ donorEmail: { equals: authUser.email.toLowerCase().trim(), mode: "insensitive" } });
      }
    }

    if (emailParam) {
      orConditions.push({ donorEmail: { equals: emailParam.toLowerCase().trim(), mode: "insensitive" } });
    }

    if (orConditions.length > 0) {
      whereCondition.OR = orConditions;
    }

    const statusParam = searchParams.get("status");
    if (statusParam) {
      whereCondition.status = statusParam.toUpperCase();
    } else if (searchParams.get("include_pending") !== "true") {
      whereCondition.status = "SUCCESS";
    }

    const [donations, total] = await Promise.all([
      prisma.donation.findMany({
        where: whereCondition,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          amount: true,
          currency: true,
          frequency: true,
          paymentMethod: true,
          donorName: true,
          donorPhone: true,
          donorEmail: true,
          projectOrCause: true,
          receiptNumber: true,
          status: true,
          createdAt: true,
          isAnonymous: true,
          certificate80GUrl: true,
        },
      }),
      prisma.donation.count({ where: whereCondition }),
    ]);

    return NextResponse.json({
      success: true,
      data: donations,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    console.error("[Donations GET Error]", error);
    return NextResponse.json(
      { error: "Failed to fetch donation records" },
      { status: 500 }
    );
  }
}

// POST /api/donations - Direct creation & recording of donations (mobile / app / cash seva)
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const validated = CreateDonationOrderSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: formatZodError(validated.error), details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const {
      amount,
      currency,
      frequency,
      paymentMethod,
      donorName,
      donorEmail,
      donorPhone,
      projectOrCause,
      isAnonymous,
    } = validated.data;

    const authUser = await getAuthUser(req);
    const receiptNumber = `SDT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const razorpayOrderId = `order_direct_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const donation = await prisma.donation.create({
      data: {
        amount,
        currency: currency || "INR",
        frequency,
        paymentMethod: paymentMethod || "UPI",
        donorName: isAnonymous ? "Anonymous Donor" : donorName,
        donorEmail: donorEmail.toLowerCase().trim(),
        donorPhone: donorPhone || null,
        projectOrCause: projectOrCause || "General Fund & Emergency Relief",
        receiptNumber,
        isAnonymous,
        razorpayOrderId,
        donorId: authUser?.userId || null,
        status: "SUCCESS",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Donation recorded successfully",
      receiptNumber,
      data: donation,
    });
  } catch (error: any) {
    console.error("[Donations POST Error]", error);
    return NextResponse.json(
      { error: "Failed to process donation", details: error.message },
      { status: 500 }
    );
  }
}
