import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // IMPORTANT UPGRADE
);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const status = body?.data?.status;
    const tx_ref = body?.data?.tx_ref;

    if (!status || !tx_ref) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    if (status !== "successful") {
      return NextResponse.json({ ignored: true });
    }

    const userId = tx_ref.split("-")[0];

    if (!userId) {
      return NextResponse.json({ error: "Invalid tx_ref" }, { status: 400 });
    }

    // Upgrade user
    await supabase
      .from("profiles")
      .update({
        is_pro: true,
        credits: 999999,
      })
      .eq("id", userId);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Webhook failed" },
      { status: 500 }
    );
  }
}