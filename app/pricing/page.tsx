"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function PricingPage() {
  const [loading, setLoading] = useState(false);

  const upgrade = async () => {
    setLoading(true);

    const { data } = await supabase.auth.getUser();
    const user = data.user;

    if (!user) {
      alert("Please login first");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/pay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: user.email,
        userId: user.id,
      }),
    });

    const json = await res.json();

    if (json.url) {
      window.location.href = json.url;
    } else {
      alert("Payment failed");
    }

    setLoading(false);
  };

  return (
    // ✅ SINGLE ROOT WRAPPER (THIS FIXES YOUR ERROR)
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      
      <div className="bg-gray-900 p-8 rounded-xl border border-gray-800 max-w-md w-full">
        
        <h1 className="text-4xl font-bold text-yellow-400 mb-6 text-center">
          Falcon X Pricing
        </h1>

        {/* VALUE COMPARISON */}
        <div className="bg-gray-800 p-4 rounded mb-6 text-sm">
          <p className="text-gray-300">FREE:</p>
          <p className="text-gray-500">• Limited AI credits</p>

          <p className="mt-3 text-green-400">PRO:</p>
          <p className="text-green-400">
            • Unlimited generations<br />
            • Priority AI output<br />
            • No restrictions
          </p>
        </div>

        {/* PRICE */}
        <p className="text-3xl font-bold text-center mb-6">$5</p>

        {/* BUTTON */}
        <button
          onClick={upgrade}
          disabled={loading}
          className="bg-green-500 hover:bg-green-400 text-black px-4 py-3 rounded w-full font-bold transition"
        >
          {loading ? "Processing..." : "🚀 Upgrade to Pro"}
        </button>

        {/* SMALL TEXT */}
        <p className="text-xs text-gray-500 mt-3 text-center">
          Instant access • Secure payment • One-time unlock
        </p>

      </div>

    </div>
  );
}