import Link from "next/link";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { getCategories, getProducts } from "@/lib/products";
import { getSettings } from "@/lib/settings";

export const metadata = { title: "Search" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const [products, cats, settings] = await Promise.all([
    getProducts({ q }),
    getCategories(),
    getSettings(),
  ]);

  return (
    <>
      <div className="w">
        <div className="pgh">
          <h1>Results for “{q}”</h1>
        </div>
        {products.length ? (
          <div className="g4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="empty">
            <h3>No matches</h3>
            <p className="mut">Try “poster”, “spoiler” or “plant”.</p>
            <Link className="btn" href="/">
              Browse all categories
            </Link>
          </div>
        )}
      </div>
      <Footer categories={cats} settings={settings} />
    </>
  );
}
