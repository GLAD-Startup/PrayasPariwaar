import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || (authUser.role !== "ADMIN" && authUser.role !== "EDITOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: messages });
  } catch (error: any) {
    console.error("[Contact GET Error]", error);
    return NextResponse.json({ error: "Failed to fetch contact messages" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email, and message are required" }, { status: 400 });
    }

    const contact = await prisma.contactMessage.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        phone: phone || null,
        subject: subject || "General Inquiry",
        message,
        isRead: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Your message has been received. Our office will respond within 24 hours.",
      data: contact,
    });
  } catch (error: any) {
    console.error("[Contact POST Error]", error);
    return NextResponse.json({ error: "Failed to submit message" }, { status: 500 });
  }
}
