import { isSafeKey, mediaUrl } from "@/lib/storage";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const key = new URL(req.url).searchParams.get("key") || "";
  if (!isSafeKey(key)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.redirect(new URL(mediaUrl(key), req.url), 307);
}
