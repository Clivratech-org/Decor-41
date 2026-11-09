"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { Footer } from "@/components/Footer";
import { laserArtSvg } from "@/lib/art";
import type { ShippingSettings } from "@/lib/settings";
import { useCart } from "@/context/CartContext";
import { Icon } from "@/components/Icons";
import { whatsappOrderUrl } from "@/lib/whatsapp-order";

type Cat = {
  slug: string;
  name: string;
  customOrderEnabled?: boolean;
  customOrderTitle?: string;
  customOrderBody?: string;
};

export function CustomOrderForm({
  categories,
  customCategories,
  settings,
  initialCategory,
}: {
  categories: { slug: string; name: string }[];
  customCategories: Cat[];
  settings: ShippingSettings;
  initialCategory?: string;
}) {
  const { showToast } = useCart();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [category, setCategory] = useState(() => {
    if (initialCategory && customCategories.some((c) => c.slug === initialCategory)) return initialCategory;
    return customCategories[0]?.slug || "";
  });

  const selected = useMemo(
    () => customCategories.find((c) => c.slug === category),
    [customCategories, category],
  );

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (category) fd.set("category", category);
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

  const waHref = whatsappOrderUrl(settings.whatsapp, [
    {
      name: `Custom order${selected ? ` · ${selected.name}` : ""}`,
      qty: 1,
      price: 0,
    },
  ]);

  return (
    <>
      <div className="w">
        <div className="crumb">
          <Link href="/">Home</Link> / Custom order
        </div>
        <div className="pgh">
          <h1>{selected?.customOrderTitle || "Your design. Our laser."}</h1>
          <p className="mut">
            {selected?.customOrderBody ||
              "Upload a sketch, logo or name — we'll cut it and get in touch."}
          </p>
        </div>
        {customCategories.length ? (
          <div className="custom-cats">
            {customCategories.map((c) => (
              <Link
                key={c.slug}
                href={`/custom?category=${c.slug}`}
                className={`chip-link${c.slug === category ? " on" : ""}`}
                onClick={(e) => {
                  e.preventDefault();
                  setCategory(c.slug);
                  window.history.replaceState(null, "", `/custom?category=${c.slug}`);
                }}
              >
                {c.name}
              </Link>
            ))}
          </div>
        ) : null}
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
                <span className="chip">Custom order</span>
                <h2 style={{ margin: "10px 0" }}>Start a custom order</h2>
                {customCategories.length ? (
                  <label className="f">
                    Category
                    <select
                      name="category"
                      value={category}
                      onChange={(e) => {
                        setCategory(e.target.value);
                        window.history.replaceState(null, "", `/custom?category=${e.target.value}`);
                      }}
                      required
                    >
                      {customCategories.map((c) => (
                        <option key={c.slug} value={c.slug}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <p className="mut">No categories currently accept custom orders.</p>
                )}
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
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
                  <button className="btn" type="submit" disabled={busy || !customCategories.length}>
                    {busy ? "Uploading…" : "Submit custom request"}
                  </button>
                  <a className="btn wa-btn g" href={waHref} target="_blank" rel="noreferrer">
                    <Icon.WhatsApp /> Order via WhatsApp
                  </a>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
      <Footer categories={categories} settings={settings} />
    </>
  );
}
