import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { sendExpoPushNotification } from "@/lib/expo-push";
import { BloodRequestSchema, BloodGroupDisplayMap } from "@prayas/utils";

// GET /api/blood-requests - List blood donation requests
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const bloodGroup = searchParams.get("bloodGroup");
    const urgency = searchParams.get("urgency");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100);

    const where: any = {};
    if (status && status !== "ALL") where.status = status;
    if (bloodGroup && bloodGroup !== "ALL") where.bloodGroup = bloodGroup;
    if (urgency && urgency !== "ALL") where.urgency = urgency;

    const bloodRequests = await prisma.bloodRequest.findMany({
      where,
      orderBy: [
        { urgency: "desc" },
        { createdAt: "desc" },
      ],
      take: limit,
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, count: bloodRequests.length, data: bloodRequests });
  } catch (error: any) {
    console.error("[BloodRequests GET Error]", error);
    return NextResponse.json({ error: "Failed to fetch blood requests" }, { status: 500 });
  }
}

// POST /api/blood-requests - Create emergency blood request & dispatch push notifications
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = BloodRequestSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const {
      patientName,
      hospitalName,
      city,
      bloodGroup,
      unitsNeeded,
      urgency,
      contactPhone,
      notes,
    } = validated.data;

    // Optional authentication context
    const authUser = await getAuthUser(req);

    // 1. Insert into PostgreSQL via Prisma
    const newRequest = await prisma.bloodRequest.create({
      data: {
        patientName,
        hospitalName,
        city,
        bloodGroup: bloodGroup as any,
        unitsNeeded,
        urgency: urgency as any,
        contactPhone,
        notes: notes || null,
        requesterId: authUser?.userId || null,
        status: "PENDING",
      },
    });

    // 2. Fetch all registered Expo push tokens
    // Can notify all donors or filter donors with matching blood groups
    const pushTokenRecords = await prisma.pushToken.findMany({
      select: { expoPushToken: true },
      take: 500, // Batch limit
    });

    const tokens = pushTokenRecords.map((t) => t.expoPushToken);
    const displayGroup = BloodGroupDisplayMap[bloodGroup] || bloodGroup;

    let pushResult = { success: false, count: 0 };

    if (tokens.length > 0) {
      pushResult = await sendExpoPushNotification({
        to: tokens,
        title: `🚨 EMERGENCY: ${displayGroup} Blood Needed!`,
        body: `${unitsNeeded} units of ${displayGroup} needed urgently at ${hospitalName}, ${city}. Contact: ${contactPhone}`,
        priority: "high",
        data: {
          type: "BLOOD_REQUEST",
          requestId: newRequest.id,
          bloodGroup: newRequest.bloodGroup,
          urgency: newRequest.urgency,
          hospital: newRequest.hospitalName,
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Blood request submitted successfully and alerts broadcasted",
        data: newRequest,
        pushNotification: {
          attempted: tokens.length,
          delivered: pushResult.count,
          status: pushResult.success ? "SENT" : "FAILED_OR_NO_TOKENS",
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[BloodRequests POST Error]", error);
    return NextResponse.json(
      { error: "Failed to create blood request", details: error.message },
      { status: 500 }
    );
  }
}
