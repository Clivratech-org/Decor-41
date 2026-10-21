import { CartPageClient } from "@/components/CartPage";
import { getCategories, getProducts } from "@/lib/products";
import { getSettings } from "@/lib/settings";

export const metadata = { title: "Cart" };

export default async function CartRoute() {
  const [products, cats, settings] = await Promise.all([getProducts(), getCategories(), getSettings()]);
  return (
    <CartPageClient
      products={products}
      categories={cats.map((c) => ({ slug: c.slug, name: c.name }))}
      settings={settings}
    />
  );
}
