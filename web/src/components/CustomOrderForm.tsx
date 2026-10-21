"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Footer } from "@/components/Footer";
import { laserArtSvg } from "@/lib/art";
import type { ShippingSettings } from "@/lib/settings";
import { useCart } from "@/context/CartContext";

export function CustomOrderForm({
  categories,
  settings,
}: {
  categories: { slug: string; name: string }[];
  settings: ShippingSettings;
}) {
  const { showToast } = useCart();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    try {
      const res = await fetch("/api/custom", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setDone(true);
      showToast("Custom request submitted ✓");
      e.currentTarget.reset();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="w">
        <div className="crumb">
          <Link href="/">Home</Link> / Custom laser cut
        </div>
        <div className="pgh">
          <h1>Your design. Our laser.</h1>
          <p className="mut">Upload a sketch, logo or name — we&apos;ll cut it and get in touch.</p>
        </div>
        <div className="feat">
          <div className="vis">
            <div className="pat" style={{ opacity: 0.14 }} />
            <span dangerouslySetInnerHTML={{ __html: laserArtSvg() }} />
          </div>
          <div className="tx">
            {done ? (
              <>
                <span className="chip">Request received</span>
                <h2 style={{ margin: "10px 0" }}>Thanks — we&apos;ll contact you soon.</h2>
                <p className="mut">
                  Our team will review your file and confirm materials, size and price within 1–2 working days.
                </p>
                <button className="btn" type="button" onClick={() => setDone(false)}>
                  Submit another
                </button>
              </>
            ) : (
              <form onSubmit={onSubmit}>
                <span className="chip">Custom laser cutting</span>
                <h2 style={{ margin: "10px 0" }}>Start a custom order</h2>
                <label className="f">
                  Your name
                  <input name="name" required placeholder="Kavin Kumar" />
                </label>
                <label className="f">
                  Phone or email
                  <input name="contact" required placeholder={settings.contactPhone} />
                </label>
                <label className="f">
                  What should we cut?
                  <input name="interest" required placeholder="Family name plate / logo / sketch" />
                </label>
                <label className="f">
                  Notes
                  <textarea name="notes" rows={3} placeholder="Material, size, colour preferences…" />
                </label>
                <label className="f">
                  Upload design file
                  <input name="file" type="file" accept="image/*,.pdf,.ai,.svg,.dxf" required />
                </label>
                <p className="mut" style={{ fontSize: 13 }}>
                  Accepted: JPG, PNG, PDF, SVG, AI, DXF · max 8 MB. Production typically adds{" "}
                  {settings.customProductionDays}.
                </p>
                <button className="btn" type="submit" disabled={busy} style={{ marginTop: 12 }}>
                  {busy ? "Uploading…" : "Submit custom request"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
      <Footer categories={categories} settings={settings} />
    </>
  );
}
