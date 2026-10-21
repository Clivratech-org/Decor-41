import { getAdminSession } from "@/lib/auth";
import { getSettings, setSettings, type ShippingSettings } from "@/lib/settings";
import { NextResponse } from "next/server";

export async function GET() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(await getSettings());
}

export async function PUT(req: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await req.json()) as Partial<ShippingSettings>;
  const patch: Partial<Record<keyof ShippingSettings, string | number>> = {};
  const keys: (keyof ShippingSettings)[] = [
    "shippingStandardFee",
    "shippingExpressFee",
    "freeShippingThreshold",
    "shippingStandardDays",
    "shippingExpressDays",
    "customProductionDays",
    "returnPolicyDays",
    "contactPhone",
    "contactEmail",
    "contactAddress",
    "whatsapp",
  ];
  for (const key of keys) {
    if (body[key] !== undefined) patch[key] = body[key] as string | number;
  }
  await setSettings(patch);
  return NextResponse.json(await getSettings());
}
