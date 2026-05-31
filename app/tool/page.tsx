"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function ToolPage() {
  const router = useRouter();

  const [checkingAuth, setCheckingAuth] = useState(true);

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState("Instagram");
  const [tone, setTone] = useState("professional");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const [usage, setUsage] = useState(0);
  const [credits, setCredits] = useState(0);

  const [history, setHistory] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const init = async () => {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!currentUser) {
        router.push("/login");
        return;
      }

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

      // Referral System
      const params = new URLSearchParams(window.location.search);
      const ref = params.get("ref");

      if (ref && prof && !prof.referred_by && ref !== currentUser.id) {
        await supabase
          .from("profiles")
          .update({
            referred_by: ref,
            credits: (prof.credits || 0) + 3,
          })
          .eq("id", currentUser.id);

        const { data: referrer } = await supabase
          .from("profiles")
          .select("credits, referral_count")
          .eq("id", ref)
          .single();

        if (referrer) {
          await supabase
            .from("profiles")
            .update({
              credits: (referrer.credits || 0) + 5,
              referral_count: (referrer.referral_count || 0) + 1,
            })
            .eq("id", ref);
        }
      }

      setCheckingAuth(false);
    };

    init();
  }, [router]);

  const generate = async () => {
    if (!topic.trim()) {
      alert("Please enter a topic");
      return;
    }

    setLoading(true);
    setResult("");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic,
          platform,
          tone,
          userId: user.id,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        alert(data.error || "Generation failed");
        setLoading(false);
        return;
      }

      setResult(data.result);

      setHistory((prev) => [
        data.result,
        ...prev.slice(0, 9),
      ]);

      const newUsage = usage + 1;
      let bonus = 0;

      if (newUsage % 5 === 0) {
        bonus = 2;
      }

      const newCredits = credits + bonus;

      setUsage(newUsage);
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

  const share = async () => {
    const link = `https://falcon-x-six.vercel.app?ref=${user.id}`;

    await navigator.clipboard.writeText(link);

    if (navigator.share) {
      await navigator.share({
        title: "Falcon X",
        text: "Generate viral content instantly with AI",
        url: link,
      });
    } else {
      alert("Referral link copied!");
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-yellow-400">
            Falcon X
          </h1>
          <p className="text-gray-500 mt-2">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">

      {/* Header */}
      <div className="flex justify-between items-center">

        <h1 className="text-3xl font-bold text-yellow-400">
          Falcon X
        </h1>

        <div className="flex gap-2">

          <Link
            href="/"
            className="bg-gray-800 px-4 py-2 rounded"
          >
            Home
          </Link>

          <Link
            href="/dashboard"
            className="bg-yellow-500 text-black px-4 py-2 rounded font-bold"
          >
            Dashboard
          </Link>

          <button
            onClick={logout}
            className="bg-red-500 px-4 py-2 rounded"
          >
            Logout
          </button>

        </div>
      </div>

      {/* Profile */}
      <div className="mt-6 bg-gray-900 border border-gray-800 rounded-xl p-4">

        <p>
          Logged in as:
          <span className="text-yellow-400 ml-2">
            {user?.email}
          </span>
        </p>

        <div className="flex gap-6 mt-3">

          <p>
            Usage:
            <span className="text-green-400 ml-2">
              {usage}
            </span>
          </p>

          <p>
            Credits:
            <span className="text-yellow-400 ml-2">
              {credits}
            </span>
          </p>

        </div>

      </div>

      {/* Credits Warning */}
      {credits <= 3 && (
        <div className="mt-4 bg-yellow-900 border border-yellow-500 p-4 rounded-xl">
          ⚠️ Low credits. Invite friends to earn more.
        </div>
      )}

      {/* Referral */}
      <div className="mt-6 bg-gray-900 border border-gray-800 rounded-xl p-4">

        <h2 className="text-lg font-bold text-green-400">
          Referral Program
        </h2>

        <p className="text-sm text-gray-400 mt-2 break-all">
          https://falcon-x-six.vercel.app?ref={user?.id}
        </p>

        <button
          onClick={share}
          className="mt-3 bg-green-500 text-black px-4 py-2 rounded font-bold"
        >
          🚀 Share & Earn Credits
        </button>

      </div>

      {/* Generator */}
      <div className="mt-8 max-w-2xl space-y-4">

        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter your topic..."
          className="w-full p-4 bg-gray-900 rounded-xl"
        />

        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          className="w-full p-4 bg-gray-900 rounded-xl"
        >
          <option>Instagram</option>
          <option>TikTok</option>
          <option>X</option>
          <option>LinkedIn</option>
        </select>

        <select
          value={tone}
          onChange={(e) => setTone(e.target.value)}
          className="w-full p-4 bg-gray-900 rounded-xl"
        >
          <option>professional</option>
          <option>viral</option>
          <option>luxury</option>
          <option>funny</option>
        </select>

        <button
          onClick={generate}
          disabled={loading}
          className="w-full bg-yellow-500 text-black py-4 rounded-xl font-bold"
        >
          {loading ? "Generating..." : "Generate Content"}
        </button>

      </div>

      {/* Result */}
      {result && (
        <div className="mt-8 bg-gray-900 border border-gray-800 rounded-xl p-5">

          <div className="flex justify-between items-center mb-4">

            <h2 className="text-yellow-400 font-bold">
              Generated Content
            </h2>

            <button
              onClick={() => {
                navigator.clipboard.writeText(result);
                setCopied(true);

                setTimeout(() => {
                  setCopied(false);
                }, 2000);
              }}
              className="bg-green-500 text-black px-3 py-2 rounded"
            >
              {copied ? "Copied!" : "Copy"}
            </button>

          </div>

          <pre className="whitespace-pre-wrap text-sm">
            {result}
          </pre>

        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="mt-10">

          <h2 className="text-xl font-bold text-yellow-400 mb-4">
            Recent Generations
          </h2>

          <div className="space-y-3">

            {history.map((item, index) => (
              <div
                key={index}
                className="bg-gray-900 border border-gray-800 p-4 rounded-xl"
              >
                <p className="text-sm line-clamp-4">
                  {item}
                </p>
              </div>
            ))}

          </div>

        </div>
      )}

    </div>
  );
}