"use client";

import { rupees } from "@/lib/money";
import { useEffect, useMemo, useState } from "react";

type OrderRow = {
  id: string;
  total: number;
  status: string;
  date: string;
};

type LeadRow = { status: string };
type ProductRow = { stock: number };

function revenue(orders: OrderRow[]) {
  return orders
    .filter((o) => o.status !== "Refunded" && o.status !== "Pending")
    .reduce((a, o) => a + o.total, 0);
}

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [oRes, lRes, pRes] = await Promise.all([
          fetch("/api/admin/orders"),
          fetch("/api/admin/leads"),
          fetch("/api/admin/products"),
        ]);
        if (oRes.ok) setOrders(await oRes.json());
        if (lRes.ok) setLeads(await lRes.json());
        if (pRes.ok) {
          const data = (await pRes.json()) as { products: ProductRow[] };
          setProducts(data.products);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const bars = useMemo(() => {
    const days: Record<string, number> = {};
    orders.forEach((o) => {
      days[o.date] = (days[o.date] || 0) + o.total;
    });
    const keys = Object.keys(days).sort().slice(-7);
    const mx = Math.max(...keys.map((x) => days[x]), 1);
    return { keys, days, mx };
  }, [orders]);

  if (loading) return <h1>Dashboard</h1>;

  return (
    <>
      <h1>Dashboard</h1>
      <div className="kp">
        <div className="k">
          <b>{rupees(revenue(orders))}</b>
          Revenue
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
          <b>{leads.filter((l) => l.status === "New").length}</b>
          New leads
        </div>
        <div className="k">
          <b>{products.filter((p) => p.stock < 10).length}</b>
          Low stock
        </div>
      </div>
      <div className="bx">
        <h3>Sales by day</h3>
        <div className="bars" style={{ marginBottom: 24 }}>
          {bars.keys.length === 0 ? (
            <p style={{ color: "var(--mut)", fontSize: 14 }}>No orders yet.</p>
          ) : (
            bars.keys.map((x) => (
              <div key={x} style={{ height: `${(bars.days[x] / bars.mx) * 100}%` }}>
                <span>{x.slice(5)}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
