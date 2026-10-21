import { readObject } from "@/lib/storage";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const key = new URL(req.url).searchParams.get("key") || "";
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
