"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  const [users, setUsers] = useState<any[]>([]);
  const [generations, setGenerations] = useState<any[]>([]);

  const ADMIN_EMAIL = "nexor.xtechnologies@gmail.com";

  // -----------------------------
  // AUTH CHECK (ADMIN ONLY)
  // -----------------------------
  useEffect(() => {
    const checkAdmin = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;

      if (!user || user.email !== ADMIN_EMAIL) {
        window.location.href = "/";
        return;
      }

      setAuthorized(true);
    };

    checkAdmin();
  }, []);

  // -----------------------------
  // LOAD DATA
  // -----------------------------
  useEffect(() => {
    if (!authorized) return;

    loadData();
  }, [authorized]);

  const loadData = async () => {
    setLoading(true);

    try {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      const { data: gens } = await supabase
        .from("generations")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      setUsers(profiles || []);
      setGenerations(gens || []);
    } catch (err) {
      console.error("Admin load error:", err);
    }

    setLoading(false);
  };

  // -----------------------------
  // CALCULATIONS
  // -----------------------------
  const totalUsers = users.length;
  const proUsers = users.filter((u) => u.is_pro).length;
  const freeUsers = totalUsers - proUsers;

  // -----------------------------
  // UI
  // -----------------------------
  if (!authorized) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-gray-400">Checking admin access...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      {/* HEADER */}
      <h1 className="text-3xl font-bold text-yellow-400">
        Falcon X Admin Panel
      </h1>

      <p className="text-gray-500 mt-2">
        System control center & analytics
      </p>

      {/* LOADING */}
      {loading ? (
        <p className="mt-6 text-gray-400">Loading dashboard...</p>
      ) : (
        <>
          {/* STATS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="bg-gray-900 p-5 rounded-xl border border-gray-800">
              <p className="text-gray-400">Total Users</p>
              <p className="text-3xl font-bold">{totalUsers}</p>
            </div>

            <div className="bg-gray-900 p-5 rounded-xl border border-gray-800">
              <p className="text-gray-400">PRO Users</p>
              <p className="text-3xl font-bold text-green-400">
                {proUsers}
              </p>
            </div>

            <div className="bg-gray-900 p-5 rounded-xl border border-gray-800">
              <p className="text-gray-400">Free Users</p>
              <p className="text-3xl font-bold text-yellow-400">
                {freeUsers}
              </p>
            </div>
          </div>

          {/* USERS */}
          <div className="mt-10">
            <h2 className="text-xl font-bold text-white mb-4">
              Recent Users
            </h2>

            <div className="space-y-2">
              {users.length === 0 && (
                <p className="text-gray-500">No users yet.</p>
              )}

              {users.slice(0, 10).map((u) => (
                <div
                  key={u.id}
                  className="flex justify-between bg-gray-900 p-3 rounded border border-gray-800"
                >
                  <span className="text-gray-200">{u.email}</span>

                  <span
                    className={
                      u.is_pro
                        ? "text-green-400 font-bold"
                        : "text-gray-400"
                    }
                  >
                    {u.is_pro ? "PRO" : "FREE"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* GENERATIONS */}
          <div className="mt-10">
            <h2 className="text-xl font-bold text-white mb-4">
              Recent Generations
            </h2>

            <div className="space-y-2">
              {generations.length === 0 && (
                <p className="text-gray-500">
                  No generations yet.
                </p>
              )}

              {generations.map((g) => (
                <div
                  key={g.id}
                  className="bg-gray-900 p-4 rounded border border-gray-800"
                >
                  <p className="text-yellow-400 font-semibold">
                    {g.topic}
                  </p>

                  <p className="text-gray-400 text-sm">
                    Platform: {g.platform} | Tone: {g.tone}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}