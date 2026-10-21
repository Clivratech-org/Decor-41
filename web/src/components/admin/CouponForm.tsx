"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function CouponForm({
  initial,
}: {
  initial: { id?: string; code: string; discountPercent: number; active: boolean; showOnSite: boolean };
}) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    setError("");
    const res = await fetch("/api/admin/coupons", {
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
    router.push("/admin/coupons");
    router.refresh();
  }

  return (
    <div className="editor">
      <div>
        <p className="crumb">
          <Link href="/admin/coupons">Coupons</Link>
        </p>
        <h1>{form.id ? form.code : "New coupon"}</h1>
        <p className="lead">Shoppers enter this code at checkout. Turn on “Show on the public site” to print it on the homepage.</p>
      </div>
      <div className="bx form-grid">
        <label>Code</label>
        <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="DECOR10" />
        <label>Discount %</label>
        <input
          type="number"
          min={1}
          max={100}
          value={form.discountPercent}
          onChange={(e) => setForm({ ...form, discountPercent: Number(e.target.value) })}
        />
        <label className="check">
          <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
          Active at checkout
        </label>
        <label className="check">
          <input
            type="checkbox"
            checked={form.showOnSite}
            onChange={(e) => setForm({ ...form, showOnSite: e.target.checked })}
          />
          Show on the public site
        </label>
        {error ? <p className="err">{error}</p> : null}
        <div className="actions">
          <button className="btn" type="button" disabled={busy} onClick={save}>
            {busy ? "Saving…" : "Save coupon"}
          </button>
          <Link className="btn g" href="/admin/coupons">
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
}
