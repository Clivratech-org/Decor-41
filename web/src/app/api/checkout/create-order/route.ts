import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { calcDiscount, calcShipping, getSettings } from "@/lib/settings";

const schema = z.object({
  customerName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  address: z.string().min(4),
  city: z.string().min(2),
  pin: z.string().regex(/^\d{6}$/),
  state: z.string().min(2),
  shippingMethod: z.enum(["std", "exp"]),
  couponCode: z.string().nullable().optional(),
  paymentMethod: z.literal("Razorpay"),
  items: z
    .array(
      z.object({
        productId: z.number().optional(),
        name: z.string(),
        variant: z.string(),
        size: z.string(),
        unitPrice: z.number().int().positive(),
        quantity: z.number().int().min(1).max(9),
      }),
    )
    .min(1),
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());
    const settings = await getSettings();
    const subtotal = body.items.reduce((a, i) => a + i.unitPrice * i.quantity, 0);
    const discount = await calcDiscount(subtotal, body.couponCode);
    const shippingFee = calcShipping(subtotal, body.shippingMethod, settings);
    const total = subtotal - discount + shippingFee;
    const orderId = "D41-" + Date.now().toString().slice(-6);

    const key = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const secret = process.env.RAZORPAY_KEY_SECRET;
    const demoMode = !key || !secret;

    let razorpayOrderId: string | undefined;

    if (!demoMode) {
      const rzp = new Razorpay({ key_id: key!, key_secret: secret! });
      const rzOrder = await rzp.orders.create({
        amount: total * 100,
        currency: "INR",
        receipt: orderId,
        notes: { orderId },
      });
      razorpayOrderId = rzOrder.id;
    }

    await prisma.order.create({
      data: {
        id: orderId,
        customerName: body.customerName,
        email: body.email,
        phone: body.phone,
        address: body.address,
        city: body.city,
        pin: body.pin,
        state: body.state,
        shippingMethod: body.shippingMethod,
        shippingFee,
        subtotal,
        discount,
        couponCode: body.couponCode || null,
        total,
        paymentMethod: body.paymentMethod,
        paymentStatus: demoMode ? "Paid" : "Pending",
        status: demoMode ? "Paid" : "Pending",
        razorpayOrderId: razorpayOrderId || null,
        items: {
          create: body.items.map((i) => ({
            productId: i.productId,
            name: i.name,
            variant: i.variant,
            size: i.size,
            unitPrice: i.unitPrice,
            quantity: i.quantity,
            lineTotal: i.unitPrice * i.quantity,
          })),
        },
      },
    });

    return NextResponse.json({
      orderId,
      amount: total * 100,
      razorpayOrderId,
      demoMode,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Invalid checkout payload" },
      { status: 400 },
    );
  }
}
