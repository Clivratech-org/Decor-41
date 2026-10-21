"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Coupon = {
  id: string;
  code: string;
  discountPercent: number;
  active: boolean;
  showOnSite: boolean;
};

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    fetch("/api/admin/coupons")
      .then((r) => r.json())
      .then((rows) => {
        if (Array.isArray(rows)) setCoupons(rows);
      })
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function toggle(coupon: Coupon, field: "active" | "showOnSite") {
    const res = await fetch("/api/admin/coupons", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: coupon.id, [field]: !coupon[field] }),
    });
    if (res.ok) {
      setCoupons((prev) => prev.map((c) => (c.id === coupon.id ? { ...c, [field]: !c[field] } : c)));
    }
  }

  async function remove(coupon: Coupon) {
    if (!confirm(`Delete ${coupon.code}?`)) return;
    const res = await fetch(`/api/admin/coupons?id=${coupon.id}`, { method: "DELETE" });
    if (res.ok) setCoupons((prev) => prev.filter((c) => c.id !== coupon.id));
  }

  if (loading) return <h1>Coupons</h1>;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Coupons</h1>
          <p className="lead">Create a code, set the discount, and choose whether shoppers see it on the homepage.</p>
        </div>
        <Link className="btn" href="/admin/coupons/new">
          New coupon
        </Link>
      </div>
      {coupons.length === 0 ? (
        <div className="bx empty">No coupons yet.</div>
      ) : (
        <div className="grid">
          {coupons.map((c) => (
            <article key={c.id} className="coupon">
              <div className="coupon-top">
                <b>{c.code}</b>
                <span>{c.discountPercent}% off</span>
              </div>
              <label className="check">
                <input type="checkbox" checked={c.active} onChange={() => toggle(c, "active")} />
                Active at checkout
              </label>
              <label className="check">
                <input type="checkbox" checked={c.showOnSite} onChange={() => toggle(c, "showOnSite")} />
                Show on the public site
              </label>
              <div className="actions">
                <Link className="btn g" href={`/admin/coupons/${c.id}`}>
                  Edit
                </Link>
                <button className="btn d" type="button" onClick={() => remove(c)}>
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
