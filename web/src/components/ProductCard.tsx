"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ProductArt } from "@/lib/art";
import { rupees } from "@/lib/money";
import type { ProductCard as P } from "@/lib/products";
import { useCart } from "@/context/CartContext";
import { Icon } from "@/components/Icons";

function stars(r: number) {
  return "★".repeat(Math.round(r)) + "☆".repeat(5 - Math.round(r));
}

export function ProductCard({ product }: { product: P }) {
  const { addItem, showToast } = useCart();
  const [imgOk, setImgOk] = useState(false);
  const inStock = product.variants.some((v) => v.stock > 0) || product.stock > 0;
  const color = product.variants.find((v) => v.stock > 0)?.color || product.variants[0]?.color || "#8B5E3C";
  const cover =
    product.variants.find((v) => v.stock > 0 && v.imageUrl)?.imageUrl ||
    product.variants.find((v) => v.imageUrl)?.imageUrl ||
    product.imageUrl;

  useEffect(() => {
    if (!cover) {
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
    img.src = cover;
    return () => {
      alive = false;
    };
  }, [cover]);

  function quickAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!inStock) {
      showToast("Out of stock");
      return;
    }
    const index = product.variants.findIndex((variant) => variant.stock > 0);
    const v = product.variants[index] || product.variants[0];
    if (!v || v.stock < 1) {
      showToast("Out of stock");
      return;
    }
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

  const tag = !inStock
    ? "Out of stock"
    : product.categorySlug === "laser" || product.customOrderEnabled
      ? "Made to order"
      : "In stock";

  return (
    <Link className={`card${!inStock ? " sold" : ""}`} href={`/p/${product.slug}`}>
      <span className={`tag${!inStock ? " bad" : ""}`}>{tag}</span>
      <div className="art">
        {cover && imgOk ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
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
          <button
            className="qa"
            aria-label={inStock ? `Quick add ${product.name}` : `${product.name} out of stock`}
            onClick={quickAdd}
            type="button"
            disabled={!inStock}
          >
            <Icon.Plus />
          </button>
        </div>
      </div>
    </Link>
  );
}
