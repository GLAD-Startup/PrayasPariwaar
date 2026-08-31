import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { getRazorpayClient } from "@/lib/razorpay";
import { CreateDonationOrderSchema } from "@prayas/utils";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = CreateDonationOrderSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { amount, currency, donorName, donorEmail, donorPhone, projectOrCause } = validated.data;
    const authUser = await getAuthUser(req);

    const razorpay = getRazorpayClient();
    let razorpayOrderId = `order_sim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    if (razorpay) {
      try {
        const order = await razorpay.orders.create({
          amount: Math.round(amount * 100), // amount in paise
          currency: currency || "INR",
          receipt: `rcpt_${Date.now().toString().slice(-8)}`,
          notes: {
            donorName,
            donorEmail,
            projectOrCause,
          },
        });
        razorpayOrderId = order.id;
      } catch (err: any) {
        console.warn("[Razorpay Order Creation Failed, falling back to simulated order]", err.message);
      }
    }

    const donation = await prisma.donation.create({
      data: {
        amount,
        currency,
        donorName,
        donorEmail: donorEmail.toLowerCase().trim(),
        donorPhone: donorPhone || null,
        projectOrCause,
        razorpayOrderId,
        donorId: authUser?.userId || null,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      success: true,
      orderId: razorpayOrderId,
      amount: Math.round(amount * 100),
      currency,
      keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_mock_key",
      donationId: donation.id,
    });
  } catch (error: any) {
    console.error("[Donation Create Order Error]", error);
    return NextResponse.json({ error: "Failed to initialize donation order" }, { status: 500 });
  }
}
