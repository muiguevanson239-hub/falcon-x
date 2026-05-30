import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      topic,
      platform,
      tone,
      userId,
    } = body;

    // -------------------------
    // VALIDATION
    // -------------------------
    if (!topic || !platform || !tone) {
      return NextResponse.json(
        {
          error: "Missing required fields",
        },
        { status: 400 }
      );
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        {
          error: "GROQ_API_KEY is missing",
        },
        { status: 500 }
      );
    }

    // -------------------------
    // AI REQUEST
    // -------------------------
    const groqResponse = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          temperature: 0.9,
          messages: [
            {
              role: "system",
              content: `
You are Falcon X AI.

You create highly engaging social media content.

Rules:
- Strong hook
- Easy to read
- High engagement
- Platform optimized
- Use emojis when appropriate
- End with a CTA
`,
            },
            {
              role: "user",
              content: `
Topic: ${topic}

Platform: ${platform}

Tone: ${tone}

Create a viral social media post.
`,
            },
          ],
        }),
      }
    );

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();

      console.error("GROQ ERROR:", errorText);

      return NextResponse.json(
        {
          error: "Groq API failed",
          debug: errorText,
        },
        { status: 500 }
      );
    }

    const groqData = await groqResponse.json();

    const generatedText =
      groqData?.choices?.[0]?.message?.content;

    if (!generatedText) {
      return NextResponse.json(
        {
          error: "No content returned from AI",
          debug: groqData,
        },
        { status: 500 }
      );
    }

    // -------------------------
    // UPDATE USER USAGE
    // -------------------------
    if (userId) {
      try {
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
      } catch (e) {
        console.error("PROFILE UPDATE ERROR:", e);
      }
    }

    // -------------------------
    // UPDATE GLOBAL STATS
    // -------------------------
    try {
      const { data: stats } = await supabase
        .from("stats")
        .select("*")
        .eq("id", "global")
        .single();

      await supabase
        .from("stats")
        .upsert({
          id: "global",
          total_generations:
            (stats?.total_generations || 0) + 1,
          total_referrals:
            stats?.total_referrals || 0,
          total_users:
            stats?.total_users || 0,
        });
    } catch (e) {
      console.error("STATS UPDATE ERROR:", e);
    }

    // -------------------------
    // SUCCESS
    // -------------------------
    return NextResponse.json({
      success: true,
      result: generatedText,
    });
  } catch (error: any) {
    console.error("GENERATION ERROR:", error);

    return NextResponse.json(
      {
        error: "Server error",
        debug: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}