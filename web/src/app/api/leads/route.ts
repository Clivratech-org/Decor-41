import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = (await req.json()) as { name?: string; contact?: string; interest?: string; notes?: string };
  const name = body.name?.trim() || "";
  const contact = body.contact?.trim() || "";
  const interest = body.interest?.trim() || "";
  const notes = body.notes?.trim() || "";
  if (name.length < 2 || contact.length < 5 || interest.length < 2) {
    return NextResponse.json({ error: "Name, contact and what you need are required" }, { status: 400 });
  }
  await prisma.lead.create({
    data: {
      name,
      contact,
      interest,
      notes: notes || null,
      kind: "inquiry",
      status: "New",
    },
  });
  return NextResponse.json({ ok: true });
}
