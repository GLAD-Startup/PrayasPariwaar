import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { EquipmentRequestSchema } from "@prayas/utils";

// GET /api/equipment - List available medical equipment
export async function GET() {
  try {
    const equipment = await prisma.medicalEquipment.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        requests: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    return NextResponse.json({ success: true, data: equipment });
  } catch (error: any) {
    console.error("[Equipment GET Error]", error);
    return NextResponse.json({ error: "Failed to fetch equipment" }, { status: 500 });
  }
}

// POST /api/equipment - Create inventory device (Admin) OR submit lease request (Public)
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Admin Creating New Medical Device Inventory
    if (body.name && body.category && !body.equipmentId) {
      const authUser = await getAuthUser(req);
      if (!authUser || (authUser.role !== "ADMIN" && authUser.role !== "EDITOR")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }

      const generatedSlug = (body.slug || body.name)
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .substring(0, 50) + `-${Date.now().toString().slice(-4)}`;

      const item = await prisma.medicalEquipment.create({
        data: {
          name: body.name,
          slug: generatedSlug,
          category: body.category || "General",
          description: body.description || "In free circulation for Vrindavan homecare.",
          quantity: Number(body.quantity || body.totalUnits || 1),
          status: body.status || "AVAILABLE",
          imageUrl: body.imageUrl || null,
        },
      });

      return NextResponse.json(
        {
          success: true,
          message: "New medical device added to inventory bank.",
          data: item,
        },
        { status: 201 }
      );
    }

    // 2. Patient / Family Borrowing Request
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
    return NextResponse.json({ error: "Failed to process request", details: error.message }, { status: 500 });
  }
}
