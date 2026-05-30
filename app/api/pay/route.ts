import { NextResponse } from "next/server";
import Flutterwave from "flutterwave-node-v3";

const flw = new Flutterwave(
  process.env.FLW_PUBLIC_KEY!,
  process.env.FLW_SECRET_KEY!
);

export async function POST(req: Request) {
  const { email, userId } = await req.json();

  const tx_ref = `${userId}-${Date.now()}`;

  const payload = {
    tx_ref,
    amount: 5,
    currency: "USD",
    redirect_url: "http://localhost:3000/tool",
    customer: {
      email,
    },
    customizations: {
      title: "Falcon X Pro",
      description: "Unlimited AI generations",
    },
  };

  try {
    const response = await flw.Charge.initiate(payload);

    return NextResponse.json({
      url: response.data.link,
      tx_ref,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}