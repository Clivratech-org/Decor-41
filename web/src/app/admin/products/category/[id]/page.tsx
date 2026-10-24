"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { rupees } from "@/lib/money";

type Product = {
  id: number;
  name: string;
  categoryId: string;
  categoryName: string;
  price: number;
  stock: number;
  imageUrl: string | null;
  visible: boolean;
};

type Category = {
  id: string;
  name: string;
  description: string;
  imageUrl: string | null;
  parentId: string | null;
  productCount: number;
};

export default function CategoryProductsPage() {
  const { id } = useParams<{ id: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [children, setChildren] = useState<Category[]>([]);
  const [parent, setParent] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetch("/api/admin/categories").then((r) => r.json()), fetch("/api/admin/products").then((r) => r.json())])
      .then(([categories, catalog]) => {
        const rows = categories as Category[];
        const current = rows.find((c) => c.id === id) || null;
        setCategory(current);
        setChildren(rows.filter((c) => c.parentId === id));
        setParent(current?.parentId ? rows.find((c) => c.id === current.parentId) || null : null);
        setProducts((catalog.products as Product[]).filter((p) => p.categoryId === id));
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <h1>Products</h1>;
  if (!category) return <h1>Category not found</h1>;

  return (
    <>
      <p className="crumb">
        <Link href="/admin/products">Categories</Link>
        {parent ? (
          <>
            {" "}
            / <Link href={`/admin/products/category/${parent.id}`}>{parent.name}</Link>
          </>
        ) : null}{" "}
        / {category.name}
      </p>
      <div className="page-head">
        <div className="title-row">
          {category.imageUrl ? <img className="avatar" src={category.imageUrl} alt="" /> : null}
          <div>
            <h1>{category.name}</h1>
            <p className="lead">{category.description || "Products in this category."}</p>
          </div>
        </div>
        <div className="actions">
          <Link className="btn g" href={`/admin/products/category/${category.id}/edit`}>
            Edit category
          </Link>
          {!category.parentId ? (
            <Link className="btn g" href={`/admin/products/category/new?parent=${category.id}`}>
              Add subcategory
            </Link>
          ) : null}
          <Link className="btn" href={`/admin/products/new?category=${category.id}`}>
            Add product
          </Link>
        </div>
      </div>
      {children.length > 0 ? (
        <section className="section">
          <div className="section-head">
            <h2>Subcategories</h2>
            <p className="hint">These sit inside {category.name}. Open one to add its own products.</p>
          </div>
          <div className="subgrid">
            {children.map((child) => (
              <Link key={child.id} href={`/admin/products/category/${child.id}`} className="subcard">
                {child.imageUrl ? <img src={child.imageUrl} alt="" /> : <div className="ph">No image</div>}
                <div>
                  <span className="pill">Subcategory</span>
                  <b>{child.name}</b>
                  <p>{child.description || "No description yet"}</p>
                  <span className="hint">
                    {child.productCount} product{child.productCount === 1 ? "" : "s"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
      <section className="section">
        <div className="section-head">
          <h2>Products</h2>
          <p className="hint">Products saved directly in {category.name}.</p>
        </div>
        {products.length === 0 ? (
          <div className="bx empty">No products yet. Add the first one for this category.</div>
        ) : (
          <div className="grid">
            {products.map((p) => (
              <Link key={p.id} href={`/admin/products/${p.id}`} className="pc cat-link">
                {p.imageUrl ? <img src={p.imageUrl} alt="" /> : <div className="ph">No image</div>}
                <div>
                  <b>{p.name}</b>
                  <p>
                    From {rupees(p.price)} · {p.stock} in stock
                  </p>
                  <span className={`pill ${p.visible ? "Paid" : "Lost"}`}>{p.visible ? "Visible" : "Hidden"}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
