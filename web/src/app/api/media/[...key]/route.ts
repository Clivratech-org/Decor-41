import { readObject } from "@/lib/storage";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const { key: parts } = await params;
  const key = parts.map((part) => decodeURIComponent(part)).join("/");
  try {
    const file = await readObject(key);
    if (!file) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const copy = new Uint8Array(file.bytes.byteLength);
    copy.set(file.bytes);
    return new NextResponse(new Blob([copy], { type: file.contentType }), {
      headers: {
        "Content-Type": file.contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "File unavailable" }, { status: 500 });
  }
}
