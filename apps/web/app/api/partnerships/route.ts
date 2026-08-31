import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PartnershipType } from "@prisma/client";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || (authUser.role !== "ADMIN" && authUser.role !== "EDITOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const partnerships = await prisma.partnershipInquiry.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: partnerships });
  } catch (error: any) {
    console.error("[Partnership GET Error]", error);
    return NextResponse.json({ error: "Failed to fetch inquiries" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, name, email, phone, organizationName, message } = body;

    if (!name || !email || !phone) {
      return NextResponse.json({ error: "Name, email, and phone number are required" }, { status: 400 });
    }

    const inquiry = await prisma.partnershipInquiry.create({
      data: {
        type: type === "CORPORATE" ? PartnershipType.CORPORATE : PartnershipType.INDIVIDUAL,
        name,
        email: email.toLowerCase().trim(),
        phone,
        organizationName: organizationName || null,
        message: message || null,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Thank you for your partnership inquiry. Our General Secretary will contact you.",
      data: inquiry,
    });
  } catch (error: any) {
    console.error("[Partnership POST Error]", error);
    return NextResponse.json({ error: "Failed to submit partnership inquiry" }, { status: 500 });
  }
}
