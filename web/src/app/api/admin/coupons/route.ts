import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function cleanCode(code: string) {
  return code.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export async function GET() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(coupons);
}

export async function POST(req: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await req.json()) as {
    code?: string;
    discountPercent?: number;
    active?: boolean;
    showOnSite?: boolean;
  };
  const code = cleanCode(body.code || "");
  const discountPercent = Math.round(Number(body.discountPercent));
  if (!code) return NextResponse.json({ error: "Code is required" }, { status: 400 });
  if (!Number.isFinite(discountPercent) || discountPercent < 1 || discountPercent > 100) {
    return NextResponse.json({ error: "Discount must be between 1 and 100" }, { status: 400 });
  }
  const taken = await prisma.coupon.findUnique({ where: { code } });
  if (taken) return NextResponse.json({ error: "That code already exists" }, { status: 400 });
  const coupon = await prisma.coupon.create({
    data: {
      code,
      discountPercent,
      active: body.active !== false,
      showOnSite: !!body.showOnSite,
    },
  });
  return NextResponse.json({ ok: true, id: coupon.id });
}

export async function PUT(req: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await req.json()) as {
    id?: string;
    code?: string;
    discountPercent?: number;
    active?: boolean;
    showOnSite?: boolean;
  };
  if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const existing = await prisma.coupon.findUnique({ where: { id: body.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const code = body.code !== undefined ? cleanCode(body.code) : existing.code;
  const discountPercent =
    body.discountPercent !== undefined ? Math.round(Number(body.discountPercent)) : existing.discountPercent;
  if (!code) return NextResponse.json({ error: "Code is required" }, { status: 400 });
  if (discountPercent < 1 || discountPercent > 100) {
    return NextResponse.json({ error: "Discount must be between 1 and 100" }, { status: 400 });
  }
  const clash = await prisma.coupon.findFirst({ where: { code, NOT: { id: body.id } } });
  if (clash) return NextResponse.json({ error: "That code already exists" }, { status: 400 });
  await prisma.coupon.update({
    where: { id: body.id },
    data: {
      code,
      discountPercent,
      active: body.active !== undefined ? !!body.active : existing.active,
      showOnSite: body.showOnSite !== undefined ? !!body.showOnSite : existing.showOnSite,
    },
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await prisma.coupon.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
