import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function csvEscape(s: string) {
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const orders = await prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
  const lines = [
    "id,name,items,total,payment,status,date",
    ...orders.map((o) => {
      const items = o.items.map((i) => `${i.name} ×${i.quantity}`).join(", ");
      const date = o.createdAt.toISOString().slice(0, 10);
      return [
        csvEscape(o.id),
        csvEscape(o.customerName),
        csvEscape(items),
        o.total,
        csvEscape(o.paymentMethod),
        csvEscape(o.status),
        date,
      ].join(",");
    }),
  ];
  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="decor41-sales.csv"',
    },
  });
}
