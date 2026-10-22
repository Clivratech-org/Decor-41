"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { ProductArt, laserArtSvg, productArtSvg } from "@/lib/art";
import { rupees } from "@/lib/money";
import type { ProductCard as P } from "@/lib/products";
import type { ShippingSettings } from "@/lib/settings";
import { useCart } from "@/context/CartContext";

const HERO_SLIDES = [
  { id: 1, v: 0, view: 0 },
  { id: 3, v: 0, view: 2 },
  { id: 5, v: 1, view: 1 },
  { id: 6, v: 1, view: 2 },
  { id: 9, v: 2, view: 0 },
  { id: 7, v: 1, view: 1 },
];

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
  const [hi, setHi] = useState(0);
  const [lead, setLead] = useState({ name: "", contact: "", interest: "", notes: "" });
  const [sending, setSending] = useState(false);
  const byId = Object.fromEntries(products.map((p) => [p.id, p]));
  const autoCat = products.filter((p) => ["spoiler", "stand", "car"].includes(p.categorySlug));

  useEffect(() => {
    const t = setInterval(() => setHi((h) => (h + 1) % HERO_SLIDES.length), 4000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const selector = ".cat,.card,.steps>div,.tm,.feat,.nl,.k2,h2,.sh,.panel,.fgrid li,.strip";
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add("in");
          const n = e.target.querySelector("[data-n]") as HTMLElement | null;
          if (n && !n.dataset.counted) {
            n.dataset.counted = "1";
            countUp(n);
          }
          io.unobserve(e.target);
        }),
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" },
    );

    document.querySelectorAll(selector).forEach((el, i) => {
      const node = el as HTMLElement;
      if (!node.classList.contains("in")) {
        node.classList.add("rv");
        node.style.animationDelay = `${(i % 4) * 80}ms`;
        io.observe(node);
      }
    });

    // Reveal anything already in view (Strict Mode remount / fast scroll)
    requestAnimationFrame(() => {
      document.querySelectorAll(`${selector}.rv:not(.in)`).forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          el.classList.add("in");
          const n = el.querySelector("[data-n]") as HTMLElement | null;
          if (n && !n.dataset.counted) {
            n.dataset.counted = "1";
            countUp(n);
          }
          io.unobserve(el);
        }
      });
    });

    return () => io.disconnect();
  }, [products]);

  return (
    <>
      <div className="w">
        <section className="hero">
          <div>
            <span className="chip">New season · Laser cut · Auto style</span>
            <h1>
              Décor that <span>cuts</span> through.
            </h1>
            <p className="mut" style={{ fontSize: 18, maxWidth: 480 }}>
              Laser-cut art, posters, wallpapers, faux greens and car accessories — made to stand out on your wall,
              desk and driveway.
            </p>
            <div className="hero-cta">
              <Link className="btn" href="/c/laser">
                Shop now
              </Link>
              <Link className="btn g" href="/c/spoiler">
                Auto zone
              </Link>
            </div>
            <div className="mini">
              <div>
                <b>2,000+</b>happy customers
              </div>
              <div>
                <b>3–5 days</b>custom cut time
              </div>
              <div>
                <b>7 days</b>easy returns
              </div>
            </div>
          </div>
          <div className="hv">
            <div
              className="hbox"
              onMouseEnter={() => {}}
            >
              <div className="pat" />
              <div className="ring" />
              <div className="frame">
                {HERO_SLIDES.map((x, k) => {
                  const p = byId[x.id];
                  if (!p) return null;
                  const v = p.variants[x.v] || p.variants[0];
                  return (
                    <Link key={k} className={`sl ${k === hi ? "on" : ""}`} href={`/p/${p.slug}`}>
                      <span
                        dangerouslySetInnerHTML={{
                          __html: productArtSvg(p.artKey, v.color, x.v, x.view, p.name),
                        }}
                      />
                      <div className="cp">
                        <div>
                          <small className="mut">{p.categoryName}</small>
                          <br />
                          <b>{p.name}</b>
                        </div>
                        <span className="pr">{rupees(v.price)}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
              <div className="dots">
                {HERO_SLIDES.map((_, k) => (
                  <button
                    key={k}
                    className={k === hi ? "on" : ""}
                    aria-label={`Show slide ${k + 1}`}
                    onClick={() => setHi(k)}
                    type="button"
                  />
                ))}
              </div>
            </div>
            <div className="fl" style={{ top: "6%", left: "-4%" }}>
              ⭐ 4.9 · 2,000+ reviews
            </div>
            <div className="fl" style={{ top: "44%", right: "-4%", animationDelay: "-1.5s" }}>
              🔒 Secure UPI checkout
            </div>
            <div className="fl" style={{ bottom: "6%", left: "4%", animationDelay: "-3s" }}>
              🚚 Free shipping ₹{settings.freeShippingThreshold}+
            </div>
          </div>
        </section>
      </div>

      <div className="strip">
        <div>
          {("★ Free shipping over ₹" + settings.freeShippingThreshold + " &nbsp; ★ Custom laser cutting &nbsp; ★ Secure UPI & card payments &nbsp; ★ 7-day returns &nbsp; ").repeat(6)}
        </div>
      </div>

      <div className="w">
        <div className="sh">
          <h2>Shop by category</h2>
        </div>
        <div className="g4">
          {categories.map((c) => {
            const sample =
              products.find((p) => p.categorySlug === c.slug) || products[0];
            const color = sample?.variants[0]?.color || "#c6ff3d";
            return (
              <Link key={c.slug} className="cat" href={`/c/${c.slug}`}>
                <div className="art">
                  {c.imageUrl ? (
                    <img src={c.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    sample && (
                      <ProductArt
                        artKey={sample.artKey}
                        color={color}
                        view={c.slug.length % 3 === 0 ? 2 : 0}
                        label={c.name}
                      />
                    )
                  )}
                </div>
                <span>
                  {c.name}
                  <small>{c.description}</small>
                </span>
              </Link>
            );
          })}
        </div>

        <div className="sh">
          <h2>Bestsellers</h2>
          <Link href="/c/laser">View all →</Link>
        </div>
        <div className="g4">
          {products.slice(0, 8).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>

        <h2>Made to order</h2>
        <div className="feat">
          <div className="vis">
            <div className="pat" style={{ opacity: 0.14 }} />
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

        <div className="sh">
          <h2>Fresh for your ride</h2>
          <Link href="/c/spoiler">Auto zone →</Link>
        </div>
        <div className="g4">
          {autoCat.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>

        <h2>How it works</h2>
        <div className="steps">
          <div>
            <div className="ic">✏️</div>
            <h3>Pick or upload</h3>
            <p className="mut">Choose a ready design or send your own.</p>
          </div>
          <div>
            <div className="ic">⚡</div>
            <h3>We craft it</h3>
            <p className="mut">Cut, printed and quality-checked in-house.</p>
          </div>
          <div>
            <div className="ic">📦</div>
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
          <h2 style={{ margin: "0 0 10px" }}>
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
            <button className="btn" style={{ background: "#0b0f1a", color: "#fff" }} type="submit" disabled={sending}>
              {sending ? "Sending…" : "Send request"}
            </button>
          </form>
        </div>
      </div>
      <Footer categories={categories} settings={settings} />
    </>
  );
}

function countUp(n: HTMLElement) {
  const T = +n.dataset.n!;
  const d = n.dataset.n!.includes(".") ? 1 : 0;
  const t0 = performance.now();
  (function f(t: number) {
    const p = Math.min((t - t0) / 1500, 1);
    n.textContent = (T * (1 - Math.pow(1 - p, 3)))
      .toFixed(d)
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    if (p < 1) requestAnimationFrame(f);
  })(t0);
}
