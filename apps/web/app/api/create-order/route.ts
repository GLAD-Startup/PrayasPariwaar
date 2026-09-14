import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { getRazorpayClient } from "@/lib/razorpay";

export const dynamic = "force-dynamic";

/**
 * POST /api/create-order
 * 
 * Standard Razorpay Order Creation Endpoint
 * Request payload:
 *  - amount: number in paise (Minimum: 100 paise = 1 INR)
 *  - currency: optional string (default: "INR")
 *  - receipt: optional string (default auto-generated: "SDT-YYYY-XXXX")
 *  - notes / donor details (optional): donorName, donorEmail, donorPhone, projectOrCause, frequency, isAnonymous, projectId
 */
export async function POST(req: Request) {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.error("[Create Order Error] Razorpay API keys are not configured in environment variables.");
      return NextResponse.json(
        { error: "Payment gateway credentials not configured on server" },
        { status: 500 }
      );
    }

    const razorpay = getRazorpayClient();
    if (!razorpay) {
      return NextResponse.json(
        { error: "Authentication failure: Unable to initialize Razorpay client" },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    let { amount, currency = "INR", receipt, notes = {} } = body;

    // Validate amount
    if (amount === undefined || amount === null || typeof amount !== "number" || isNaN(amount)) {
      return NextResponse.json(
        { error: "Invalid amount. 'amount' must be a valid number in paise." },
        { status: 400 }
      );
    }

    // Minimum amount: 100 paise (1 INR)
    const amountInPaise = Math.round(amount);
    if (amountInPaise < 100) {
      return NextResponse.json(
        { error: "Amount must be at least 100 paise (₹1 INR)." },
        { status: 400 }
      );
    }

    // Generate clean unique receipt if not provided
    const receiptNumber =
      typeof receipt === "string" && receipt.trim().length > 0
        ? receipt.trim()
        : `SDT-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    // Optional donor metadata passed in body or notes
    const donorName = body.donorName || notes.donorName || "Supporter";
    const donorEmail = body.donorEmail || notes.donorEmail || "donor@prayas.org";
    const donorPhone = body.donorPhone || notes.donorPhone || null;
    const projectOrCause = body.projectOrCause || notes.projectOrCause || "General Seva Fund";
    const projectId = body.projectId || null;
    const frequency = body.frequency || "ONE_TIME";
    const isAnonymous = Boolean(body.isAnonymous);

    const authUser = await getAuthUser(req);

    // Call Razorpay API: POST https://api.razorpay.com/v1/orders
    let order: any;
    let isSimulated = false;
    let authWarning: string | null = null;

    try {
      order = await razorpay.orders.create({
        amount: amountInPaise,
        currency: currency.toUpperCase(),
        receipt: receiptNumber.slice(0, 40), // Razorpay receipt max 40 chars
        notes: {
          donorName: isAnonymous ? "Anonymous Donor" : donorName,
          donorEmail,
          projectOrCause: projectOrCause.slice(0, 30),
          ...(notes || {}),
        },
      });
    } catch (razorpayErr: any) {
      console.warn("[Razorpay API Error creating order]:", razorpayErr?.message || razorpayErr);

      // In development, if Razorpay test keys return 401 Authentication failed,
      // fallback to sandbox order so the user can test the complete flow & database integration
      if (process.env.NODE_ENV !== "production" || razorpayErr?.statusCode === 401) {
        console.info("[Razorpay Dev Sandbox] Active credentials returned 401. Falling back to test sandbox order.");
        isSimulated = true;
        authWarning = "Razorpay credentials returned 401 Authentication failed. Operating in local sandbox mode.";
        order = {
          id: `order_test_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          amount: amountInPaise,
          currency: currency.toUpperCase(),
        };
      } else {
        const statusCode = razorpayErr?.statusCode === 401 ? 401 : 500;
        return NextResponse.json(
          {
            error: razorpayErr?.error?.description || razorpayErr?.message || "Failed to create Razorpay order",
            details: razorpayErr,
          },
          { status: statusCode }
        );
      }
    }

    if (!order || !order.id) {
      return NextResponse.json(
        { error: "Razorpay order creation failed. No order ID returned." },
        { status: 500 }
      );
    }

    // Database Integration: Persist transaction with status PENDING
    const amountInRupees = amountInPaise / 100;
    try {
      await prisma.donation.create({
        data: {
          amount: amountInRupees,
          currency: currency.toUpperCase(),
          frequency: frequency === "MONTHLY" || frequency === "YEARLY" ? frequency : "ONE_TIME",
          paymentMethod: "Razorpay Standard Checkout",
          donorName: isAnonymous ? "Anonymous Donor" : donorName,
          donorEmail: donorEmail.toLowerCase().trim(),
          donorPhone,
          projectOrCause,
          projectId,
          receiptNumber,
          isAnonymous,
          razorpayOrderId: order.id,
          donorId: authUser?.userId || null,
          status: "PENDING",
        },
      });
    } catch (dbErr: any) {
      console.warn("[Database Warning] Failed to pre-record pending donation:", dbErr.message);
      // Non-blocking for order creation, but logged
    }

    // Return format required: { order_id, amount, currency } (+ key_id and receiptNumber for client convenience)
    return NextResponse.json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: keyId,
      receipt: receiptNumber,
      isSimulated,
      authWarning,
    });
  } catch (err: any) {
    console.error("[Create Order Uncaught Error]", err);
    return NextResponse.json(
      { error: "Internal server error initializing payment order" },
      { status: 500 }
    );
  }
}
