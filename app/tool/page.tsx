"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function ToolPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState("Instagram");
  const [tone, setTone] = useState("professional");

  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const [creditsLeft, setCreditsLeft] = useState<number>(0);

  // -----------------------------
  // LOAD USER + PROFILE
  // -----------------------------
  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser();
      const currentUser = data.user;

      setUser(currentUser);

      if (!currentUser) return;

      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .single();

      if (prof) {
        setProfile(prof);
        setCreditsLeft(prof.credits);
      }
    };

    init();
  }, []);

  // -----------------------------
  // GENERATE CONTENT
  // -----------------------------
  const generate = async () => {
    if (!user) {
      alert("Please login first");
      return;
    }

    if (!profile?.is_pro && creditsLeft <= 0) {
      alert("No credits left. Upgrade to Pro.");
      return;
    }

    setLoading(true);
    setResult("");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic,
          platform,
          tone,
          userId: user.id,
          email: user.email,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        alert(data.error || "Generation failed");
        setLoading(false);
        return;
      }

      setResult(data.result);
      setCreditsLeft(data.creditsLeft);

      // refresh profile after DB update
      const { data: updated } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(updated);
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }

    setLoading(false);
  };

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-yellow-400">
          Falcon X
        </h1>

        <Link
          href="/dashboard"
          className="px-4 py-2 bg-gray-800 rounded hover:bg-gray-700"
        >
          Dashboard
        </Link>
      </div>

      {/* USER INFO */}
      {user && (
        <div className="mt-4 text-sm text-gray-400">
          Logged in as:{" "}
          <span className="text-white">{user.email}</span>
          {" | "}
          Credits:{" "}
          <span className="text-yellow-400 font-bold">
            {profile?.is_pro ? "Unlimited (PRO)" : creditsLeft}
          </span>
        </div>
      )}

      {/* INPUT SECTION */}
      <div className="mt-6 space-y-3 max-w-xl">
        <input
          className="w-full p-3 bg-gray-900 rounded"
          placeholder="Enter topic (e.g fashion)"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />

        <select
          className="w-full p-3 bg-gray-900 rounded"
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
        >
          <option>Instagram</option>
          <option>TikTok</option>
          <option>X</option>
          <option>LinkedIn</option>
        </select>

        <select
          className="w-full p-3 bg-gray-900 rounded"
          value={tone}
          onChange={(e) => setTone(e.target.value)}
        >
          <option>professional</option>
          <option>viral</option>
          <option>funny</option>
          <option>luxury</option>
        </select>

        <button
          onClick={generate}
          disabled={loading}
          className="bg-yellow-500 text-black px-4 py-3 rounded w-full font-bold hover:bg-yellow-400"
        >
          {loading ? "Generating..." : "Generate Content"}
        </button>
      </div>

      {/* RESULT */}
      {result && (
        <div className="mt-8 bg-gray-900 p-5 rounded-xl border border-gray-800">
          <h2 className="text-yellow-400 font-bold mb-2">
            Generated Output
          </h2>

          <pre className="whitespace-pre-wrap text-sm">
            {result}
          </pre>
        </div>
      )}

      {/* UPGRADE SECTION */}
      {user && profile && !profile.is_pro && creditsLeft <= 0 && (
        <div className="mt-8 border border-green-500 p-5 rounded-xl">
          <h2 className="text-green-400 font-bold mb-2">
            Out of Credits
          </h2>

          <p className="text-gray-400 mb-4">
            Upgrade to Pro for unlimited AI generations.
          </p>

          <button
            onClick={async () => {
              try {
                const res = await fetch("/api/pay", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    email: user.email,
                    userId: user.id,
                  }),
                });

                const data = await res.json();

                if (!res.ok) {
                  alert(data.error || "Payment failed");
                  return;
                }

                if (data.url) {
                  window.location.href = data.url;
                }
              } catch (err) {
                console.error(err);
                alert("Payment error");
              }
            }}
            className="bg-green-500 text-black px-4 py-3 rounded w-full font-bold hover:bg-green-400"
          >
            🚀 Upgrade to Pro
          </button>
        </div>
      )}
    </div>
  );
}