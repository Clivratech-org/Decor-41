import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { getCategories, getProducts } from "@/lib/products";
import { getSettings } from "@/lib/settings";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cats = await getCategories();
  const c = cats.find((x) => x.slug === slug);
  return { title: c?.name || "Category" };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [cats, products, settings] = await Promise.all([
    getCategories(),
    getProducts({ categorySlug: slug }),
    getSettings(),
  ]);
  const c = cats.find((x) => x.slug === slug);
  if (!c) notFound();

  return (
    <>
      <div className="w">
        <div className="crumb">
          <Link href="/">Home</Link> / {c.name}
        </div>
        <div className="pgh">
          {c.imageUrl ? (
            <img src={c.imageUrl} alt="" style={{ width: 88, height: 88, objectFit: "cover", borderRadius: 16 }} />
          ) : null}
          <div>
            <h1>{c.name}</h1>
            <p className="mut">
              {c.description} · {products.length} products
            </p>
          </div>
        </div>
        <div className="g4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
      <Footer categories={cats} settings={settings} />
    </>
  );
}
