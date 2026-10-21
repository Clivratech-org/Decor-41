"use client";

import Link from "next/link";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { ProductArt } from "@/lib/art";
import { rupees } from "@/lib/money";
import type { ProductCard as P } from "@/lib/products";
import type { ShippingSettings } from "@/lib/settings";
import { useCart } from "@/context/CartContext";

export function CartPageClient({
  products,
  categories,
  settings,
}: {
  products: P[];
  categories: { slug: string; name: string }[];
  settings: ShippingSettings;
}) {
  const { cart, count, subtotal, coupon, couponPercent, setCoupon, setQty, remove, showToast, shipMethod } = useCart();
  const discount = coupon ? Math.round((subtotal * couponPercent) / 100) : 0;
  const ship =
    !cart.length
      ? 0
      : shipMethod === "exp"
        ? settings.shippingExpressFee
        : subtotal >= settings.freeShippingThreshold
          ? 0
          : settings.shippingStandardFee;
  const total = subtotal - discount + ship;
  const left = Math.max(0, settings.freeShippingThreshold - subtotal);

  async function applyCoupon() {
    const el = document.getElementById("cpn") as HTMLInputElement | null;
    const v = el?.value.trim().toUpperCase() || "";
    if (!v) {
      setCoupon(null);
      return;
    }
    const res = await fetch("/api/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: v }),
    });
    const data = await res.json();
    if (!res.ok) {
      setCoupon(null);
      showToast(data.error || "Invalid coupon");
      return;
    }
    setCoupon(data.code, data.discountPercent);
    showToast(`${data.discountPercent}% off applied`);
  }

  if (!cart.length) {
    return (
      <>
        <div className="w empty" style={{ paddingTop: 90 }}>
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="56" style={{ fill: "var(--p)", stroke: "var(--ln)" }} />
            <path
              d="M30 44h12l9 36h38l8-26H48"
              fill="none"
              style={{ stroke: "var(--at)" }}
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="56" cy="92" r="5" fill="#3dd6ff" />
            <circle cx="84" cy="92" r="5" fill="#3dd6ff" />
          </svg>
          <h1 style={{ fontSize: 38 }}>Your cart is empty</h1>
          <p className="mut">Add a laser-cut piece, poster or car accessory to get started.</p>
          <Link className="btn" href="/">
            Start shopping
          </Link>
        </div>
        <Footer categories={categories} settings={settings} />
      </>
    );
  }

  return (
    <>
      <div className="w">
        <div className="pgh">
          <div className="crumb" style={{ padding: 0 }}>
            <Link href="/">Home</Link> / Cart
          </div>
          <h1>
            Your cart{" "}
            <span className="mut" style={{ fontSize: ".4em", letterSpacing: 0, fontWeight: 500 }}>
              {count} item{count > 1 ? "s" : ""}
            </span>
          </h1>
          <div className="stp">
            <div className="s on">
              <i>1</i>Cart
            </div>
            <span className="ln" />
            <div className="s">
              <i>2</i>Details & payment
            </div>
            <span className="ln" />
            <div className="s">
              <i>3</i>Confirmation
            </div>
          </div>
        </div>
        <div className="cl">
          <div className="panel">
            {cart.map((c) => (
              <div className="ci" key={c.key}>
                <Link className="th" href={`/p/${c.slug}`}>
                  <ProductArt artKey={c.artKey} color={c.color} variantIndex={c.variantIndex} label={c.name} />
                </Link>
                <div>
                  <small className="mut">{c.categoryName}</small>
                  <h3>{c.name}</h3>
                  <div className="mut" style={{ fontSize: 14 }}>
                    <span className="dot" style={{ display: "inline-block", verticalAlign: "-3px", background: c.color }} />{" "}
                    {c.variantName} · {c.size}
                  </div>
                  <button className="rm" onClick={() => remove(c.key)} type="button">
                    🗑 Remove
                  </button>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="qty">
                    <button aria-label="Less" onClick={() => setQty(c.key, c.qty - 1)} type="button">
                      −
                    </button>
                    <span>{c.qty}</span>
                    <button aria-label="More" onClick={() => setQty(c.key, c.qty + 1)} type="button">
                      +
                    </button>
                  </div>
                  <div className="pr" style={{ fontSize: 20, marginTop: 10 }}>
                    {rupees(c.qty * c.price)}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="panel sticky">
            <h3 style={{ margin: "0 0 12px", fontSize: 20 }}>Order summary</h3>
            {shipMethod === "std" && (
              <>
                <div style={{ fontSize: 13, margin: "10px 0 0" }} className="mut">
                  {left ? (
                    <>
                      Add <b style={{ color: "var(--at)" }}>{rupees(left)}</b> more for free shipping
                    </>
                  ) : (
                    "🎉 You’ve unlocked free shipping"
                  )}
                </div>
                <div className="bar">
                  <i style={{ width: `${Math.min(100, (subtotal / settings.freeShippingThreshold) * 100)}%` }} />
                </div>
              </>
            )}
            <div className="cp">
              <input id="cpn" placeholder="Coupon code" defaultValue={coupon || ""} aria-label="Coupon code" />
              <button className="btn g sm" onClick={applyCoupon} type="button">
                Apply
              </button>
            </div>
            <div className="tr">
              <span>Subtotal</span>
              <span>{rupees(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="tr">
                <span>Discount ({coupon})</span>
                <span className="ok">−{rupees(discount)}</span>
              </div>
            )}
            <div className="tr">
              <span>Shipping</span>
              <span className={ship ? "" : "ok"}>{ship ? rupees(ship) : "Free"}</span>
            </div>
            <div className="tr t">
              <span>Total</span>
              <span>{rupees(total)}</span>
            </div>
            <Link className="btn full" style={{ marginTop: 14 }} href="/checkout">
              Proceed to checkout →
            </Link>
            <Link className="btn g full" style={{ marginTop: 10 }} href="/">
              Continue shopping
            </Link>
            <div className="sec">
              <span>🔒 Secure</span>
              <span>↩️ 7-day returns</span>
              <span>🚚 Tracked delivery</span>
            </div>
          </div>
        </div>
        <div className="sh">
          <h2>Complete the look</h2>
        </div>
        <div className="g4">
          {products
            .filter((x) => !cart.some((c) => c.productId === x.id))
            .slice(0, 4)
            .map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
        </div>
      </div>
      <Footer categories={categories} settings={settings} />
    </>
  );
}
