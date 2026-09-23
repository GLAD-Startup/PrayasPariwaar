"use client";

import React, { useState, useEffect, Suspense } from "react";
import Script from "next/script";
import { useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api";

declare global {
  interface Window {
    Razorpay: any;
  }
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id") || "";
  const amountStr = searchParams.get("amount") || "100000"; // in paise
  const keyIdParam = searchParams.get("key_id") || "";
  const currency = searchParams.get("currency") || "INR";
  const donorName = searchParams.get("name") || "";
  const donorEmail = searchParams.get("email") || "";
  const donorPhone = searchParams.get("phone") || "";
  const cause = searchParams.get("cause") || "General Seva Fund";

  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [status, setStatus] = useState<"loading" | "ready" | "processing" | "success" | "dismissed" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [receiptNumber, setReceiptNumber] = useState<string>("");

  const keyId =
    keyIdParam ||
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
    "rzp_live_TeXwRoahNczEgu";

  const amountNumber = parseInt(amountStr, 10) || 10000;
  const amountInRupees = (amountNumber / 100).toLocaleString("en-IN");

  const openRazorpay = () => {
    if (typeof window === "undefined" || !window.Razorpay) {
      setErrorMessage("Razorpay gateway script is still loading. Please wait a moment.");
      return;
    }

    if (!orderId) {
      setErrorMessage("Invalid payment request: missing order ID.");
      setStatus("error");
      return;
    }

    setStatus("processing");
    setErrorMessage(null);

    const options = {
      key: keyId,
      amount: amountNumber,
      currency: currency.toUpperCase(),
      name: "Prayas Samiti",
      description: `${cause} • Seva Contribution`,
      image: "https://gladstudio.net/prayas/images/logo.png",
      order_id: orderId,
      prefill: {
        name: donorName,
        email: donorEmail,
        contact: donorPhone,
      },
      theme: {
        color: "#166534",
        backdrop_color: "rgba(15, 23, 42, 0.8)",
      },
      modal: {
        confirm_close: true,
        ondismiss: function () {
          setStatus("dismissed");
        },
      },
      handler: async function (response: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
      }) {
        setStatus("loading");
        try {
          const verifyRes = await apiFetch("/api/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              donorPhone,
              donorName,
              donorEmail,
              projectOrCause: cause,
              amount: amountNumber,
              currency,
            }),
          });

          const data = await verifyRes.json();
          if (!verifyRes.ok || !data.success) {
            throw new Error(data.error || "Payment verification failed on server.");
          }

          const receipt = data.receipt || data.donation?.receiptNumber || `SDT-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
          setReceiptNumber(receipt);
          setStatus("success");

          // Build deep link for mobile app
          const deepLink = `prayas://payment-success?payment_id=${encodeURIComponent(
            response.razorpay_payment_id
          )}&order_id=${encodeURIComponent(
            response.razorpay_order_id
          )}&signature=${encodeURIComponent(
            response.razorpay_signature
          )}&receipt=${encodeURIComponent(receipt)}&amount=${amountNumber / 100}&donorName=${encodeURIComponent(
            donorName
          )}&donorPhone=${encodeURIComponent(donorPhone)}&cause=${encodeURIComponent(cause)}`;

          // Redirect to mobile app via deep link
          setTimeout(() => {
            window.location.href = deepLink;
          }, 600);
        } catch (err: any) {
          console.error("Verification error:", err);
          setStatus("error");
          setErrorMessage(err?.message || "Failed to verify transaction with server.");
        }
      },
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        setStatus("error");
        setErrorMessage(
          response.error?.description || response.error?.reason || "Payment was declined by bank."
        );
      });
      rzp.open();
    } catch (e: any) {
      console.error("Error opening Razorpay:", e);
      setStatus("error");
      setErrorMessage(e?.message || "Could not launch Razorpay checkout.");
    }
  };

  // Automatically trigger Razorpay when script loads and orderId is available
  useEffect(() => {
    if (scriptLoaded && orderId && status === "loading") {
      openRazorpay();
    }
  }, [scriptLoaded, orderId]);

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
        onLoad={() => {
          setScriptLoaded(true);
        }}
        onError={() => {
          setStatus("error");
          setErrorMessage("Failed to load Razorpay script. Please check your internet connection.");
        }}
      />

      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-800/90 backdrop-blur-md rounded-2xl p-6 border border-slate-700 shadow-2xl text-center">
          {/* Brand Emblem */}
          <div className="w-16 h-16 rounded-full bg-emerald-900/60 border-2 border-emerald-500/40 mx-auto flex items-center justify-center mb-4 shadow-inner">
            <svg
              className="w-8 h-8 text-emerald-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>

          <h1 className="text-xl font-bold text-white mb-1">Razorpay Secure Checkout</h1>
          <p className="text-xs text-slate-400 mb-6">Prayas Samiti (18 Years Grassroots Seva)</p>

          {/* Amount Card */}
          <div className="bg-slate-900/80 rounded-xl p-4 mb-6 border border-slate-700/60">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Contribution Amount
            </div>
            <div className="text-3xl font-extrabold text-emerald-400">₹{amountInRupees}</div>
            <div className="text-xs text-slate-400 mt-2 truncate font-medium">
              {cause}
            </div>
            {donorPhone && (
              <div className="text-xs text-emerald-400/80 mt-1 font-mono">
                📱 {donorPhone}
              </div>
            )}
          </div>

          {/* Status Display */}
          {status === "loading" && (
            <div className="flex flex-col items-center py-4">
              <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-sm text-slate-300 font-medium">Connecting to Razorpay gateway...</p>
            </div>
          )}

          {status === "processing" && (
            <div className="flex flex-col items-center py-2">
              <p className="text-sm text-emerald-400 font-medium mb-4">
                Razorpay Checkout is active.
              </p>
              <button
                onClick={openRazorpay}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition shadow-lg shadow-emerald-900/40 text-sm"
              >
                Reopen Payment Sheet
              </button>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center mb-3 text-emerald-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-white mb-1">Payment Successful!</h2>
              <p className="text-xs text-emerald-400 font-mono mb-4">
                Receipt #{receiptNumber}
              </p>
              <p className="text-xs text-slate-400 mb-4">
                Returning you to Prayas App...
              </p>
              <a
                href={`prayas://payment-success?receipt=${encodeURIComponent(receiptNumber)}&amount=${amountNumber / 100}&phone=${encodeURIComponent(donorPhone)}`}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition text-sm"
              >
                Return to Prayas App
              </a>
            </div>
          )}

          {status === "dismissed" && (
            <div className="flex flex-col items-center py-2">
              <p className="text-sm text-amber-400 mb-4 font-medium">
                Payment was not completed.
              </p>
              <div className="flex gap-2 w-full">
                <button
                  onClick={openRazorpay}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition text-sm"
                >
                  Retry Payment
                </button>
                <a
                  href="prayas://payment-cancelled"
                  className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold rounded-xl transition text-sm flex items-center justify-center"
                >
                  Return to App
                </a>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center py-2">
              <p className="text-sm text-red-400 mb-4 font-medium">
                {errorMessage || "Unable to proceed with payment."}
              </p>
              <div className="flex gap-2 w-full">
                <button
                  onClick={openRazorpay}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition text-sm"
                >
                  Try Again
                </button>
                <a
                  href="prayas://payment-cancelled"
                  className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold rounded-xl transition text-sm flex items-center justify-center"
                >
                  Cancel
                </a>
              </div>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-slate-700/60 flex items-center justify-center text-[11px] text-slate-400 gap-1.5">
            <svg className="w-3.5 h-3.5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
            <span>256-bit Encrypted SSL • Razorpay Certified</span>
          </div>
        </div>
      </div>
    </>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
