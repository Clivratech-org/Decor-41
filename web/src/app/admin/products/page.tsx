"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Category = {
  id: string;
  name: string;
  description: string;
  imageUrl: string | null;
  parentId: string | null;
  productCount: number;
  childCount: number;
};

export default function AdminProductsHome() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setCategories(data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <h1>Products</h1>;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Products</h1>
          <p className="lead">Start with a category. Open it to add and edit the products inside.</p>
        </div>
        <Link className="btn" href="/admin/products/category/new">
          Add category
        </Link>
      </div>
      <div className="grid">
        {categories
          .filter((c) => !c.parentId)
          .map((c) => (
          <Link key={c.id} href={`/admin/products/category/${c.id}`} className="pc cat-link">
            {c.imageUrl ? <img src={c.imageUrl} alt="" /> : <div className="ph">No image</div>}
            <div>
              <b>{c.name}</b>
              <p>{c.description || "No description"}</p>
              <span className="pill">
                {c.productCount} product{c.productCount === 1 ? "" : "s"}
                {c.childCount ? ` · ${c.childCount} subcategor${c.childCount === 1 ? "y" : "ies"}` : ""}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
