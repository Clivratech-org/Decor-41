import { prisma } from "./prisma";
import { normalizeMediaUrl } from "./storage";

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
  heroImage1: string;
  heroImage2: string;
  heroImage3: string;
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
  heroImage1: "",
  heroImage2: "",
  heroImage3: "",
};

const heroFallbacks = ["/brand/hero-1.jpg", "/brand/hero-2.jpg", "/brand/hero-3.jpg"] as const;

function storedMedia(raw: string | undefined) {
  const value = raw?.trim() || "";
  if (!value) return "";
  return normalizeMediaUrl(value) || value;
}

export function resolveHeroImages(settings: Pick<ShippingSettings, "heroImage1" | "heroImage2" | "heroImage3">) {
  return [
    settings.heroImage1 || heroFallbacks[0],
    settings.heroImage2 || heroFallbacks[1],
    settings.heroImage3 || heroFallbacks[2],
  ] as const;
}

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
    heroImage1: storedMedia(map.heroImage1),
    heroImage2: storedMedia(map.heroImage2),
    heroImage3: storedMedia(map.heroImage3),
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
