"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ProductArt } from "@/lib/art";
import { rupees } from "@/lib/money";
import type { ProductCard as P } from "@/lib/products";
import { useCart } from "@/context/CartContext";

function stars(r: number) {
  return "★".repeat(Math.round(r)) + "☆".repeat(5 - Math.round(r));
}

export function ProductCard({ product }: { product: P }) {
  const { addItem, showToast } = useCart();
  const [imgOk, setImgOk] = useState(false);
  const color = product.variants[0]?.color || "#8B5E3C";

  useEffect(() => {
    if (!product.imageUrl) {
      setImgOk(false);
      return;
    }
    let alive = true;
    const img = new Image();
    img.onload = () => {
      if (alive) setImgOk(true);
    };
    img.onerror = () => {
      if (alive) setImgOk(false);
    };
    img.src = product.imageUrl;
    return () => {
      alive = false;
    };
  }, [product.imageUrl]);

  function quickAdd(e: React.MouseEvent) {
    e.preventDefault();
    const index = product.variants.findIndex((variant) => variant.stock > 0);
    const v = product.variants[index] || product.variants[0];
    if (!v || v.stock < 1) return;
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      categorySlug: product.categorySlug,
      categoryName: product.categoryName,
      artKey: product.artKey,
      variantIndex: Math.max(0, index),
      variantId: v.id,
      variantName: v.name,
      color: v.color,
      size: product.sizes[0] || "Standard",
      price: v.price,
      qty: 1,
    });
    showToast("Added to cart ✓");
  }

  return (
    <Link className="card" href={`/p/${product.slug}`}>
      <span className="tag">
        {product.stock > 0 ? (product.categorySlug === "laser" ? "Made to order" : "In stock") : "Out of stock"}
      </span>
      <div className="art">
        {product.imageUrl && imgOk ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.imageUrl} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <ProductArt artKey={product.artKey} color={color} label={product.name} />
        )}
      </div>
      <div className="bd">
        <small>{product.categoryName}</small>
        <h3>{product.name}</h3>
        <span className="stars">
          {stars(product.rating)} <small>({product.reviewCount})</small>
        </span>
        <p>{product.tagline}</p>
        <div className="ft">
          <span className="pr">From {rupees(product.fromPrice)}</span>
          <button className="qa" aria-label={`Quick add ${product.name}`} onClick={quickAdd} type="button">
            +
          </button>
        </div>
      </div>
    </Link>
  );
}
