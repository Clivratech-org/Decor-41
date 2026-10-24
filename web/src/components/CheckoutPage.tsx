"use client";

import Link from "next/link";
import Script from "next/script";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Footer } from "@/components/Footer";
import { ProductArt } from "@/lib/art";
import { rupees } from "@/lib/money";
import type { ShippingSettings } from "@/lib/settings";
import { useCart } from "@/context/CartContext";

declare global {
  interface Window {
    Razorpay?: new (opts: Record<string, unknown>) => { open: () => void };
  }
}

const STATES = ["Tamil Nadu", "Kerala", "Karnataka", "Andhra Pradesh", "Telangana", "Maharashtra", "Delhi", "Other"];

export function CheckoutPageClient({
  settings,
  categories,
  razorpayKey,
}: {
  settings: ShippingSettings;
  categories: { slug: string; name: string }[];
  razorpayKey: string;
}) {
  const router = useRouter();
  const { cart, subtotal, coupon, couponPercent, setCoupon, shipMethod, setShipMethod, clear, showToast } = useCart();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<Record<string, boolean>>({});

  const discount = coupon ? Math.round((subtotal * couponPercent) / 100) : 0;
  const ship =
    shipMethod === "exp"
      ? settings.shippingExpressFee
      : subtotal >= settings.freeShippingThreshold
        ? 0
        : settings.shippingStandardFee;
  const total = subtotal - discount + ship;

  useEffect(() => {
    if (!cart.length) router.replace("/cart");
  }, [cart.length, router]);

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

  function val(id: string) {
    return (document.getElementById(id) as HTMLInputElement | null)?.value.trim() || "";
  }

  async function place() {
    const rules: Record<string, boolean> = {
      n: val("n").length > 1,
      ph: /^\d{10}$/.test(val("ph").replace(/\s/g, "")),
      em: /^\S+@\S+\.\S+$/.test(val("em")),
      ad: val("ad").length > 4,
      ct: val("ct").length > 1,
      pn: /^\d{6}$/.test(val("pn")),
    };
    setErr(Object.fromEntries(Object.entries(rules).map(([k, ok]) => [k, !ok])));
    if (Object.values(rules).some((ok) => !ok)) {
      showToast("Please fix the highlighted fields");
      return;
    }
    if (!razorpayKey) {
      showToast("Razorpay keys not configured — using demo mode");
    }

    setBusy(true);
    try {
      const payload = {
        customerName: val("n"),
        email: val("em"),
        phone: val("ph").replace(/\s/g, ""),
        address: val("ad"),
        city: val("ct"),
        pin: val("pn"),
        state: val("st") || "Tamil Nadu",
        shippingMethod: shipMethod,
        couponCode: coupon,
        paymentMethod: "Razorpay",
        items: cart.map((c) => ({
          productId: c.productId,
          name: c.name,
          variantId: c.variantId,
          variant: c.variantName,
          size: c.size,
          unitPrice: c.price,
          quantity: c.qty,
        })),
      };

      const res = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");

      if (data.demoMode) {
        clear();
        router.push(`/done/${data.orderId}`);
        return;
      }

      if (!window.Razorpay) throw new Error("Razorpay SDK not loaded");

      const rzp = new window.Razorpay({
        key: razorpayKey,
        amount: data.amount,
        currency: "INR",
        name: "Decor 41",
        description: `Order ${data.orderId}`,
        order_id: data.razorpayOrderId,
        prefill: { name: payload.customerName, email: payload.email, contact: payload.phone },
        theme: { color: "#c6ff3d" },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          const verify = await fetch("/api/checkout/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: data.orderId,
              ...response,
            }),
          });
          const verified = await verify.json();
          if (!verify.ok) {
            showToast(verified.error || "Payment verification failed");
            setBusy(false);
            return;
          }
          clear();
          router.push(`/done/${data.orderId}`);
        },
        modal: {
          ondismiss: () => setBusy(false),
        },
      });
      rzp.open();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Checkout failed");
      setBusy(false);
    }
  }

  if (!cart.length) return null;

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="w">
        <div className="pgh">
          <div className="crumb" style={{ padding: 0 }}>
            <Link href="/cart">← Back to cart</Link>
          </div>
          <h1>Checkout</h1>
          <div className="stp">
            <div className="s dn">
              <i>✓</i>Cart
            </div>
            <span className="ln" />
            <div className="s on">
              <i>2</i>Details & payment
            </div>
            <span className="ln" />
            <div className="s">
              <i>3</i>Confirmation
            </div>
          </div>
        </div>
        <div className="cl ck">
          <div id="ckf">
            <div className="panel">
              <h3>
                <i>1</i>Contact
              </h3>
              <div className="two">
                <div data-f="n" className={err.n ? "err" : ""}>
                  <label className="f">
                    Full name
                    <input id="n" autoComplete="name" placeholder="Priya Sharma" />
                  </label>
                  <span className="em">Enter your full name</span>
                </div>
                <div data-f="ph" className={err.ph ? "err" : ""}>
                  <label className="f">
                    Mobile number
                    <input id="ph" inputMode="numeric" autoComplete="tel" placeholder="98765 43210" />
                  </label>
                  <span className="em">Enter a 10-digit mobile number</span>
                </div>
              </div>
              <div data-f="em" className={err.em ? "err" : ""}>
                <label className="f">
                  Email
                  <input id="em" type="email" autoComplete="email" placeholder="you@example.com" />
                </label>
                <span className="em">Enter a valid email address</span>
              </div>
            </div>

            <div className="panel">
              <h3>
                <i>2</i>Delivery address
              </h3>
              <div data-f="ad" className={err.ad ? "err" : ""}>
                <label className="f">
                  Address
                  <input id="ad" autoComplete="street-address" placeholder="House no., street, area" />
                </label>
                <span className="em">Enter your delivery address</span>
              </div>
              <div className="two">
                <div data-f="ct" className={err.ct ? "err" : ""}>
                  <label className="f">
                    City
                    <input id="ct" autoComplete="address-level2" placeholder="Coimbatore" />
                  </label>
                  <span className="em">Enter your city</span>
                </div>
                <div data-f="pn" className={err.pn ? "err" : ""}>
                  <label className="f">
                    PIN code
                    <input id="pn" inputMode="numeric" maxLength={6} autoComplete="postal-code" placeholder="641001" />
                  </label>
                  <span className="em">Enter a 6-digit PIN code</span>
                </div>
              </div>
              <label className="f">
                State
                <select id="st">
                  {STATES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="panel">
              <h3>
                <i>3</i>Delivery speed
              </h3>
              <label className={`opt ${shipMethod === "std" ? "on" : ""}`} onClick={() => setShipMethod("std")}>
                <input type="radio" name="sh" checked={shipMethod === "std"} readOnly />
                <div>
                  <b>Standard</b>
                  <br />
                  <small className="mut">{settings.shippingStandardDays}</small>
                </div>
                <span className="r">
                  {subtotal >= settings.freeShippingThreshold ? "Free" : rupees(settings.shippingStandardFee)}
                </span>
              </label>
              <label className={`opt ${shipMethod === "exp" ? "on" : ""}`} onClick={() => setShipMethod("exp")}>
                <input type="radio" name="sh" checked={shipMethod === "exp"} readOnly />
                <div>
                  <b>Express</b>
                  <br />
                  <small className="mut">{settings.shippingExpressDays}</small>
                </div>
                <span className="r">{rupees(settings.shippingExpressFee)}</span>
              </label>
            </div>

            <div className="panel">
              <h3>
                <i>4</i>Payment
              </h3>
              <p className="mut" style={{ fontSize: 13 }}>
                Razorpay will ask for UPI, card or another method.
              </p>
              <button className="btn full" style={{ marginTop: 14, padding: 16 }} onClick={place} disabled={busy} type="button">
                {busy ? "Processing…" : `Pay ${rupees(total)} securely`}
              </button>
            </div>
          </div>

          <div className="panel sticky">
            <h3 style={{ margin: "0 0 12px", fontSize: 20 }}>Order summary</h3>
            {cart.map((c) => (
              <div className="mi" key={c.key}>
                <div className="th">
                  <ProductArt artKey={c.artKey} color={c.color} variantIndex={c.variantIndex} label={c.name} />
                  <em>{c.qty}</em>
                </div>
                <div>
                  <b>{c.name}</b>
                  <br />
                  <small className="mut">
                    {c.variantName} · {c.size}
                  </small>
                </div>
                <b>{rupees(c.qty * c.price)}</b>
              </div>
            ))}
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
            <div className="sec">
              <span>🔒 Secure</span>
              <span>↩️ 7-day returns</span>
              <span>🚚 Tracked delivery</span>
            </div>
          </div>
        </div>
      </div>
      <Footer categories={categories} settings={settings} />
    </>
  );
}
