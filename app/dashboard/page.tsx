"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      // GLOBAL STATS
      const { data: globalStats } = await supabase
        .from("stats")
        .select("*")
        .eq("id", "global")
        .single();

      setStats(globalStats);

      // USERS (simple preview)
      const { data: userData } = await supabase
        .from("profiles")
        .select("id, created_at, usage, credits, referral_count")
        .order("created_at", { ascending: false })
        .limit(10);

      setUsers(userData || []);
    };

    load();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-6">

      <h1 className="text-3xl font-bold text-yellow-400">
        Falcon X Analytics
      </h1>

      {/* STATS CARDS */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">

          <div className="bg-gray-900 p-4 rounded">
            <p className="text-gray-400">Total Generations</p>
            <p className="text-green-400 text-2xl font-bold">
              {stats.total_generations}
            </p>
          </div>

          <div className="bg-gray-900 p-4 rounded">
            <p className="text-gray-400">Total Users (approx)</p>
            <p className="text-blue-400 text-2xl font-bold">
              {users.length}
            </p>
          </div>

          <div className="bg-gray-900 p-4 rounded">
            <p className="text-gray-400">Total Referrals</p>
            <p className="text-yellow-400 text-2xl font-bold">
              {stats.total_referrals}
            </p>
          </div>

        </div>
      )}

      {/* USER TABLE */}
      <div className="mt-10">
        <h2 className="text-xl font-bold mb-3">
          Recent Users
        </h2>

        <div className="space-y-2">
          {users.map((u) => (
            <div
              key={u.id}
              className="bg-gray-900 p-3 rounded text-sm flex justify-between"
            >
              <span className="text-gray-300">{u.id.slice(0, 8)}...</span>

              <span className="text-green-400">
                usage: {u.usage || 0}
              </span>

              <span className="text-blue-400">
                refs: {u.referral_count || 0}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}