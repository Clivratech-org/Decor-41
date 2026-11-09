import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadObject } from "@/lib/storage";

export async function POST(req: Request) {
  try {
    const fd = await req.formData();
    const name = String(fd.get("name") || "").trim();
    const contact = String(fd.get("contact") || "").trim();
    const interest = String(fd.get("interest") || "").trim();
    const notes = String(fd.get("notes") || "").trim();
    const category = String(fd.get("category") || "").trim();
    const file = fd.get("file");

    if (!name || !contact || !interest) {
      return NextResponse.json({ error: "Name, contact and interest are required" }, { status: 400 });
    }
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "Design file is required" }, { status: 400 });
    }
    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json({ error: "File must be under 8 MB" }, { status: 400 });
    }

    const saved = await uploadObject(file, "custom");
    const fileUrl = saved.url;
    const noteParts = [category ? `Category: ${category}` : "", notes].filter(Boolean).join("\n");

    await prisma.lead.create({
      data: {
        name,
        contact,
        interest: category ? `[${category}] ${interest}` : interest,
        notes: noteParts || null,
        fileUrl,
        kind: "custom",
        status: "New",
      },
    });

    return NextResponse.json({ ok: true, fileUrl });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
