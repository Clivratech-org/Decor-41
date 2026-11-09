"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { Icon } from "@/components/Icons";
import type { ProductCard as P } from "@/lib/products";

type Sort = "featured" | "price-asc" | "price-desc" | "rating" | "name";

export function ProductFilters({ products }: { products: P[] }) {
  const [open, setOpen] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number | "">("");
  const [sort, setSort] = useState<Sort>("featured");

  const priceCap = useMemo(
    () => Math.max(0, ...products.map((p) => p.fromPrice), 0),
    [products],
  );

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      if (minRating && p.rating < minRating) return false;
      if (inStockOnly && p.stock < 1) return false;
      if (maxPrice !== "" && p.fromPrice > maxPrice) return false;
      return true;
    });
    list = [...list];
    if (sort === "price-asc") list.sort((a, b) => a.fromPrice - b.fromPrice);
    if (sort === "price-desc") list.sort((a, b) => b.fromPrice - a.fromPrice);
    if (sort === "rating") list.sort((a, b) => b.rating - a.rating);
    if (sort === "name") list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [products, minRating, inStockOnly, maxPrice, sort]);

  const active =
    minRating > 0 || inStockOnly || maxPrice !== "" || sort !== "featured";

  return (
    <div className="filters-wrap">
      <div className="filters-bar">
        <button
          type="button"
          className={`tg filter-btn${open || active ? " on" : ""}`}
          aria-expanded={open}
          aria-label="Filters"
          onClick={() => setOpen((v) => !v)}
        >
          <Icon.Filter />
          <span>Filters{active ? " · on" : ""}</span>
        </button>
        <span className="mut" style={{ fontSize: 13 }}>
          {filtered.length} of {products.length}
        </span>
      </div>
      {open ? (
        <div className="filters-panel panel">
          <label className="f">
            Sort
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
              <option value="featured">Featured</option>
              <option value="price-asc">Price · low to high</option>
              <option value="price-desc">Price · high to low</option>
              <option value="rating">Top rated</option>
              <option value="name">Name A–Z</option>
            </select>
          </label>
          <label className="f">
            Minimum rating
            <select value={minRating} onChange={(e) => setMinRating(Number(e.target.value))}>
              <option value={0}>Any</option>
              <option value={3}>3★ & up</option>
              <option value={4}>4★ & up</option>
              <option value={4.5}>4.5★ & up</option>
            </select>
          </label>
          <label className="f">
            Max price (₹)
            <input
              type="number"
              min={0}
              max={priceCap || undefined}
              placeholder={priceCap ? `Up to ${priceCap}` : "Any"}
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value === "" ? "" : Number(e.target.value))}
            />
          </label>
          <label className="check" style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8 }}>
            <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} />
            In stock only
          </label>
          <button
            type="button"
            className="btn g sm"
            style={{ marginTop: 12 }}
            onClick={() => {
              setMinRating(0);
              setInStockOnly(false);
              setMaxPrice("");
              setSort("featured");
            }}
          >
            Reset
          </button>
        </div>
      ) : null}
      <div className="g4">
        {filtered.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
      {!filtered.length ? <p className="mut" style={{ marginTop: 24 }}>No products match these filters.</p> : null}
    </div>
  );
}
