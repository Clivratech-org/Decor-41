"use client";

import { rupees } from "@/lib/money";
import { useEffect, useMemo, useState } from "react";

type OrderRow = {
  id: string;
  total: number;
  status: string;
  date: string;
};

type LeadRow = { status: string; kind?: string };
type ProductRow = { stock: number; visible?: boolean };

function dayKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function shortMoney(amount: number) {
  if (!amount) return "₹0";
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(amount >= 10000 ? 0 : 1)}k`;
  return `₹${amount}`;
}

function revenue(orders: OrderRow[]) {
  return orders
    .filter((o) => o.status !== "Refunded" && o.status !== "Pending")
    .reduce((a, o) => a + o.total, 0);
}

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [couponCount, setCouponCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [oRes, lRes, pRes, cRes] = await Promise.all([
          fetch("/api/admin/orders"),
          fetch("/api/admin/leads"),
          fetch("/api/admin/products"),
          fetch("/api/admin/coupons"),
        ]);
        if (oRes.ok) setOrders(await oRes.json());
        if (lRes.ok) setLeads(await lRes.json());
        if (pRes.ok) {
          const data = (await pRes.json()) as { products: ProductRow[] };
          setProducts(data.products);
        }
        if (cRes.ok) {
          const coupons = (await cRes.json()) as { active?: boolean }[];
          if (Array.isArray(coupons)) setCouponCount(coupons.filter((c) => c.active).length);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const collected = revenue(orders);
  const paid = orders.filter((o) => o.status === "Paid" || o.status === "Shipped" || o.status === "Delivered");
  const avg = paid.length ? Math.round(collected / paid.length) : 0;
  const today = dayKey(new Date());
  const todayTotal = orders.filter((o) => o.date === today && o.status !== "Refunded").reduce((a, o) => a + o.total, 0);

  const bars = useMemo(() => {
    const keys = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return dayKey(date);
    });
    const days = Object.fromEntries(keys.map((key) => [key, 0]));
    const counts = Object.fromEntries(keys.map((key) => [key, 0]));
    orders.forEach((order) => {
      if (order.status === "Refunded" || days[order.date] === undefined) return;
      days[order.date] += order.total;
      counts[order.date] += 1;
    });
    const mx = Math.max(...keys.map((key) => days[key]), 1);
    const weekTotal = keys.reduce((sum, key) => sum + days[key], 0);
    const weekCount = keys.reduce((sum, key) => sum + counts[key], 0);
    return { keys, days, counts, mx, weekTotal, weekCount };
  }, [orders]);

  const statuses = ["Paid", "Pending", "Shipped", "Delivered", "Refunded"] as const;

  if (loading) return <h1>Dashboard</h1>;

  return (
    <>
      <h1>Dashboard</h1>
      <div className="kp">
        <div className="k">
          <b>{rupees(collected)}</b>
          Collected
        </div>
        <div className="k">
          <b>{rupees(todayTotal)}</b>
          Today
        </div>
        <div className="k">
          <b>{rupees(avg)}</b>
          Avg order
        </div>
        <div className="k">
          <b>{orders.length}</b>
          Orders
        </div>
        <div className="k">
          <b>{orders.filter((o) => o.status === "Pending").length}</b>
          Pending
        </div>
        <div className="k">
          <b>{orders.filter((o) => o.status === "Paid").length}</b>
          Ready to ship
        </div>
        <div className="k">
          <b>{leads.filter((l) => l.status === "New").length}</b>
          New leads
        </div>
        <div className="k">
          <b>{leads.filter((l) => l.kind === "custom").length}</b>
          Custom orders
        </div>
        <div className="k">
          <b>{products.filter((p) => p.stock < 10).length}</b>
          Low stock
        </div>
        <div className="k">
          <b>{couponCount}</b>
          Active coupons
        </div>
      </div>
      <div className="bx">
        <div className="page-head">
          <div>
            <h3 style={{ margin: "0 0 4px" }}>Sales by day</h3>
            <p className="hint">
              {rupees(bars.weekTotal)} in order value from {bars.weekCount} order{bars.weekCount === 1 ? "" : "s"} over the last 7 days. Pending orders are included. Refunds are not.
            </p>
          </div>
        </div>
        <div className="chart">
          {bars.keys.map((key) => {
            const amount = bars.days[key];
            const height = amount ? Math.max(8, (amount / bars.mx) * 100) : 0;
            const label = new Date(`${key}T12:00:00`).toLocaleDateString("en-IN", { weekday: "short", day: "numeric" });
            return (
              <div className="bar-col" key={key}>
                <span className="amt">{shortMoney(amount)}</span>
                <div className="track" title={`${label}: ${rupees(amount)} · ${bars.counts[key]} orders`}>
                  <div className="fill" style={{ height: `${height}%` }} />
                </div>
                <span className="lbl">
                  {label}
                  <small>{bars.counts[key]}</small>
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="bx">
        <h3 style={{ marginTop: 0 }}>Orders by status</h3>
        <div className="status-row">
          {statuses.map((status) => (
            <div key={status}>
              <b>{orders.filter((o) => o.status === status).length}</b>
              <span className={`pill ${status}`}>{status}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
