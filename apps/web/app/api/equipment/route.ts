import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { EquipmentRequestSchema } from "@prayas/utils";

// GET /api/equipment - List available medical equipment
export async function GET(req: Request) {
  try {
    const authUser = await getAuthUser(req);
    const isAdmin = authUser?.role === "ADMIN";

    const equipment = await prisma.medicalEquipment.findMany({
      orderBy: { createdAt: "desc" },
      ...(isAdmin
        ? {
            include: {
              requests: {
                orderBy: { createdAt: "desc" },
                take: 10,
              },
            },
          }
        : {}),
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
    let targetEquipmentId = body.equipmentId;

    if (!targetEquipmentId) {
      const searchTerm = body.equipmentType || body.equipmentName || body.name || "Oxygen";
      const matched = await prisma.medicalEquipment.findFirst({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: "insensitive" } },
            { category: { contains: searchTerm, mode: "insensitive" } },
            { description: { contains: searchTerm, mode: "insensitive" } },
          ],
        },
      });

      if (matched) {
        targetEquipmentId = matched.id;
      } else {
        const firstItem = await prisma.medicalEquipment.findFirst();
        if (firstItem) targetEquipmentId = firstItem.id;
      }
    }

    const patientName = body.patientName?.trim() || "";
    const requesterName = body.requesterName?.trim() || patientName || "Beneficiary";
    const contactPhone = (body.contactPhone || body.phone || "").trim();
    const deliveryAddress = (body.deliveryAddress || body.address || "").trim();
    const city = (body.city || "Mathura").trim();
    const purpose = (body.purpose || body.notes || "Home medical recovery support").trim();

    let requestedDays = 7;
    if (typeof body.requestedDays === "number") {
      requestedDays = body.requestedDays;
    } else if (body.duration) {
      const parsed = parseInt(String(body.duration).replace(/\D/g, ""), 10);
      if (!isNaN(parsed) && parsed > 0) requestedDays = parsed;
    }

    if (!targetEquipmentId || !requesterName || !contactPhone || !deliveryAddress) {
      return NextResponse.json(
        { error: "Please provide valid patient/requester name, contact number, and delivery address." },
        { status: 400 }
      );
    }

    const authUser = await getAuthUser(req);

    const request = await prisma.equipmentRequest.create({
      data: {
        equipmentId: targetEquipmentId,
        requesterName,
        patientName: patientName || requesterName,
        contactPhone,
        deliveryAddress,
        city,
        purpose,
        requestedDays,
        requesterId: authUser?.userId || null,
        status: "PENDING",
      },
      include: {
        equipment: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Equipment loan request submitted successfully. Our coordination team will contact you shortly.",
        data: request,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[Equipment POST Error]", error);
    return NextResponse.json({ error: "Failed to process request", details: error.message }, { status: 500 });
  }
}
