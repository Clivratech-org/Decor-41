"use client";

import Link from "next/link";
import { useState } from "react";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { ProductArt } from "@/lib/art";
import { mrpFrom, rupees } from "@/lib/money";
import type { ProductCard as P } from "@/lib/products";
import type { ShippingSettings } from "@/lib/settings";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";

type Detail = P & {
  description: string;
  features: [string, string][];
  specs: [string, string][];
};

function stars(r: number) {
  return "★".repeat(Math.round(r)) + "☆".repeat(5 - Math.round(r));
}

export function ProductDetail({
  product,
  related,
  categories,
  settings,
}: {
  product: Detail;
  related: P[];
  categories: { slug: string; name: string }[];
  settings: ShippingSettings;
}) {
  const [v, setV] = useState(0);
  const [s, setS] = useState(0);
  const [i, setI] = useState(0);
  const [q, setQ] = useState(1);
  const [tab, setTab] = useState(0);
  const { addItem, showToast } = useCart();
  const router = useRouter();
  const variant = product.variants[v];
  const price = variant?.price || 0;
  const stock = variant?.stock ?? 0;
  const mrp = mrpFrom(product.variants[0]?.price || price);
  const photos = product.images || [];
  const photo = photos[i] || photos[0];

  function add(buy?: boolean) {
    if (!variant || stock < 1) return;
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      categorySlug: product.categorySlug,
      categoryName: product.categoryName,
      artKey: product.artKey,
      variantIndex: v,
      variantId: variant.id,
      variantName: variant.name,
      color: variant.color,
      size: product.sizes[s] || "Standard",
      price,
      qty: Math.min(q, stock),
    });
    if (buy) router.push("/checkout");
    else showToast("Added to cart ✓");
  }

  return (
    <>
      <div className="w">
        <div className="crumb">
          <Link href="/">Home</Link> / <Link href={`/c/${product.categorySlug}`}>{product.categoryName}</Link> /{" "}
          {product.name}
        </div>
        <div className="det">
          <div className="gal">
            <div className="main">
              <span className="tag">{Math.round((1 - price / mrp) * 100)}% off</span>
              {photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photo} alt={`${product.name} photo ${Math.min(i, photos.length - 1) + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <ProductArt artKey={product.artKey} color={variant.color} variantIndex={v} view={i} label={product.name} />
              )}
              {photos.length > 1 ? <span className="photo-count">{Math.min(i, photos.length - 1) + 1} / {photos.length}</span> : null}
            </div>
            <div className="thumbs">
              {photos.length > 1
                ? photos.map((url, j) => (
                    <button key={url} className={j === i ? "on" : ""} aria-label={`Photo ${j + 1}`} onClick={() => setI(j)} type="button">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="" />
                    </button>
                  ))
                : photos.length === 0
                  ? [0, 1, 2].map((j) => (
                      <button key={j} className={j === i ? "on" : ""} aria-label={`View ${j + 1}`} onClick={() => setI(j)} type="button">
                        <ProductArt artKey={product.artKey} color={variant.color} variantIndex={v} view={j} label={product.name} />
                      </button>
                    ))
                  : null}
            </div>
          </div>
          <div>
            <span className="chip">{product.categoryName}</span>
            <h1>{product.name}</h1>
            <div className="stars">
              {stars(product.rating)}{" "}
              <small className="mut">
                {product.rating} · {product.reviewCount} reviews
              </small>
            </div>
            <p className="mut" style={{ fontSize: 16 }}>
              {product.tagline} {product.description.split(". ")[0]}.
            </p>
            <p>
              <b>{product.categorySlug === "laser" ? "Finish" : "Variant"}:</b>{" "}
              <span className="mut">{variant.name}</span>
            </p>
            <div className="sw">
              {product.variants.map((y, j) => (
                <button key={y.id} className={`op ${j === v ? "on" : ""}`} onClick={() => { setV(j); setI(0); setQ(1); }} type="button">
                  <span className="dot" style={{ background: y.color }} />
                  {y.name}
                </button>
              ))}
            </div>
            <p>
              <b>Size:</b> <span className="mut">{product.sizes[s]}</span>
            </p>
            <div className="sw">
              {product.sizes.map((z, j) => (
                <button key={z} className={`op ${j === s ? "on" : ""}`} onClick={() => setS(j)} type="button">
                  {z}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, margin: "10px 0 16px" }}>
              <span className="pr" style={{ fontSize: 40 }}>
                {rupees(price)}
              </span>
              <s className="mut">{rupees(mrp)}</s>
              <span style={{ color: "var(--at)" }}>Save {rupees(mrp - price)}</span>
            </div>
            <p className="mut">{stock > 0 ? `${stock} in stock for ${variant.name}` : `${variant.name} is out of stock`}</p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
              <div className="qty">
                <button aria-label="Less" onClick={() => setQ(Math.max(1, q - 1))} type="button">
                  −
                </button>
                <span>{q}</span>
                <button aria-label="More" onClick={() => setQ(Math.min(stock || 1, 9, q + 1))} type="button" disabled={stock < 1}>
                  +
                </button>
              </div>
              <button className="btn" onClick={() => add()} type="button" disabled={stock < 1}>
                Add to cart
              </button>
              <button className="btn g" onClick={() => add(true)} type="button" disabled={stock < 1}>
                Buy now
              </button>
            </div>
            <div className="perks">
              <div>
                <b>🚚</b>Free shipping over ₹{settings.freeShippingThreshold}
              </div>
              <div>
                <b>↩️</b>{settings.returnPolicyDays}-day easy returns
              </div>
              <div>
                <b>🔒</b>Secure payments
              </div>
            </div>
          </div>
        </div>

        <div className="tabs" role="tablist">
          {["Description", "Features", "Specifications", "Delivery & returns"].map((t, j) => (
            <button key={t} className={j === tab ? "on" : ""} onClick={() => setTab(j)} type="button">
              {t}
            </button>
          ))}
        </div>
        <div className={`tp ${tab === 0 ? "on" : ""}`}>
          <p>{product.description}</p>
        </div>
        <div className={`tp ${tab === 1 ? "on" : ""}`}>
          <ul className="fgrid">
            {product.features.map((f) => (
              <li key={f[0]}>
                <b>{f[0]}</b>
                <span className="mut">{f[1]}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className={`tp ${tab === 2 ? "on" : ""}`}>
          <table className="sp">
            <tbody>
              {product.specs.map((r) => (
                <tr key={r[0]}>
                  <td>{r[0]}</td>
                  <td>{r[1]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className={`tp ${tab === 3 ? "on" : ""}`}>
          <p>
            Standard delivery takes {settings.shippingStandardDays} across India (custom laser-cut items add{" "}
            {settings.customProductionDays} for production). Shipping is free on orders over ₹
            {settings.freeShippingThreshold}, otherwise ₹{settings.shippingStandardFee}; express is ₹
            {settings.shippingExpressFee}. Unused products can be returned within {settings.returnPolicyDays} days.
            Custom-made items are returned only if damaged or defective.
          </p>
        </div>

        <div className="sh">
          <h2>You may also like</h2>
        </div>
        <div className="g4">
          {related.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
      <Footer categories={categories} settings={settings} />
    </>
  );
}
