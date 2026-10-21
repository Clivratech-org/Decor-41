import crypto from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  orderId: z.string(),
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return NextResponse.json({ error: "Razorpay not configured" }, { status: 500 });
    }

    const expected = crypto
      .createHmac("sha256", secret)
      .update(`${body.razorpay_order_id}|${body.razorpay_payment_id}`)
      .digest("hex");

    if (expected !== body.razorpay_signature) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    await prisma.order.update({
      where: { id: body.orderId },
      data: {
        paymentStatus: "Paid",
        status: "Paid",
        razorpayPayment: body.razorpay_payment_id,
        razorpayOrderId: body.razorpay_order_id,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Verification failed" },
      { status: 400 },
    );
  }
}
