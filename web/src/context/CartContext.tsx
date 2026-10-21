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
  shipMethod: "std" | "exp";
  addItem: (item: Omit<CartLine, "key" | "qty"> & { qty?: number }) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  setCoupon: (code: string | null) => void;
  setShipMethod: (m: "std" | "exp") => void;
  count: number;
  subtotal: number;
  toast: string | null;
  showToast: (msg: string) => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE = "d41cart";

function load(): { cart: CartLine[]; coupon: string | null; shipMethod: "std" | "exp" } {
  if (typeof window === "undefined") return { cart: [], coupon: null, shipMethod: "std" };
  try {
    const raw = localStorage.getItem(STORAGE);
    if (!raw) return { cart: [], coupon: null, shipMethod: "std" };
    return JSON.parse(raw);
  } catch {
    return { cart: [], coupon: null, shipMethod: "std" };
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [coupon, setCouponState] = useState<string | null>(null);
  const [shipMethod, setShipMethodState] = useState<"std" | "exp">("std");
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const data = load();
    setCart(data.cart || []);
    setCouponState(data.coupon || null);
    setShipMethodState(data.shipMethod || "std");
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE, JSON.stringify({ cart, coupon, shipMethod }));
  }, [cart, coupon, shipMethod, hydrated]);

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
      shipMethod,
      addItem,
      setQty: (key, qty) =>
        setCart((prev) => prev.map((c) => (c.key === key ? { ...c, qty: Math.max(1, Math.min(9, qty)) } : c))),
      remove: (key) => setCart((prev) => prev.filter((c) => c.key !== key)),
      clear: () => {
        setCart([]);
        setCouponState(null);
        setShipMethodState("std");
      },
      setCoupon: setCouponState,
      setShipMethod: setShipMethodState,
      count: cart.reduce((a, c) => a + c.qty, 0),
      subtotal: cart.reduce((a, c) => a + c.qty * c.price, 0),
      toast,
      showToast,
    };
  }, [cart, coupon, shipMethod, toast]);

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
