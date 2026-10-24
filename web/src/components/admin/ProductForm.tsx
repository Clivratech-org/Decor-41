"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ImageField } from "@/components/admin/ImageField";

export type VariantDraft = {
  id?: string;
  name: string;
  price: number;
  stock: number;
};

export type ProductDraft = {
  id?: number;
  name: string;
  categoryId: string;
  tagline: string;
  description: string;
  stock: number;
  variants: VariantDraft[];
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

  function updateVariant(index: number, patch: Partial<VariantDraft>) {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.map((variant, i) => (i === index ? { ...variant, ...patch } : variant)),
    }));
  }

  async function save() {
    if (!form.name.trim()) {
      setError("Product name is required");
      return;
    }
    const variants = form.variants.map((variant) => ({
      ...variant,
      name: variant.name.trim(),
      price: Math.max(0, Math.round(Number(variant.price) || 0)),
      stock: Math.max(0, Math.round(Number(variant.stock) || 0)),
    }));
    if (!variants.length || variants.some((variant) => !variant.name)) {
      setError("Each variant needs a name");
      return;
    }
    setBusy(true);
    setError("");
    const res = await fetch("/api/admin/products", {
      method: form.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, variants }),
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

  const prices = form.variants.map((variant) => Number(variant.price) || 0);
  const totalStock = form.variants.reduce((sum, variant) => sum + (Number(variant.stock) || 0), 0);

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
          <strong>
            {prices.length > 1 && prices.some((price) => price !== prices[0])
              ? `From ₹${Math.min(...prices)}`
              : `₹${prices[0] || 0}`}
          </strong>
          <span>{totalStock} in stock across options</span>
        </div>
      </div>
      <div className="bx form-grid">
        <label>Name</label>
        <input value={form.name} onChange={(e) => set("name", e.target.value)} />
        <label>Short line</label>
        <input value={form.tagline} onChange={(e) => set("tagline", e.target.value)} placeholder="Shown under the name" />
        <label>Description</label>
        <textarea rows={5} value={form.description} onChange={(e) => set("description", e.target.value)} />
        <label>Variants</label>
        <p className="hint">Each option has its own price and stock. Customers choose one on the product page.</p>
        <div className="variant-list">
          {form.variants.map((variant, index) => (
            <div className="variant-row" key={variant.id || index}>
              <label className="variant-field name">
                <span>Option</span>
                <input
                  value={variant.name}
                  placeholder="Standard, Premium…"
                  aria-label={`Variant ${index + 1} name`}
                  onChange={(e) => updateVariant(index, { name: e.target.value })}
                />
              </label>
              <label className="variant-field">
                <span>Price (₹)</span>
                <input
                  type="number"
                  min={0}
                  value={variant.price}
                  aria-label={`Variant ${index + 1} price`}
                  onChange={(e) => updateVariant(index, { price: Number(e.target.value) })}
                />
              </label>
              <label className="variant-field">
                <span>Stock</span>
                <input
                  type="number"
                  min={0}
                  value={variant.stock}
                  aria-label={`Variant ${index + 1} stock`}
                  onChange={(e) => updateVariant(index, { stock: Number(e.target.value) })}
                />
              </label>
              <button
                className="btn g"
                type="button"
                disabled={form.variants.length === 1}
                onClick={() => set("variants", form.variants.filter((_, i) => i !== index))}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <button
          className="btn g"
          type="button"
          onClick={() =>
            set("variants", [
              ...form.variants,
              { name: "", price: form.variants[0]?.price || 0, stock: 0 },
            ])
          }
        >
          Add variant
        </button>
        <ImageField
          label="Product image"
          folder="products"
          value={form.imageUrl}
          onChange={(url) => setForm((prev) => ({ ...prev, imageUrl: url }))}
        />
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
