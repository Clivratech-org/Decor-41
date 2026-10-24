import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/ProductDetail";
import { getCategories, getProductBySlug, getProducts } from "@/lib/products";
import { getSettings } from "@/lib/settings";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  return {
    title: p?.name || "Product",
    description: p?.tagline,
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [product, all, cats, settings] = await Promise.all([
    getProductBySlug(slug),
    getProducts(),
    getCategories(),
    getSettings(),
  ]);
  if (!product) notFound();
  const related = all.filter((x) => x.id !== product.id).slice(0, 4);

  return (
    <ProductDetail
      product={product}
      related={related}
      categories={cats.filter((c) => !c.parentId).map((c) => ({ slug: c.slug, name: c.name }))}
      settings={settings}
    />
  );
}
