import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const STATUSES = ["Paid", "Pending", "Shipped", "Delivered", "Refunded"] as const;

export async function GET() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const orders = await prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(
    orders.map((o) => ({
      id: o.id,
      customerName: o.customerName,
      email: o.email,
      phone: o.phone,
      items: o.items.map((i) => `${i.name} ×${i.quantity}`).join(", "),
      total: o.total,
      paymentMethod: o.paymentMethod,
      status: o.status,
      date: new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(o.createdAt),
      createdAt: o.createdAt.toISOString(),
    })),
  );
}

export async function PATCH(req: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await req.json()) as { id?: string; status?: string };
  if (!body.id || !body.status) {
    return NextResponse.json({ error: "id and status required" }, { status: 400 });
  }
  if (!STATUSES.includes(body.status as (typeof STATUSES)[number])) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }
  const order = await prisma.order.update({
    where: { id: body.id },
    data: { status: body.status },
  });
  return NextResponse.json({ ok: true, status: order.status });
}
