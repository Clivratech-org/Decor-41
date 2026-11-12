"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { ProductArt, laserArtSvg } from "@/lib/art";
import type { ProductCard as P } from "@/lib/products";
import type { ShippingSettings } from "@/lib/settings";
import { useCart } from "@/context/CartContext";

function CollectThumb({
  src,
  artKey,
  color,
  view,
  label,
}: {
  src: string | null;
  artKey: number;
  color: string;
  view: number;
  label: string;
}) {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    if (!src) {
      setOk(false);
      return;
    }
    let alive = true;
    const img = new Image();
    img.onload = () => {
      if (alive) setOk(true);
    };
    img.onerror = () => {
      if (alive) setOk(false);
    };
    img.src = src;
    return () => {
      alive = false;
    };
  }, [src]);
  if (!src || !ok) {
    return <ProductArt artKey={artKey} color={color} view={view} label={label} />;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" />
  );
}

export function HomePage({
  categories,
  products,
  settings,
  coupons,
}: {
  categories: { slug: string; name: string; description: string; imageUrl?: string | null }[];
  products: P[];
  settings: ShippingSettings;
  coupons: { code: string; discountPercent: number }[];
}) {
  const { showToast } = useCart();
  const [lead, setLead] = useState({ name: "", contact: "", interest: "", notes: "" });
  const [sending, setSending] = useState(false);
  const firstShop = categories[0]?.slug || "laser";

  return (
    <>
      <section className="hero-bleed">
        <div className="hero-photo" aria-hidden>
          <span className="hero-slide a" />
          <span className="hero-slide b" />
        </div>
        <div className="hero-veil" aria-hidden />
        <div className="hero-inner">
          <div className="logo lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/decor41-logo-clear.png" alt="Decor41" />
          </div>
          <h1>Style it. Cut it. Drive it.</h1>
          <p className="mut">Laser-cut décor, posters and auto style — made to stand out at home and on the road.</p>
          <div className="hero-cta">
            <Link className="btn" href={`/c/${firstShop}`}>
              Shop now
            </Link>
            <Link className="btn g" href="/custom">
              Custom order
            </Link>
          </div>
        </div>
      </section>

      <div className="w collections">
        <div className="sh">
          <h2>Shop collections</h2>
        </div>
        <div className="collect-grid">
          {categories.map((c) => {
            const sample = products.find((p) => p.categorySlug === c.slug) || products[0];
            const color = sample?.variants[0]?.color || "#8B5E3C";
            const thumb = c.imageUrl || sample?.imageUrl || null;
            return (
              <Link key={c.slug} className="collect" href={`/c/${c.slug}`}>
                <div className="art">
                  <CollectThumb
                    src={thumb}
                    artKey={sample?.artKey ?? 1}
                    color={color}
                    view={c.slug.length % 3 === 0 ? 2 : 0}
                    label={c.name}
                  />
                </div>
                <b>
                  {c.name}
                  {c.description ? <small>{c.description}</small> : null}
                </b>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="strip">
        <div>
          {(
            "★ Free shipping over ₹" +
            settings.freeShippingThreshold +
            " &nbsp; ★ Dispatch in 5–9 working days &nbsp; ★ Secure UPI & card payments &nbsp; ★ 7-day returns &nbsp; "
          ).repeat(6)}
        </div>
      </div>

      <div className="w">
        <div className="sh">
          <h2>Bestsellers</h2>
          <Link href={`/c/${firstShop}`}>View all →</Link>
        </div>
        <div className="g4">
          {products.slice(0, 8).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>

        <h2>Made to order</h2>
        <div className="feat">
          <div className="vis">
            <div className="pat" />
            <span dangerouslySetInnerHTML={{ __html: laserArtSvg() }} />
          </div>
          <div className="tx">
            <span className="chip">Custom laser cutting</span>
            <h2 style={{ margin: "10px 0" }}>Your design. Our laser.</h2>
            <p className="mut">
              Send a sketch, logo or name — we cut it in wood, acrylic or metal and ship it ready to hang.
            </p>
            <ul>
              <li>Upload any sketch, logo or name</li>
              <li>Birch, walnut, acrylic or metal</li>
              <li>Preview approval before cutting</li>
            </ul>
            <Link className="btn" href="/custom">
              Start a custom order
            </Link>
          </div>
        </div>

        <h2>How it works</h2>
        <div className="steps">
          <div>
            <div className="ic">1</div>
            <h3>Pick or upload</h3>
            <p className="mut">Choose a ready design or send your own.</p>
          </div>
          <div>
            <div className="ic">2</div>
            <h3>We craft it</h3>
            <p className="mut">Cut, printed and quality-checked in-house.</p>
          </div>
          <div>
            <div className="ic">3</div>
            <h3>Delivered</h3>
            <p className="mut">Packed safely and tracked to your door.</p>
          </div>
        </div>

        <div className="g4" style={{ marginTop: 70 }}>
          {[
            ["12000", "+", "Orders delivered"],
            ["850", "+", "Designs laser cut"],
            ["7", "", "Product lines"],
            ["4.9", "★", "Average rating"],
          ].map((x) => (
            <div className="k2" key={x[2]}>
              <b>
                <span data-n={x[0]}>0</span>
                {x[1]}
              </b>
              <br />
              {x[2]}
            </div>
          ))}
        </div>

        <h2>Loved by customers</h2>
        <div className="g4">
          {[
            ["Meera S.", "The mandala looks stunning in our living room."],
            ["Arjun K.", "Spoiler fit perfectly, great finish."],
            ["Rahul V.", "Wallpaper was easy to apply and looks premium."],
          ].map((t) => (
            <div className="tm" key={t[0]}>
              <div className="stars">★★★★★</div>
              <p>{t[1]}</p>
              <span className="av">{t[0][0]}</span>
              <b>{t[0]}</b>
            </div>
          ))}
        </div>

        <div className="nl">
          <h2 style={{ margin: "0 0 10px", color: "#FAF6F0" }}>
            {coupons[0] ? `Get ${coupons[0].discountPercent}% off with ${coupons[0].code}` : "Tell us what you need"}
          </h2>
          <p style={{ margin: "0 0 18px" }}>
            {coupons.length
              ? `Use ${coupons.map((c) => c.code).join(", ")} at checkout, or send a request and we will reply.`
              : "Send a request and the Decor 41 team will reply."}
          </p>
          <form
            className="lead-form"
            onSubmit={async (e) => {
              e.preventDefault();
              setSending(true);
              const res = await fetch("/api/leads", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(lead),
              });
              setSending(false);
              if (!res.ok) {
                showToast("Please fill name, contact and what you need");
                return;
              }
              setLead({ name: "", contact: "", interest: "", notes: "" });
              showToast("Request sent. We will contact you.");
            }}
          >
            <input
              placeholder="Your name"
              aria-label="Your name"
              value={lead.name}
              onChange={(e) => setLead({ ...lead, name: e.target.value })}
              required
            />
            <input
              placeholder="Phone or email"
              aria-label="Phone or email"
              value={lead.contact}
              onChange={(e) => setLead({ ...lead, contact: e.target.value })}
              required
            />
            <input
              placeholder="What are you looking for?"
              aria-label="What are you looking for?"
              value={lead.interest}
              onChange={(e) => setLead({ ...lead, interest: e.target.value })}
              required
            />
            <input
              placeholder="Notes (optional)"
              aria-label="Notes"
              value={lead.notes}
              onChange={(e) => setLead({ ...lead, notes: e.target.value })}
            />
            <button className="btn" type="submit" disabled={sending}>
              {sending ? "Sending…" : "Send request"}
            </button>
          </form>
        </div>
      </div>
      <Footer categories={categories} settings={settings} />
    </>
  );
}
