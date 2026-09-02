"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Global Error]", error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-4 font-sans bg-slate-50">
          <h2 className="text-2xl font-bold text-slate-900">Application Error</h2>
          <p className="text-sm text-slate-600 max-w-md">
            A critical application error occurred. Please try refreshing the page.
          </p>
          <button
            onClick={() => reset()}
            className="px-5 py-2.5 rounded-xl bg-emerald-700 text-white text-sm font-semibold hover:bg-emerald-800 transition-colors shadow-sm"
          >
            Refresh Page
          </button>
        </div>
      </body>
    </html>
  );
}
