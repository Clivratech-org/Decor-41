import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const STATUSES = ["New", "Contacted", "Won", "Lost"] as const;

export async function GET() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(
    leads.map((l) => ({
      id: l.id,
      name: l.name,
      contact: l.contact,
      interest: l.interest,
      notes: l.notes,
      fileUrl: l.fileUrl,
      status: l.status,
      createdAt: l.createdAt.toISOString(),
      when: formatWhen(l.createdAt),
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
  const lead = await prisma.lead.update({
    where: { id: body.id },
    data: { status: body.status },
  });
  return NextResponse.json({ ok: true, status: lead.status });
}

function formatWhen(d: Date) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const day = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diff = Math.round((start.getTime() - day.getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return `${diff} days ago`;
  return d.toLocaleDateString("en-IN");
}
