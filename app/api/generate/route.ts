import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { topic, platform, tone, userId } = body;

    // -----------------------------
    // VALIDATION (IMPORTANT FIX)
    // -----------------------------
    if (!topic || !platform || !tone) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "Server misconfigured: missing GROQ_API_KEY" },
        { status: 500 }
      );
    }

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
                "You are a world-class viral content creator. Write engaging, high-conversion social media posts.",
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

    // -----------------------------
    // HANDLE GROQ FAILURES
    // -----------------------------
    if (!response.ok) {
      const errorText = await response.text();
      console.error("GROQ ERROR:", errorText);

      return NextResponse.json(
        {
          error: "Groq API failed",
          debug: errorText,
        },
        { status: 500 }
      );
    }

    const data = await response.json();

    const output = data?.choices?.[0]?.message?.content;

    if (!output) {
      console.error("EMPTY AI RESPONSE:", data);

      return NextResponse.json(
        {
          error: "AI returned empty response",
          debug: data,
        },
        { status: 500 }
      );
    }

    // -----------------------------
    // UPDATE USER USAGE (SAFE)
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
    // UPDATE GLOBAL ANALYTICS
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

    // -----------------------------
    // SUCCESS RESPONSE
    // -----------------------------
    return NextResponse.json({
      result: output,
    });

  } catch (err: any) {
    console.error("GENERATION CRASH:", err);

    return NextResponse.json(
      {
        error: "Server crash",
        debug: err?.message || err,
      },
      { status: 500 }
    );
  }
}