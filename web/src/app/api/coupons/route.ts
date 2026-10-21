import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const coupons = await prisma.coupon.findMany({
    where: { active: true, showOnSite: true },
    orderBy: { discountPercent: "desc" },
    select: { code: true, discountPercent: true },
  });
  return NextResponse.json(coupons);
}

export async function POST(req: Request) {
  const body = (await req.json()) as { code?: string };
  const code = (body.code || "").trim().toUpperCase();
  if (!code) return NextResponse.json({ ok: false, error: "Enter a coupon code" }, { status: 400 });
  const coupon = await prisma.coupon.findUnique({ where: { code } });
  if (!coupon?.active) {
    return NextResponse.json({ ok: false, error: "That coupon is not active" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, code: coupon.code, discountPercent: coupon.discountPercent });
}
