import { prisma } from "./prisma";

export type ShippingSettings = {
  shippingStandardFee: number;
  shippingExpressFee: number;
  freeShippingThreshold: number;
  shippingStandardDays: string;
  shippingExpressDays: string;
  customProductionDays: string;
  returnPolicyDays: string;
  contactPhone: string;
  contactEmail: string;
  contactAddress: string;
  whatsapp: string;
};

const defaults: ShippingSettings = {
  shippingStandardFee: 79,
  shippingExpressFee: 149,
  freeShippingThreshold: 999,
  shippingStandardDays: "3–6 working days",
  shippingExpressDays: "1–3 working days",
  customProductionDays: "3–5 working days",
  returnPolicyDays: "7",
  contactPhone: "86677 06941",
  contactEmail: "hello@decor41.com",
  contactAddress: "Sooleswaranpetti, Valparai road, Pollachi",
  whatsapp: "918667706941",
};

export async function getSettings(): Promise<ShippingSettings> {
  const rows = await prisma.siteSetting.findMany();
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return {
    shippingStandardFee: Number(map.shippingStandardFee ?? defaults.shippingStandardFee),
    shippingExpressFee: Number(map.shippingExpressFee ?? defaults.shippingExpressFee),
    freeShippingThreshold: Number(map.freeShippingThreshold ?? defaults.freeShippingThreshold),
    shippingStandardDays: map.shippingStandardDays ?? defaults.shippingStandardDays,
    shippingExpressDays: map.shippingExpressDays ?? defaults.shippingExpressDays,
    customProductionDays: map.customProductionDays ?? defaults.customProductionDays,
    returnPolicyDays: map.returnPolicyDays ?? defaults.returnPolicyDays,
    contactPhone: map.contactPhone ?? defaults.contactPhone,
    contactEmail: map.contactEmail ?? defaults.contactEmail,
    contactAddress: map.contactAddress ?? defaults.contactAddress,
    whatsapp: map.whatsapp ?? defaults.whatsapp,
  };
}

export async function setSettings( partial: Partial<Record<keyof ShippingSettings, string | number>>) {
  for (const [key, value] of Object.entries(partial)) {
    if (value === undefined) continue;
    await prisma.siteSetting.upsert({
      where: { key },
      create: { key, value: String(value) },
      update: { value: String(value) },
    });
  }
}

export function calcShipping(subtotal: number, method: "std" | "exp", settings: ShippingSettings) {
  if (method === "exp") return settings.shippingExpressFee;
  if (subtotal >= settings.freeShippingThreshold) return 0;
  return settings.shippingStandardFee;
}

export async function calcDiscount(subtotal: number, coupon?: string | null) {
  if (!coupon) return 0;
  const row = await prisma.coupon.findUnique({ where: { code: coupon.trim().toUpperCase() } });
  if (!row?.active) return 0;
  const percent = Math.min(100, Math.max(0, row.discountPercent));
  return Math.round((subtotal * percent) / 100);
}

export async function getFeaturedCoupons() {
  return prisma.coupon.findMany({
    where: { active: true, showOnSite: true },
    orderBy: { discountPercent: "desc" },
    select: { code: true, discountPercent: true },
  });
}
