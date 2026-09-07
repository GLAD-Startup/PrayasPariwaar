import crypto from "crypto";
import Razorpay from "razorpay";

export function getRazorpayClient(): Razorpay | null {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    console.warn("[Razorpay] Keys not configured in environment variables.");
    return null;
  }

  return new Razorpay({
    key_id,
    key_secret,
  });
}

const HEX_64_REGEX = /^[a-f0-9]{64}$/i;

/**
 * Safely compares two hex strings in constant time using crypto.timingSafeEqual.
 * Validates that both inputs are valid 64-character hex strings and ensures equal buffer lengths.
 */
function timingSafeCompareHex(expectedHex: string, providedHex: string): boolean {
  if (typeof providedHex !== "string" || !HEX_64_REGEX.test(providedHex)) {
    return false;
  }
  if (typeof expectedHex !== "string" || !HEX_64_REGEX.test(expectedHex)) {
    return false;
  }

  const expectedBuffer = Buffer.from(expectedHex.toLowerCase(), "hex");
  const providedBuffer = Buffer.from(providedHex.toLowerCase(), "hex");

  if (expectedBuffer.length !== providedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, providedBuffer);
}

/**
 * Verifies Razorpay payment checkout signature on client response in constant time
 */
export function verifyRazorpayPaymentSignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret || !params?.signature || !params?.orderId || !params?.paymentId) return false;

  const generatedSignature = crypto
    .createHmac("sha256", secret)
    .update(`${params.orderId}|${params.paymentId}`)
    .digest("hex");

  return timingSafeCompareHex(generatedSignature, params.signature);
}

/**
 * Verifies Razorpay Webhook signature (X-Razorpay-Signature header) in constant time
 */
export function verifyRazorpayWebhookSignature(
  rawPayload: string,
  signature: string,
  webhookSecret?: string
): boolean {
  const secret = webhookSecret || process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;
  if (!secret || !signature || typeof rawPayload !== "string") return false;

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(rawPayload)
    .digest("hex");

  return timingSafeCompareHex(expectedSignature, signature);
}

