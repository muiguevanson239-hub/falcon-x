import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, userId } = await req.json();

    const tx_ref = `${userId}-${Date.now()}`;

    const payload = {
      tx_ref,
      amount: 5,
      currency: "USD",
      redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/tool`,
      customer: { email },
      customizations: {
        title: "Falcon X Pro Subscription",
        description: "Unlimited AI access plan",
      },
    };

    const res = await fetch(
      "https://api.flutterwave.com/v3/payments",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: data.data.link });
  } catch (err) {
    return NextResponse.json(
      { error: "Payment init failed" },
      { status: 500 }
    );
  }
}