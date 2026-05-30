import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const { topic, platform, tone, userId, email } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "Missing user ID" },
        { status: 400 }
      );
    }

    // Get profile
    let { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    // Create profile if missing
    if (!profile) {
      const { data: newProfile } = await supabase
        .from("profiles")
        .insert({
          id: userId,
          email,
          plan: "free",
          credits: 5,
          is_pro: false,
        })
        .select()
        .single();

      profile = newProfile;
    }

    if (!profile) {
      return NextResponse.json(
        { error: "Failed to load profile" },
        { status: 500 }
      );
    }

    // Credit check
    if (!profile.is_pro && profile.credits <= 0) {
      return NextResponse.json({
        error: "No credits left. Upgrade to Pro.",
        upgradeRequired: true,
      });
    }

    // MOCK AI OUTPUT
    const result = `
🚀 VIRAL CAPTION

${topic} is changing the game.

If you're serious about growth, now is the time to pay attention.

Most people wait too long. The winners start today.

Platform: ${platform}
Tone: ${tone}

━━━━━━━━━━━━━━━━━━

🔥 5 HOOKS

1. Nobody talks about this ${topic} secret...
2. I wish I knew this sooner.
3. The biggest mistake beginners make.
4. This changed everything for me.
5. Here's what actually works.

━━━━━━━━━━━━━━━━━━

🏷️ HASHTAGS

#${topic.replace(/\s+/g, "")}
#Growth
#Creator
#SocialMedia
#Marketing
#ContentCreator
#Business
#Entrepreneur
#Viral
#FalconX

━━━━━━━━━━━━━━━━━━

💡 POST IDEAS

1. Beginner guide to ${topic}
2. Top mistakes people make in ${topic}
3. 30-day challenge around ${topic}
`;

    // Save generation
    await supabase.from("generations").insert([
      {
        topic,
        platform,
        tone,
        result,
        user_id: userId,
      },
    ]);

    // Deduct credits for free users
    if (!profile.is_pro) {
      await supabase
        .from("profiles")
        .update({
          credits: profile.credits - 1,
        })
        .eq("id", userId);
    }

    return NextResponse.json({
      result,
      creditsLeft: profile.is_pro
        ? "unlimited"
        : profile.credits - 1,
      isPro: profile.is_pro,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Generation failed",
      },
      { status: 500 }
    );
  }
}