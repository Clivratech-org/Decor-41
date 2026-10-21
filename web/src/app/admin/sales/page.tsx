"use client";

import { rupees } from "@/lib/money";
import { useCallback, useEffect, useMemo, useState } from "react";

type OrderRow = {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  items: string;
  total: number;
  paymentMethod: string;
  status: string;
  date: string;
};

const STATUSES = ["Paid", "Pending", "Shipped", "Delivered", "Refunded"] as const;

function revenue(orders: OrderRow[]) {
  return orders
    .filter((o) => o.status !== "Refunded" && o.status !== "Pending")
    .reduce((a, o) => a + o.total, 0);
}

export default function AdminSalesPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [sf, setSf] = useState("All");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/orders");
    if (res.ok) setOrders(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(
    () => (sf === "All" ? orders : orders.filter((o) => o.status === sf)),
    [orders, sf],
  );

  async function setStatus(id: string, status: string) {
    const res = await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    }
  }

  function exportCsv() {
    window.location.href = "/api/admin/orders/export";
  }

  const rev = revenue(orders);
  const avg = Math.round(rev / Math.max(orders.length, 1));

  if (loading) return <h1>Sales</h1>;

  return (
    <>
      <h1>Sales</h1>
      <div className="kp">
        <div className="k">
          <b>{rupees(rev)}</b>
          Collected
        </div>
        <div className="k">
          <b>{rupees(avg)}</b>
          Avg order
        </div>
        <div className="k">
          <b>{orders.filter((o) => o.paymentMethod === "Razorpay" || o.paymentMethod === "UPI" || o.paymentMethod === "Card").length}</b>
          Razorpay orders
        </div>
      </div>
      <div className="tools">
        <select value={sf} onChange={(e) => setSf(e.target.value)} aria-label="Filter by status">
          {["All", ...STATUSES].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button type="button" className="btn g" onClick={exportCsv}>
          Export CSV
        </button>
      </div>
      <div className="bx">
        <table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>
                  {o.customerName}
                  <br />
                  <small style={{ color: "var(--mut)" }}>{o.phone || o.email}</small>
                </td>
                <td>{o.items}</td>
                <td>{rupees(o.total)}</td>
                <td>{o.paymentMethod}</td>
                <td>{o.date}</td>
                <td>
                  <select
                    value={o.status}
                    onChange={(e) => setStatus(o.id, e.target.value)}
                    aria-label={`Status for ${o.id}`}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
