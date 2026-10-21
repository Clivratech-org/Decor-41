"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ImageField } from "@/components/admin/ImageField";

export type CategoryDraft = {
  id?: string;
  name: string;
  description: string;
  sortOrder: number;
  imageUrl: string;
};

export function CategoryForm({ initial }: { initial: CategoryDraft }) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    if (!form.name.trim()) {
      setError("Category name is required");
      return;
    }
    setBusy(true);
    setError("");
    const res = await fetch("/api/admin/categories", {
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
    router.push("/admin/products");
    router.refresh();
  }

  async function remove() {
    if (!form.id || !confirm(`Delete ${form.name}?`)) return;
    const res = await fetch(`/api/admin/categories?id=${form.id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not delete");
      return;
    }
    router.push("/admin/products");
  }

  return (
    <div className="editor">
      <div className="editor-copy">
        <p className="crumb">
          <Link href="/admin/products">Categories</Link>
        </p>
        <h1>{form.id ? "Edit category" : "New category"}</h1>
        <p className="lead">Customers see this card on the shop, then the products inside it.</p>
        <div className="preview-card">
          <div className="preview lg">{form.imageUrl ? <img src={form.imageUrl} alt="" /> : <span>Category image</span>}</div>
          <b>{form.name || "Category name"}</b>
          <span>{form.description || "Short description"}</span>
        </div>
      </div>
      <div className="bx form-grid">
        <label>Name</label>
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <label>Description</label>
        <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <label>Sort order</label>
        <input
          type="number"
          value={form.sortOrder}
          onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
        />
        <ImageField
          label="Category image"
          folder="categories"
          value={form.imageUrl}
          onChange={(imageUrl) => setForm({ ...form, imageUrl })}
        />
        {error ? <p className="err">{error}</p> : null}
        <div className="actions">
          <button className="btn" type="button" disabled={busy} onClick={save}>
            {busy ? "Saving…" : "Save category"}
          </button>
          <Link className="btn g" href="/admin/products">
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
