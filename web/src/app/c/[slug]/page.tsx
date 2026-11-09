import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { ProductFilters } from "@/components/ProductFilters";
import { SafeImage } from "@/components/SafeImage";
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
  const children = cats.filter((x) => x.parentId === c.id);

  return (
    <>
      <div className="w">
        <div className="crumb">
          <Link href="/">Home</Link> / {c.name}
        </div>
        <div className="pgh">
          <SafeImage src={c.imageUrl} alt="" style={{ width: 88, height: 88, objectFit: "cover", borderRadius: 16 }} />
          <div>
            <h1>{c.name}</h1>
            <p className="mut">
              {c.description}
              {children.length ? ` · ${children.length} subcategor${children.length === 1 ? "y" : "ies"}` : ""}
              {` · ${products.length} product${products.length === 1 ? "" : "s"}`}
            </p>
          </div>
        </div>
        {c.customOrderEnabled ? (
          <div className="panel custom-band">
            <div>
              <span className="chip">Custom order</span>
              <h2 style={{ margin: "8px 0 10px" }}>{c.customOrderTitle || "Made to order"}</h2>
              <p className="mut">
                {c.customOrderBody || "Send your design for this category — we’ll cut it and get in touch."}
              </p>
            </div>
            <Link className="btn" href={`/custom?category=${c.slug}`}>
              Start a custom order
            </Link>
          </div>
        ) : null}
        {children.length > 0 ? (
          <div className="g4 collect-cats" style={{ marginBottom: 28 }}>
            {children.map((child) => (
              <Link key={child.id} className="cat" href={`/c/${child.slug}`}>
                <div className="art">
                  <SafeImage src={child.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <span>
                  {child.name}
                  {child.description ? <small>{child.description}</small> : null}
                </span>
              </Link>
            ))}
          </div>
        ) : null}
        <ProductFilters products={products} />
      </div>
      <Footer categories={cats.filter((x) => !x.parentId)} settings={settings} />
    </>
  );
}
