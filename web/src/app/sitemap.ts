import type { MetadataRoute } from "next";
import { getCategories, getProducts } from "@/lib/products";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const [cats, products] = await Promise.all([getCategories(), getProducts()]);
  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/custom`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/cart`, changeFrequency: "monthly", priority: 0.3 },
    ...cats.map((c) => ({
      url: `${base}/c/${c.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...products.map((p) => ({
      url: `${base}/p/${p.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
