import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { topic, platform, tone, userId } = await req.json();

    // -----------------------------
    // GROQ AI REQUEST
    // -----------------------------
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-70b-versatile",
          messages: [
            {
              role: "system",
              content:
                "You are a viral social media expert who writes high engagement posts.",
            },
            {
              role: "user",
              content: `Create a ${tone} ${platform} post about: ${topic}`,
            },
          ],
          temperature: 0.9,
        }),
      }
    );

    const data = await response.json();
    const output = data?.choices?.[0]?.message?.content;

    if (!output) {
      return NextResponse.json(
        { error: "AI generation failed" },
        { status: 500 }
      );
    }

    // -----------------------------
    // UPDATE USER USAGE
    // -----------------------------
    if (userId) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("usage")
        .eq("id", userId)
        .single();

      await supabase
        .from("profiles")
        .update({
          usage: (profile?.usage || 0) + 1,
        })
        .eq("id", userId);
    }

    // -----------------------------
    // UPDATE GLOBAL STATS
    // -----------------------------
    const { data: stats } = await supabase
      .from("stats")
      .select("*")
      .eq("id", "global")
      .single();

    await supabase.from("stats").upsert({
      id: "global",
      total_generations: (stats?.total_generations || 0) + 1,
      total_users: stats?.total_users || 0,
      total_referrals: stats?.total_referrals || 0,
    });

    return NextResponse.json({
      result: output,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}