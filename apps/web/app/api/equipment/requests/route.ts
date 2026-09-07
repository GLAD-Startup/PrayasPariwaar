import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

// GET /api/equipment/requests - Fetch all medical equipment loan requests
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const equipmentId = searchParams.get("equipmentId");

    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = authUser.role === "ADMIN";

    const requests = await prisma.equipmentRequest.findMany({
      where: {
        ...(status ? { status: status as any } : {}),
        ...(equipmentId ? { equipmentId } : {}),
        // Non-admins can only view their own requests
        ...(!isAdmin ? { requesterId: authUser.userId } : {}),
      },
      include: {
        equipment: {
          select: {
            id: true,
            name: true,
            slug: true,
            category: true,
            imageUrl: true,
            status: true,
          },
        },
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: requests,
    });
  } catch (error: any) {
    console.error("[Equipment Requests GET Error]", error);
    return NextResponse.json(
      { error: "Failed to fetch equipment requests", details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/equipment/requests - Create a new medical equipment borrow request
export async function POST(req: Request) {
  try {
    const body = await req.json();

    let targetEquipmentId = body.equipmentId;

    // If equipmentId not directly passed, resolve by name/type or category
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
        // Fallback to first available equipment item
        const firstItem = await prisma.medicalEquipment.findFirst();
        if (firstItem) {
          targetEquipmentId = firstItem.id;
        }
      }
    }

    if (!targetEquipmentId) {
      return NextResponse.json(
        { error: "No matching medical equipment found in inventory bank." },
        { status: 400 }
      );
    }

    const patientName = body.patientName?.trim() || "";
    const requesterName = body.requesterName?.trim() || patientName || "Beneficiary";
    const contactPhone = (body.contactPhone || body.phone || "").trim();
    const deliveryAddress = (body.deliveryAddress || body.address || "").trim();
    const city = (body.city || "Mathura").trim();
    const purpose = (body.purpose || body.notes || "Home medical recovery and respiratory/mobility assistance").trim();

    // Parse duration (e.g. "15 Days" -> 15 or 7)
    let requestedDays = 7;
    if (typeof body.requestedDays === "number") {
      requestedDays = body.requestedDays;
    } else if (body.duration) {
      const parsed = parseInt(String(body.duration).replace(/\D/g, ""), 10);
      if (!isNaN(parsed) && parsed > 0) requestedDays = parsed;
    }

    if (!requesterName || !contactPhone || !deliveryAddress) {
      return NextResponse.json(
        { error: "Please provide requester/patient name, contact phone, and delivery address." },
        { status: 400 }
      );
    }

    const authUser = await getAuthUser(req);
    let validRequesterId: string | null = null;
    if (authUser?.userId) {
      const userExists = await prisma.user.findUnique({
        where: { id: authUser.userId },
        select: { id: true },
      });
      if (userExists) {
        validRequesterId = userExists.id;
      }
    }

    const newRequest = await prisma.equipmentRequest.create({
      data: {
        equipmentId: targetEquipmentId,
        requesterName,
        patientName: patientName || requesterName,
        contactPhone,
        deliveryAddress,
        city,
        purpose,
        requestedDays,
        requesterId: validRequesterId,
        status: "PENDING",
      },
      include: {
        equipment: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Equipment loan request registered successfully! Our coordination desk will verify and dispatch shortly.",
        data: newRequest,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[Equipment Requests POST Error]", error);
    return NextResponse.json(
      { error: "Failed to create equipment request", details: error.message },
      { status: 500 }
    );
  }
}
