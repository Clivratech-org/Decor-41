"use client";

import { rupees } from "@/lib/money";
import { useCallback, useEffect, useMemo, useState } from "react";

type Category = { id: string; name: string; slug: string };

type ProductRow = {
  id: number;
  name: string;
  categoryId: string;
  categoryName: string;
  price: number;
  stock: number;
  variants: string;
  imageUrl: string | null;
  visible: boolean;
  artKey: number;
};

type FormState = {
  name: string;
  categoryId: string;
  price: string;
  stock: string;
  variants: string;
  imageUrl: string;
  visible: boolean;
};

function productImage(p: ProductRow) {
  if (p.imageUrl) return p.imageUrl;
  return `https://loremflickr.com/400/300/decor,product?lock=${p.artKey}`;
}

const emptyForm = (categoryId: string): FormState => ({
  name: "",
  categoryId,
  price: "",
  stock: "0",
  variants: "",
  imageUrl: "",
  visible: true,
});

export default function AdminProductsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [q, setQ] = useState("");
  const [fc, setFc] = useState("All");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm(""));
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/products");
    if (res.ok) {
      const data = (await res.json()) as { categories: Category[]; products: ProductRow[] };
      setCategories(data.categories);
      setProducts(data.products);
      setForm((f) =>
        f.categoryId ? f : { ...f, categoryId: data.categories[0]?.id ?? "" },
      );
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (fc !== "All" && p.categoryName !== fc) return false;
      if (q && !p.name.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [products, fc, q]);

  const categoryNames = useMemo(() => ["All", ...categories.map((c) => c.name)], [categories]);

  function openAdd() {
    setEditId(null);
    setForm(emptyForm(categories[0]?.id ?? ""));
    setModal(true);
  }

  function openEdit(p: ProductRow) {
    setEditId(p.id);
    setForm({
      name: p.name,
      categoryId: p.categoryId,
      price: String(p.price),
      stock: String(p.stock),
      variants: p.variants,
      imageUrl: p.imageUrl ?? "",
      visible: p.visible,
    });
    setModal(true);
  }

  async function saveProduct() {
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        categoryId: form.categoryId,
        price: Number(form.price) || 0,
        stock: Number(form.stock) || 0,
        variants: form.variants || "Standard",
        imageUrl: form.imageUrl,
        visible: form.visible,
      };
      const res = await fetch("/api/admin/products", {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editId ? { ...payload, id: editId } : payload),
      });
      if (res.ok) {
        setModal(false);
        await load();
      }
    } finally {
      setSaving(false);
    }
  }

  async function deleteProduct() {
    if (editId == null) return;
    if (!confirm("Delete this product?")) return;
    const res = await fetch(`/api/admin/products?id=${editId}`, { method: "DELETE" });
    if (res.ok) {
      setModal(false);
      await load();
    }
  }

  async function adjustStock(p: ProductRow, delta: number) {
    const stock = Math.max(0, p.stock + delta);
    const res = await fetch("/api/admin/products", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: p.id,
        name: p.name,
        categoryId: p.categoryId,
        price: p.price,
        stock,
        variants: p.variants,
        imageUrl: p.imageUrl ?? "",
        visible: p.visible,
      }),
    });
    if (res.ok) {
      setProducts((prev) => prev.map((x) => (x.id === p.id ? { ...x, stock } : x)));
    }
  }

  if (loading) return <h1>Products</h1>;

  return (
    <>
      <h1>Products</h1>
      <div className="tools">
        <input
          placeholder="🔍 Search products"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select value={fc} onChange={(e) => setFc(e.target.value)} aria-label="Category filter">
          {categoryNames.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <button type="button" className="btn" onClick={openAdd}>
          + Add product
        </button>
      </div>
      <div className="grid">
        {filtered.map((p) => {
          const variantCount = p.variants.split(",").filter((s) => s.trim()).length || 1;
          return (
            <div className="pc" key={p.id}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={productImage(p)} alt="" />
              <div>
                <span className={`pill ${p.visible ? "Paid" : "Lost"}`}>
                  {p.visible ? "Live" : "Hidden"}
                </span>
                {p.stock < 10 ? <span className="pill Refunded"> Low stock</span> : null}
                <h3 style={{ margin: "8px 0 2px" }}>{p.name}</h3>
                <small style={{ color: "var(--mut)" }}>
                  {p.categoryName} · {variantCount} variants
                </small>
                <p style={{ color: "var(--a)", fontWeight: 800, margin: "6px 0" }}>
                  {rupees(p.price)}
                </p>
                <div className="st">
                  <button type="button" className="btn g" onClick={() => adjustStock(p, -1)}>
                    −
                  </button>
                  <b>{p.stock}</b>
                  <button type="button" className="btn g" onClick={() => adjustStock(p, 1)}>
                    +
                  </button>
                  <span style={{ flex: 1 }} />
                  <button type="button" className="btn g" onClick={() => openEdit(p)}>
                    Edit
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className={`md${modal ? " on" : ""}`} onClick={() => setModal(false)} role="presentation">
        <div onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
          <h2 style={{ marginTop: 0 }}>{editId == null ? "Add product" : "Edit product"}</h2>
          <label>Name</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <label>Category</label>
          <select
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <label>Price (₹)</label>
          <input
            type="number"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />
          <label>Stock</label>
          <input
            type="number"
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
          />
          <label>Variants (comma separated)</label>
          <input
            value={form.variants}
            onChange={(e) => setForm({ ...form, variants: e.target.value })}
            placeholder="Red, Blue, Black"
          />
          <label>Image URL</label>
          <input
            value={form.imageUrl}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            placeholder="https://… (leave blank for auto image)"
          />
          <label className="st">
            <input
              type="checkbox"
              style={{ width: "auto" }}
              checked={form.visible}
              onChange={(e) => setForm({ ...form, visible: e.target.checked })}
            />
            Visible on store
          </label>
          <div className="st" style={{ marginTop: 18 }}>
            <button type="button" className="btn" onClick={saveProduct} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </button>
            <button type="button" className="btn g" onClick={() => setModal(false)}>
              Cancel
            </button>
            {editId != null ? (
              <>
                <span style={{ flex: 1 }} />
                <button type="button" className="btn d" onClick={deleteProduct}>
                  Delete
                </button>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
