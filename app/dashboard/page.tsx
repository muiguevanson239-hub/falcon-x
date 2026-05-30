"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGenerations();
  }, []);

  async function loadGenerations() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("generations")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setItems(data || []);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-4xl font-bold mb-8 text-yellow-400">
        Falcon X Dashboard
      </h1>

      {loading && <p>Loading...</p>}

      {!loading && items.length === 0 && (
        <p>No generations yet.</p>
      )}

      <div className="space-y-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-gray-900 p-5 rounded-xl border border-gray-800"
          >
            <div className="mb-3">
              <strong>Topic:</strong> {item.topic}
            </div>

            <div className="mb-3">
              <strong>Platform:</strong> {item.platform}
            </div>

            <div className="mb-3">
              <strong>Tone:</strong> {item.tone}
            </div>

            <pre className="whitespace-pre-wrap text-sm">
              {item.result}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}