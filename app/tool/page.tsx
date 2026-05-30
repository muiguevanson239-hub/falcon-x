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

  const [usage, setUsage] = useState(0);
  const [credits, setCredits] = useState(0);

  // -----------------------------
  // INIT USER + PROFILE
  // -----------------------------
  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser();
      const currentUser = data.user;

      if (!currentUser) return;

      setUser(currentUser);

      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .single();

      if (prof) {
        setProfile(prof);
        setUsage(prof.usage || 0);
        setCredits(prof.credits || 0);
      }

      // -----------------------------
      // SAFE REFERRAL SYSTEM (NO DUPES)
      // -----------------------------
      const urlParams = new URLSearchParams(window.location.search);
      const ref = urlParams.get("ref");

      if (ref && currentUser && !prof?.referred_by) {
        // mark referral
        await supabase
          .from("profiles")
          .update({ referred_by: ref })
          .eq("id", currentUser.id);

        // reward new user
        await supabase
          .from("profiles")
          .update({
            credits: (prof?.credits || 0) + 3,
          })
          .eq("id", currentUser.id);

        // reward referrer
        const { data: refUser } = await supabase
          .from("profiles")
          .select("credits, referral_count")
          .eq("id", ref)
          .single();

        if (refUser) {
          await supabase
            .from("profiles")
            .update({
              credits: (refUser.credits || 0) + 5,
              referral_count: (refUser.referral_count || 0) + 1,
            })
            .eq("id", ref);
        }
      }
    };

    init();
  }, []);

  // -----------------------------
  // AI GENERATION (GROQ BACKEND)
  // -----------------------------
  const generate = async () => {
    if (!user) return alert("Please login first");

    setLoading(true);
    setResult("");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          platform,
          tone,
          userId: user.id,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        alert(data.error || "Generation failed");
        setLoading(false);
        return;
      }

      setResult(data.result);

      // -----------------------------
      // UPDATE LOCAL USAGE + REWARD LOOP
      // -----------------------------
      const newUsage = usage + 1;
      setUsage(newUsage);

      let bonus = 0;
      if (newUsage % 5 === 0) bonus = 2;

      const newCredits = credits + bonus;
      setCredits(newCredits);

      await supabase
        .from("profiles")
        .update({
          usage: newUsage,
          credits: newCredits,
        })
        .eq("id", user.id);

    } catch (err) {
      console.error(err);
      alert("Server error");
    }

    setLoading(false);
  };

  // -----------------------------
  // VIRAL SHARE SYSTEM
  // -----------------------------
  const share = () => {
    const link = `https://falcon-x-six.vercel.app?ref=${user.id}`;

    navigator.clipboard.writeText(link);

    if (navigator.share) {
      navigator.share({
        title: "Falcon X",
        text: "Generate viral AI content instantly",
        url: link,
      });
    } else {
      alert("Referral link copied!");
    }
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

        <Link href="/" className="px-3 py-2 bg-gray-800 rounded">
          Home
        </Link>
      </div>

      {/* USER INFO */}
      {user && (
        <div className="mt-4 text-sm text-gray-400 space-y-1">
          <p>
            Logged in:{" "}
            <span className="text-white">{user.email}</span>
          </p>

          <p>
            Usage:{" "}
            <span className="text-green-400">{usage}</span>
          </p>

          <p>
            Credits:{" "}
            <span className="text-yellow-400">{credits}</span>
          </p>
        </div>
      )}

      {/* REFERRAL BOX */}
      {user && (
        <div className="mt-4 p-4 bg-gray-900 rounded border border-gray-800">

          <p className="text-sm text-gray-400">
            Your referral link:
          </p>

          <p className="text-green-400 break-all">
            {`https://falcon-x-six.vercel.app?ref=${user.id}`}
          </p>

          <button
            onClick={share}
            className="mt-3 bg-green-500 text-black px-4 py-2 rounded font-bold"
          >
            🚀 Share & Earn Credits
          </button>

        </div>
      )}

      {/* INPUTS */}
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
          className="bg-yellow-500 text-black px-4 py-3 rounded w-full font-bold"
        >
          {loading ? "Generating..." : "Generate Content"}
        </button>

      </div>

      {/* OUTPUT */}
      {result && (
        <div className="mt-8 bg-gray-900 p-5 rounded-xl border border-gray-800">
          <h2 className="text-yellow-400 font-bold mb-2">
            Output
          </h2>

          <pre className="whitespace-pre-wrap text-sm">
            {result}
          </pre>
        </div>
      )}

      {/* EMPTY STATE */}
      {!result && !loading && (
        <p className="text-gray-600 mt-10 text-center">
          Generate your first viral post 🚀
        </p>
      )}
    </div>
  );
}