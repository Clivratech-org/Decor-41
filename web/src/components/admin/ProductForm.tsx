"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ImageField } from "@/components/admin/ImageField";

export type ProductDraft = {
  id?: number;
  name: string;
  categoryId: string;
  tagline: string;
  description: string;
  price: number;
  stock: number;
  variants: string;
  imageUrl: string;
  visible: boolean;
};

export function ProductForm({
  initial,
  categoryName,
}: {
  initial: ProductDraft;
  categoryName: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function set<K extends keyof ProductDraft>(key: K, value: ProductDraft[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    if (!form.name.trim()) {
      setError("Product name is required");
      return;
    }
    setBusy(true);
    setError("");
    const res = await fetch("/api/admin/products", {
      method: form.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Could not save");
      return;
    }
    router.push(`/admin/products/category/${form.categoryId}`);
    router.refresh();
  }

  async function remove() {
    if (!form.id || !confirm(`Delete ${form.name}?`)) return;
    const res = await fetch(`/api/admin/products?id=${form.id}`, { method: "DELETE" });
    if (res.ok) router.push(`/admin/products/category/${form.categoryId}`);
  }

  return (
    <div className="editor">
      <div className="editor-copy">
        <p className="crumb">
          <Link href="/admin/products">Categories</Link> /{" "}
          <Link href={`/admin/products/category/${form.categoryId}`}>{categoryName}</Link>
        </p>
        <h1>{form.id ? form.name || "Edit product" : "New product"}</h1>
        <p className="lead">This is the product customers see in {categoryName}.</p>
        <div className="preview-card">
          <div className="preview lg">{form.imageUrl ? <img src={form.imageUrl} alt="" /> : <span>Image preview</span>}</div>
          <b>{form.name || "Product name"}</b>
          <span>{form.tagline || "Short line shown on the card"}</span>
          <strong>₹{Number(form.price) || 0}</strong>
        </div>
      </div>
      <div className="bx form-grid">
        <label>Name</label>
        <input value={form.name} onChange={(e) => set("name", e.target.value)} />
        <label>Short line</label>
        <input value={form.tagline} onChange={(e) => set("tagline", e.target.value)} placeholder="Shown under the name" />
        <label>Description</label>
        <textarea rows={5} value={form.description} onChange={(e) => set("description", e.target.value)} />
        <div className="split">
          <div>
            <label>Price (₹)</label>
            <input type="number" min={0} value={form.price} onChange={(e) => set("price", Number(e.target.value))} />
          </div>
          <div>
            <label>Stock</label>
            <input type="number" min={0} value={form.stock} onChange={(e) => set("stock", Number(e.target.value))} />
          </div>
        </div>
        <label>Options, separated by commas</label>
        <input
          value={form.variants}
          onChange={(e) => set("variants", e.target.value)}
          placeholder="Natural wood, Black acrylic"
        />
        <ImageField label="Product image" folder="products" value={form.imageUrl} onChange={(url) => set("imageUrl", url)} />
        <label className="check">
          <input type="checkbox" checked={form.visible} onChange={(e) => set("visible", e.target.checked)} />
          Visible on the store
        </label>
        {error ? <p className="err">{error}</p> : null}
        <div className="actions">
          <button className="btn" type="button" disabled={busy} onClick={save}>
            {busy ? "Saving…" : "Save product"}
          </button>
          <Link className="btn g" href={`/admin/products/category/${form.categoryId}`}>
            Cancel
          </Link>
          {form.id ? (
            <button className="btn d" type="button" onClick={remove}>
              Delete
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
