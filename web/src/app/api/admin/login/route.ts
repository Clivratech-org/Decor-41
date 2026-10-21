import { loginAdmin } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = (await req.json()) as { email?: string; password?: string };
  const email = body.email?.trim() ?? "";
  const password = body.password ?? "";
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }
  const admin = await loginAdmin(email, password);
  if (!admin) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  return NextResponse.json({ ok: true, email: admin.email });
}
