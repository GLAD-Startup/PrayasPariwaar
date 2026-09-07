import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyRazorpayWebhookSignature } from "@/lib/razorpay";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    // 1. Read the raw request body string directly
    const rawBody = await req.text();

    // 2. Obtain the Razorpay signature header
    const signature = req.headers.get("x-razorpay-signature");
    if (!signature) {
      return NextResponse.json({ error: "Missing signature header" }, { status: 400 });
    }

    // 3. Verify server-side secret configuration
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;
    if (!webhookSecret) {
      console.error("[Razorpay Webhook Error] Webhook secret not configured in server environment.");
      return NextResponse.json({ error: "Webhook verification configuration error" }, { status: 500 });
    }

    // 4. Verify HMAC-SHA256 signature in constant time BEFORE any database access
    const isValid = verifyRazorpayWebhookSignature(rawBody, signature, webhookSecret);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
    }

    // 5. Parse and validate JSON payload only AFTER successful cryptographic verification
    let event: any;
    try {
      event = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    // 6. Filter for supported payment capture events
    if (event?.event !== "payment.captured" && event?.event !== "order.paid") {
      return NextResponse.json({ status: "ok", received: true, ignored: true });
    }

    // 7. Validate required event entities and identifiers
    const paymentEntity = event.payload?.payment?.entity;
    const orderId = paymentEntity?.order_id || event.payload?.order?.entity?.id;
    const paymentId = paymentEntity?.id;

    if (!orderId || typeof orderId !== "string") {
      return NextResponse.json({ error: "Missing order identifier in event payload" }, { status: 400 });
    }

    // 8. Query database for corresponding donation order
    const donation = await prisma.donation.findUnique({
      where: { razorpayOrderId: orderId },
    });

    if (!donation) {
      return NextResponse.json({ error: "Donation order not found" }, { status: 404 });
    }

    // 9. Idempotency & conflicting payment verification using existing schema
    if (donation.status === "SUCCESS") {
      // Safe duplicate acknowledgment: same payment ID already processed
      if (paymentId && donation.razorpayPaymentId && donation.razorpayPaymentId === paymentId) {
        return NextResponse.json({
          status: "ok",
          received: true,
          idempotent: true,
        });
      }

      // Anomaly: different payment ID attempting to overwrite an already successful donation
      console.warn(`[Donation Webhook] Conflicting payment ID for completed order: ${orderId}`);
      return NextResponse.json(
        { error: "Conflicting payment identifier for completed donation" },
        { status: 409 }
      );
    }

    // 10. Update donation status to SUCCESS
    await prisma.donation.update({
      where: { id: donation.id },
      data: {
        status: "SUCCESS",
        razorpayPaymentId: paymentId || null,
        razorpaySignature: signature,
      },
    });

    console.log(`[Donation Webhook] Successfully processed donation for order: ${orderId}`);
    return NextResponse.json({ status: "ok", received: true });
  } catch (error: any) {
    console.error("[Razorpay Webhook Error] Processing failed");
    return NextResponse.json({ error: "Webhook processing error" }, { status: 500 });
  }
}

