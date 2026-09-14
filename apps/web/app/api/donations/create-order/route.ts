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

    const razorpay = getRazorpayClient();
    let razorpayOrderId = `order_sim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const receiptNumber = `SDT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    if (razorpay) {
      try {
        const order = await razorpay.orders.create({
          amount: Math.round(amount * 100), // amount in paise
          currency: currency || "INR",
          receipt: receiptNumber,
          notes: {
            donorName: isAnonymous ? "Anonymous Donor" : donorName,
            donorEmail,
            projectOrCause,
            frequency,
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
        frequency,
        paymentMethod: paymentMethod || "UPI",
        donorName: isAnonymous ? "Anonymous Donor" : donorName,
        donorEmail: donorEmail.toLowerCase().trim(),
        donorPhone: donorPhone || null,
        projectOrCause,
        receiptNumber,
        isAnonymous,
        razorpayOrderId,
        donorId: authUser?.userId || null,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      success: true,
      orderId: razorpayOrderId,
      order_id: razorpayOrderId,
      receiptNumber,
      amount: Math.round(amount * 100),
      currency,
      keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_mock_key",
      key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_mock_key",
      donationId: donation.id,
    });
  } catch (error: any) {
    console.error("[Donation Create Order Error]", error);
    return NextResponse.json({ error: "Failed to initialize donation order" }, { status: 500 });
  }
}
