"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // -----------------------------
  // INITIAL LOAD
  // -----------------------------
  const loadData = async () => {
    const { data: global } = await supabase
      .from("stats")
      .select("*")
      .eq("id", "global")
      .single();

    const { data: userData } = await supabase
      .from("profiles")
      .select("id, usage, credits, referral_count, created_at")
      .order("created_at", { ascending: false })
      .limit(20);

    setStats(global);
    setUsers(userData || []);
    setLoading(false);
  };

  useEffect(() => {
    loadData();

    // -----------------------------
    // REALTIME: STATS TABLE
    // -----------------------------
    const statsChannel = supabase
      .channel("stats-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "stats",
        },
        (payload) => {
          if (payload.new) {
            setStats(payload.new);
          }
        }
      )
      .subscribe();

    // -----------------------------
    // REALTIME: PROFILES TABLE
    // -----------------------------
    const profilesChannel = supabase
      .channel("profiles-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "profiles",
        },
        (payload) => {
          loadData(); // refresh users list instantly
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(statsChannel);
      supabase.removeChannel(profilesChannel);
    };
  }, []);

  // -----------------------------
  // LOADING STATE
  // -----------------------------
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <p className="text-gray-400">Loading realtime analytics...</p>
      </div>
    );
  }

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div className="min-h-screen bg-black text-white p-6">

      <h1 className="text-3xl font-bold text-yellow-400">
        Falcon X Realtime Dashboard ⚡
      </h1>

      <p className="text-gray-500 mt-1">
        Live system updates (no refresh needed)
      </p>

      {/* STATS */}
      <div className="grid md:grid-cols-3 gap-4 mt-8">

        <div className="bg-gray-900 p-5 rounded-xl border border-gray-800">
          <p className="text-gray-400 text-sm">Total Generations</p>
          <p className="text-green-400 text-3xl font-bold">
            {stats?.total_generations || 0}
          </p>
        </div>

        <div className="bg-gray-900 p-5 rounded-xl border border-gray-800">
          <p className="text-gray-400 text-sm">Total Referrals</p>
          <p className="text-blue-400 text-3xl font-bold">
            {stats?.total_referrals || 0}
          </p>
        </div>

        <div className="bg-gray-900 p-5 rounded-xl border border-gray-800">
          <p className="text-gray-400 text-sm">Active Users</p>
          <p className="text-yellow-400 text-3xl font-bold">
            {users.length}
          </p>
        </div>

      </div>

      {/* LIVE USERS */}
      <div className="mt-10">
        <h2 className="text-xl font-bold mb-4">
          Live User Activity
        </h2>

        <div className="space-y-2">

          {users.map((u) => (
            <div
              key={u.id}
              className="bg-gray-900 p-3 rounded flex justify-between text-sm border border-gray-800"
            >
              <span className="text-gray-400">
                {u.id.slice(0, 10)}...
              </span>

              <span className="text-green-400">
                usage: {u.usage || 0}
              </span>

              <span className="text-blue-400">
                refs: {u.referral_count || 0}
              </span>

              <span className="text-yellow-400">
                credits: {u.credits || 0}
              </span>
            </div>
          ))}

        </div>
      </div>

    </div>
  );
}