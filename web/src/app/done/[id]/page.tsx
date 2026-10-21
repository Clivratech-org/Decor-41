import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { rupees } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { getCategories } from "@/lib/products";
import { getSettings } from "@/lib/settings";
import { Confetti } from "@/components/Confetti";

export const metadata = { title: "Order confirmed" };

export default async function DonePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [order, cats, settings] = await Promise.all([
    prisma.order.findUnique({ where: { id }, include: { items: true } }),
    getCategories(),
    getSettings(),
  ]);
  if (!order) notFound();

  return (
    <>
      <Confetti />
      <div className="w">
        <div className="done">
          <svg className="ck-ring" viewBox="0 0 110 110">
            <circle cx="55" cy="55" r="48" />
            <path d="M34 57l14 14 28-30" />
          </svg>
          <span className="chip">
            {order.paymentStatus === "Paid" ? "Payment received" : "Order confirmed"}
          </span>
          <h1 style={{ fontSize: 44 }}>Thank you, {order.customerName.split(" ")[0]}!</h1>
          <p className="mut">
            Order <b style={{ color: "var(--ink)" }}>{order.id}</b> · {rupees(order.total)} via{" "}
            {order.paymentMethod}. A confirmation will be sent to {order.email}.
          </p>
          <div className="tl">
            <div className="on">
              <i>✓</i>Confirmed
            </div>
            <div>
              <i>2</i>Crafting
            </div>
            <div>
              <i>3</i>Shipped
            </div>
            <div>
              <i>4</i>Delivered
            </div>
          </div>
          <div className="panel" style={{ textAlign: "left" }}>
            <h3 style={{ margin: "0 0 10px" }}>Your items</h3>
            {order.items.map((c) => (
              <div className="mi" key={c.id}>
                <div className="th" style={{ background: "var(--p2)", display: "grid", placeItems: "center" }}>
                  <em>{c.quantity}</em>
                </div>
                <div>
                  <b>{c.name}</b>
                  <br />
                  <small className="mut">
                    {c.variant} · {c.size}
                  </small>
                </div>
                <b>{rupees(c.lineTotal)}</b>
              </div>
            ))}
            <div className="tr">
              <span>Delivering to</span>
              <span style={{ textAlign: "right", maxWidth: "60%" }}>
                {order.address}, {order.city} {order.pin}
              </span>
            </div>
          </div>
          <Link className="btn" style={{ marginTop: 22 }} href="/">
            Continue shopping
          </Link>
        </div>
      </div>
      <Footer categories={cats} settings={settings} />
    </>
  );
}
