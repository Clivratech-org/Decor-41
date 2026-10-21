"use client";

import { createContext, useContext, useEffect, useMemo, useState, useSyncExternalStore } from "react";

export type CartLine = {
  key: string;
  productId: number;
  slug: string;
  name: string;
  categorySlug: string;
  categoryName: string;
  artKey: number;
  variantIndex: number;
  variantName: string;
  color: string;
  size: string;
  price: number;
  qty: number;
};

type CartContextValue = {
  cart: CartLine[];
  coupon: string | null;
  couponPercent: number;
  shipMethod: "std" | "exp";
  addItem: (item: Omit<CartLine, "key" | "qty"> & { qty?: number }) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  setCoupon: (code: string | null, percent?: number) => void;
  setShipMethod: (m: "std" | "exp") => void;
  count: number;
  subtotal: number;
  toast: string | null;
  showToast: (msg: string) => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE = "d41cart";

function load(): { cart: CartLine[]; coupon: string | null; couponPercent: number; shipMethod: "std" | "exp" } {
  if (typeof window === "undefined") return { cart: [], coupon: null, couponPercent: 0, shipMethod: "std" };
  try {
    const raw = localStorage.getItem(STORAGE);
    if (!raw) return { cart: [], coupon: null, couponPercent: 0, shipMethod: "std" };
    return JSON.parse(raw);
  } catch {
    return { cart: [], coupon: null, couponPercent: 0, shipMethod: "std" };
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [coupon, setCouponState] = useState<string | null>(null);
  const [couponPercent, setCouponPercent] = useState(0);
  const [shipMethod, setShipMethodState] = useState<"std" | "exp">("std");
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const data = load();
    setCart(data.cart || []);
    setCouponState(data.coupon || null);
    setCouponPercent(data.couponPercent || 0);
    setShipMethodState(data.shipMethod || "std");
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE, JSON.stringify({ cart, coupon, couponPercent, shipMethod }));
  }, [cart, coupon, couponPercent, shipMethod, hydrated]);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2000);
  };

  const value = useMemo<CartContextValue>(() => {
    const addItem: CartContextValue["addItem"] = (item) => {
      const key = `${item.productId}-${item.variantIndex}-${item.size}`;
      const qty = item.qty ?? 1;
      setCart((prev) => {
        const existing = prev.find((c) => c.key === key);
        if (existing) {
          return prev.map((c) => (c.key === key ? { ...c, qty: Math.min(9, c.qty + qty) } : c));
        }
        return [...prev, { ...item, key, qty }];
      });
    };
    return {
      cart,
      coupon,
      couponPercent,
      shipMethod,
      addItem,
      setQty: (key, qty) =>
        setCart((prev) => prev.map((c) => (c.key === key ? { ...c, qty: Math.max(1, Math.min(9, qty)) } : c))),
      remove: (key) => setCart((prev) => prev.filter((c) => c.key !== key)),
      clear: () => {
        setCart([]);
        setCouponState(null);
        setCouponPercent(0);
        setShipMethodState("std");
      },
      setCoupon: (code, percent = 0) => {
        setCouponState(code);
        setCouponPercent(code ? percent : 0);
      },
      setShipMethod: setShipMethodState,
      count: cart.reduce((a, c) => a + c.qty, 0),
      subtotal: cart.reduce((a, c) => a + c.qty * c.price, 0),
      toast,
      showToast,
    };
  }, [cart, coupon, couponPercent, shipMethod, toast]);

  return (
    <CartContext.Provider value={value}>
      {children}
      <div id="ts" className={toast ? "show" : ""} role="status">
        {toast}
      </div>
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export function useMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}
