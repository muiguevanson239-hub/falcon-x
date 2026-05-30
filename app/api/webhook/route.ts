import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Flutterwave sends transaction data here
    const status = body?.data?.status;
    const tx_ref = body?.data?.tx_ref;

    if (status !== "successful") {
      return NextResponse.json({ message: "Not successful" });
    }

    // extract userId from tx_ref (userId-timestamp)
    const userId = tx_ref?.split("-")[0];

    if (!userId) {
      return NextResponse.json({ error: "Invalid tx_ref" }, { status: 400 });
    }

    // 🔥 UPGRADE USER TO PRO
    await supabase
      .from("profiles")
      .update({
        is_pro: true,
        plan: "pro",
        subscription_status: "active",
        credits: 999999,
      })
      .eq("id", userId);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}