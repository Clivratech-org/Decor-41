import { HomePage } from "@/components/HomePage";
import { getCategories, getProducts } from "@/lib/products";
import { getSettings } from "@/lib/settings";

export default async function Page() {
  const [categories, products, settings] = await Promise.all([
    getCategories(),
    getProducts(),
    getSettings(),
  ]);

  return (
    <HomePage
      categories={categories.map((c) => ({
        slug: c.slug,
        name: c.name,
        description: c.description,
      }))}
      products={products}
      settings={settings}
    />
  );
}
