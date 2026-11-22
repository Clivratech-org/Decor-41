"use client";

import { ImageField } from "@/components/admin/ImageField";
import type { ShippingSettings } from "@/lib/settings";
import { useCallback, useEffect, useState } from "react";

export default function AdminShippingPage() {
  const [form, setForm] = useState<ShippingSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/settings");
    if (res.ok) setForm(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function setNum(key: keyof ShippingSettings, value: string) {
    if (!form) return;
    setForm({ ...form, [key]: Number(value) || 0 });
  }

  function setStr(key: keyof ShippingSettings, value: string) {
    if (!form) return;
    setForm({ ...form, [key]: value });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setForm(await res.json());
        setMsg("Settings saved.");
      } else {
        setMsg("Could not save settings.");
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading || !form) return <h1>Settings</h1>;

  return (
    <>
      <h1>Settings</h1>
      {msg ? (
        <p style={{ color: "var(--a)", marginBottom: 12 }}>{msg}</p>
      ) : null}
      <form onSubmit={save}>
        <div className="bx">
          <h3 style={{ marginTop: 0 }}>Hero backgrounds</h3>
          <p className="hint" style={{ marginTop: 0 }}>
            Upload desktop and optional mobile crops for each slide. Empty mobile slots reuse the desktop image.
          </p>
          <ImageField
            label="Hero image 1 (desktop)"
            folder="hero"
            value={form.heroImage1}
            onChange={(url) => setStr("heroImage1", url)}
          />
          <ImageField
            label="Hero image 1 (mobile)"
            folder="hero"
            value={form.heroImage1Mobile}
            onChange={(url) => setStr("heroImage1Mobile", url)}
          />
          <ImageField
            label="Hero image 2 (desktop)"
            folder="hero"
            value={form.heroImage2}
            onChange={(url) => setStr("heroImage2", url)}
          />
          <ImageField
            label="Hero image 2 (mobile)"
            folder="hero"
            value={form.heroImage2Mobile}
            onChange={(url) => setStr("heroImage2Mobile", url)}
          />
          <ImageField
            label="Hero image 3 (desktop)"
            folder="hero"
            value={form.heroImage3}
            onChange={(url) => setStr("heroImage3", url)}
          />
          <ImageField
            label="Hero image 3 (mobile)"
            folder="hero"
            value={form.heroImage3Mobile}
            onChange={(url) => setStr("heroImage3Mobile", url)}
          />
        </div>
        <div className="bx">
          <h3 style={{ marginTop: 0 }}>Orders &amp; shipping</h3>
          <label>Minimum order amount (₹)</label>
          <input
            type="number"
            min={0}
            value={form.minOrderAmount}
            onChange={(e) => setNum("minOrderAmount", e.target.value)}
          />
          <p className="hint">Set 0 to disable. Cart shows a progress bar and checkout stays locked until this amount.</p>
          <label>Standard shipping fee (₹)</label>
          <input
            type="number"
            value={form.shippingStandardFee}
            onChange={(e) => setNum("shippingStandardFee", e.target.value)}
          />
          <label>Express shipping fee (₹)</label>
          <input
            type="number"
            value={form.shippingExpressFee}
            onChange={(e) => setNum("shippingExpressFee", e.target.value)}
          />
          <label>Free shipping threshold (₹)</label>
          <input
            type="number"
            value={form.freeShippingThreshold}
            onChange={(e) => setNum("freeShippingThreshold", e.target.value)}
          />
        </div>
        <div className="bx">
          <h3 style={{ marginTop: 0 }}>Delivery times</h3>
          <label>Standard delivery text</label>
          <input
            value={form.shippingStandardDays}
            onChange={(e) => setStr("shippingStandardDays", e.target.value)}
          />
          <label>Express delivery text</label>
          <input
            value={form.shippingExpressDays}
            onChange={(e) => setStr("shippingExpressDays", e.target.value)}
          />
          <label>Custom production days</label>
          <input
            value={form.customProductionDays}
            onChange={(e) => setStr("customProductionDays", e.target.value)}
          />
          <label>Return policy (days)</label>
          <input
            value={form.returnPolicyDays}
            onChange={(e) => setStr("returnPolicyDays", e.target.value)}
          />
        </div>
        <div className="bx">
          <h3 style={{ marginTop: 0 }}>Contact</h3>
          <label>Phone</label>
          <input value={form.contactPhone} onChange={(e) => setStr("contactPhone", e.target.value)} />
          <label>Email</label>
          <input
            type="email"
            value={form.contactEmail}
            onChange={(e) => setStr("contactEmail", e.target.value)}
          />
          <label>Address</label>
          <textarea
            rows={3}
            value={form.contactAddress}
            onChange={(e) => setStr("contactAddress", e.target.value)}
          />
          <label>WhatsApp (with country code, no +)</label>
          <input value={form.whatsapp} onChange={(e) => setStr("whatsapp", e.target.value)} />
        </div>
        <button type="submit" className="btn" disabled={saving}>
          {saving ? "Saving…" : "Save settings"}
        </button>
      </form>
    </>
  );
}
