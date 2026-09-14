"use client";

import { useState } from "react";
import { Lock, ShieldCheck, AlertCircle } from "lucide-react";
import { apiFetch } from "@/lib/api";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayCheckoutButtonProps {
  amount: number; // In Rupees (or paise if amountInPaise=true)
  amountInPaise?: boolean;
  currency?: string;
  receipt?: string;
  donorName?: string;
  donorEmail?: string;
  donorPhone?: string;
  projectOrCause?: string;
  projectId?: string;
  frequency?: "ONE_TIME" | "MONTHLY" | "YEARLY";
  isAnonymous?: boolean;
  buttonText?: string;
  className?: string;
  disabled?: boolean;
  onSuccess?: (result: {
    paymentId: string;
    orderId: string;
    signature: string;
    receipt?: string;
    donation?: any;
  }) => void;
  onFailure?: (error: string) => void;
  onDismiss?: () => void;
}

/**
 * Loads Razorpay Standard checkout.js script dynamically if not already injected.
 */
function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function RazorpayCheckoutButton({
  amount,
  amountInPaise = false,
  currency = "INR",
  receipt,
  donorName = "Supporter",
  donorEmail = "",
  donorPhone = "",
  projectOrCause = "General Seva Fund",
  projectId,
  frequency = "ONE_TIME",
  isAnonymous = false,
  buttonText,
  className = "",
  disabled = false,
  onSuccess,
  onFailure,
  onDismiss,
}: RazorpayCheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const calculatePaise = (): number => {
    if (amountInPaise) return Math.round(amount);
    return Math.round(amount * 100);
  };

  const handlePayment = async () => {
    const finalAmountInPaise = calculatePaise();
    if (finalAmountInPaise < 100) {
      const err = "Minimum payment amount is ₹1 (100 paise).";
      setErrorMessage(err);
      if (onFailure) onFailure(err);
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      // 1. Ensure Razorpay script is loaded
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error("Razorpay SDK failed to load. Please check your internet connection.");
      }

      // 2. Call backend order creation endpoint
      const res = await apiFetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: finalAmountInPaise,
          currency,
          receipt,
          donorName,
          donorEmail,
          donorPhone,
          projectOrCause,
          projectId,
          frequency,
          isAnonymous,
        }),
      });

      const orderData = await res.json();
      if (!res.ok || !orderData.order_id) {
        throw new Error(orderData.error || "Failed to initialize Razorpay payment order.");
      }

      // If in development sandbox fallback
      if (orderData.isSimulated) {
        const testPaymentId = `pay_sandbox_${Date.now()}`;
        const testSig = `sandbox_sig_${orderData.order_id}`;

        const verifyRes = await apiFetch("/api/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpay_order_id: orderData.order_id,
            razorpay_payment_id: testPaymentId,
            razorpay_signature: testSig,
          }),
        });

        const verifyData = await verifyRes.json();
        setLoading(false);
        if (onSuccess) {
          onSuccess({
            paymentId: testPaymentId,
            orderId: orderData.order_id,
            signature: testSig,
            receipt: verifyData.receipt,
            donation: verifyData.donation,
          });
        }
        return;
      }

      // 3. Configure Razorpay Standard Checkout modal
      const options = {
        key: orderData.key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_Tbsbstm4t3B2Ho",
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "Prayas Pariwaar",
        description: `Seva Contribution: ${projectOrCause}`,
        image: "https://gladstudio.net/prayas/icon.png",
        order_id: orderData.order_id,
        prefill: {
          name: isAnonymous ? "Anonymous Donor" : donorName,
          email: donorEmail,
          contact: donorPhone,
        },
        theme: {
          color: "#2E5339",
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            if (onDismiss) onDismiss();
          },
        },
        handler: async function (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) {
          try {
            // 4. Verify payment signature on backend
            const verifyRes = await apiFetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || !verifyData.success) {
              throw new Error(verifyData.error || "Cryptographic signature verification failed.");
            }

            setLoading(false);
            if (onSuccess) {
              onSuccess({
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                signature: response.razorpay_signature,
                receipt: verifyData.receipt,
                donation: verifyData.donation,
              });
            }
          } catch (verifyErr: any) {
            setLoading(false);
            const msg = verifyErr.message || "Payment verification failed on server.";
            setErrorMessage(msg);
            if (onFailure) onFailure(msg);
          }
        },
      };

      const rzp = new window.Razorpay(options);

      // Handle failure event
      rzp.on("payment.failed", function (response: any) {
        setLoading(false);
        const failReason =
          response.error?.description || response.error?.reason || "Payment was declined by bank/gateway.";
        setErrorMessage(`Payment Failed: ${failReason}`);
        if (onFailure) onFailure(failReason);
      });

      // Open checkout modal
      rzp.open();
    } catch (err: any) {
      setLoading(false);
      const errMsg = err.message || "An unexpected error occurred opening checkout.";
      setErrorMessage(errMsg);
      if (onFailure) onFailure(errMsg);
    }
  };

  const displayAmount = amountInPaise ? amount / 100 : amount;
  const defaultLabel = `Pay ₹${displayAmount.toLocaleString("en-IN")} via UPI / Card`;

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handlePayment}
        disabled={disabled || loading}
        className={`w-full py-3.5 px-6 rounded-lg text-sm font-bold bg-[#2E5339] text-white hover:bg-[#23432b] active:bg-[#1a3220] transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${className}`}
        style={{ backgroundColor: "#2E5339", color: "#ffffff" }}
      >
        <Lock className="w-4 h-4 shrink-0" />
        <span>{loading ? "Connecting to Razorpay..." : buttonText || defaultLabel}</span>
      </button>

      {errorMessage && (
        <div className="flex items-start gap-2 p-3 text-xs rounded-lg border border-red-200 bg-red-50 text-red-800">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
