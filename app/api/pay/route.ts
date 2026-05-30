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
      customer: {
        email,
      },
      customizations: {
        title: "Falcon X Pro",
        description: "Unlimited AI generations",
      },
    };

    const response = await fetch(
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

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || "Payment init failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      url: data.data.link,
      tx_ref,
    });
  } catch (err: any) {
    console.error(err);

    return NextResponse.json(
      { error: "Server error starting payment" },
      { status: 500 }
    );
  }
}