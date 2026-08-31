import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { EquipmentRequestSchema } from "@prayas/utils";

// GET /api/equipment - List available medical equipment
export async function GET() {
  try {
    const equipment = await prisma.medicalEquipment.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: equipment });
  } catch (error: any) {
    console.error("[Equipment GET Error]", error);
    return NextResponse.json({ error: "Failed to fetch equipment" }, { status: 500 });
  }
}

// POST /api/equipment - Submit equipment lease request
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = EquipmentRequestSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const {
      equipmentId,
      requesterName,
      contactPhone,
      purpose,
      requestedDays,
      deliveryAddress,
    } = validated.data;

    const authUser = await getAuthUser(req);

    const request = await prisma.equipmentRequest.create({
      data: {
        equipmentId,
        requesterName,
        contactPhone,
        purpose,
        requestedDays,
        deliveryAddress,
        requesterId: authUser?.userId || null,
        status: "PENDING",
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Equipment request submitted successfully. Our team will contact you shortly.",
        data: request,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[Equipment POST Error]", error);
    return NextResponse.json({ error: "Failed to submit request" }, { status: 500 });
  }
}
