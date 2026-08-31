import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PartnershipType } from "@prisma/client";

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
