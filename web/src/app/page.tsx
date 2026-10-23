import { HomePage } from "@/components/HomePage";
import { getCategories, getProducts } from "@/lib/products";
import { getFeaturedCoupons, getSettings } from "@/lib/settings";

export default async function Page() {
  const [categories, products, settings, coupons] = await Promise.all([
    getCategories(),
    getProducts(),
    getSettings(),
    getFeaturedCoupons(),
  ]);

  return (
    <HomePage
      categories={categories
        .filter((c) => !c.parentId)
        .map((c) => ({
          slug: c.slug,
          name: c.name,
          description: c.description,
          imageUrl: c.imageUrl,
        }))}
      products={products}
      settings={settings}
      coupons={coupons}
    />
  );
}
