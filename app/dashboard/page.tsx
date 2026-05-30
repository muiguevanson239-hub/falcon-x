"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      // -----------------------------
      // GLOBAL STATS
      // -----------------------------
      const { data: global } = await supabase
        .from("stats")
        .select("*")
        .eq("id", "global")
        .single();

      setStats(global);

      // -----------------------------
      // USER SNAPSHOT
      // -----------------------------
      const { data: userData } = await supabase
        .from("profiles")
        .select("id, usage, credits, referral_count, created_at")
        .order("created_at", { ascending: false })
        .limit(20);

      setUsers(userData || []);

      setLoading(false);
    };

    load();
  }, []);

  // -----------------------------
  // SIMPLE DERIVED METRICS
  // -----------------------------
  const totalUsers = users.length;

  const avgUsage =
    users.reduce((acc, u) => acc + (u.usage || 0), 0) / (users.length || 1);

  const topUser = [...users].sort(
    (a, b) => (b.usage || 0) - (a.usage || 0)
  )[0];

  return (
    <div className="min-h-screen bg-black text-white p-6">

      {/* HEADER */}
      <h1 className="text-3xl font-bold text-yellow-400">
        Falcon X Analytics Dashboard
      </h1>

      <p className="text-gray-500 mt-1">
        Live system overview & growth tracking
      </p>

      {loading && (
        <p className="text-gray-400 mt-6">Loading analytics...</p>
      )}

      {/* STATS GRID */}
      {stats && (
        <div className="grid md:grid-cols-3 gap-4 mt-8">

          <div className="bg-gray-900 p-5 rounded-xl border border-gray-800">
            <p className="text-gray-400 text-sm">Total Generations</p>
            <p className="text-green-400 text-3xl font-bold">
              {stats.total_generations}
            </p>
          </div>

          <div className="bg-gray-900 p-5 rounded-xl border border-gray-800">
            <p className="text-gray-400 text-sm">Total Referrals</p>
            <p className="text-blue-400 text-3xl font-bold">
              {stats.total_referrals}
            </p>
          </div>

          <div className="bg-gray-900 p-5 rounded-xl border border-gray-800">
            <p className="text-gray-400 text-sm">Active Users (sample)</p>
            <p className="text-yellow-400 text-3xl font-bold">
              {totalUsers}
            </p>
          </div>

        </div>
      )}

      {/* INSIGHTS SECTION */}
      <div className="mt-10 grid md:grid-cols-2 gap-6">

        {/* AVG USAGE */}
        <div className="bg-gray-900 p-5 rounded-xl border border-gray-800">
          <h2 className="text-white font-bold mb-2">Engagement Insight</h2>

          <p className="text-gray-400 text-sm">
            Average generations per user
          </p>

          <p className="text-green-400 text-2xl font-bold mt-2">
            {avgUsage.toFixed(1)}
          </p>
        </div>

        {/* TOP USER */}
        <div className="bg-gray-900 p-5 rounded-xl border border-gray-800">
          <h2 className="text-white font-bold mb-2">Top User</h2>

          {topUser ? (
            <>
              <p className="text-gray-400 text-sm break-all">
                {topUser.id}
              </p>

              <p className="text-blue-400 text-2xl font-bold mt-2">
                {topUser.usage || 0} uses
              </p>
            </>
          ) : (
            <p className="text-gray-500">No data yet</p>
          )}
        </div>

      </div>

      {/* USER TABLE */}
      <div className="mt-10">
        <h2 className="text-xl font-bold mb-4">
          Recent Users Activity
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

      {/* SIMPLE GROWTH GRAPH (NO LIBRARY) */}
      <div className="mt-12">
        <h2 className="text-xl font-bold mb-3">
          Growth Snapshot
        </h2>

        <div className="flex items-end gap-2 h-32">

          {[10, 20, 35, 50, 65, 80, 95].map((h, i) => (
            <div
              key={i}
              className="bg-yellow-400 w-6 rounded"
              style={{ height: `${h}%` }}
            />
          ))}

        </div>

        <p className="text-gray-500 text-sm mt-2">
          Simulated growth trend (replace later with real time-series data)
        </p>
      </div>

    </div>
  );
}