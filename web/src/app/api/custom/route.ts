import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const fd = await req.formData();
    const name = String(fd.get("name") || "").trim();
    const contact = String(fd.get("contact") || "").trim();
    const interest = String(fd.get("interest") || "").trim();
    const notes = String(fd.get("notes") || "").trim();
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

    const dir = path.join(process.cwd(), "public", "uploads", "custom");
    await mkdir(dir, { recursive: true });
    const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filename = `${Date.now()}-${safe}`;
    const buf = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(dir, filename), buf);
    const fileUrl = `/uploads/custom/${filename}`;

    await prisma.lead.create({
      data: {
        name,
        contact,
        interest,
        notes: notes || null,
        fileUrl,
        status: "New",
      },
    });

    return NextResponse.json({ ok: true, fileUrl });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
