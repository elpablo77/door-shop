import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = {
  doorId: number;
  name: string;
  price: number;
  imageUrl?: string;
  qty: number;
  sizeLabel?: string;
  colorLabel?: string;
  sku?: string;
};

type CartState = {
  items: CartItem[];
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  remove: (doorId: number) => void;
  setQty: (doorId: number, qty: number) => void;
  clear: () => void;
  total: number;
};

const KEY = "doorShop.cart";
const Ctx = createContext<CartState | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem(KEY);
    if (!raw) return;
    try { setItems(JSON.parse(raw)); } catch {}
  }, []);

  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(items)); }, [items]);

  const api = useMemo<CartState>(() => {
    const add: CartState["add"] = (it, qty = 1) => {
      setItems((prev) => {
        const idx = prev.findIndex((p) => p.doorId === it.doorId);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = { ...copy[idx], qty: copy[idx].qty + qty };
          return copy;
        }
        return [...prev, { ...it, qty }];
      });
    };
    const remove = (doorId: number) => setItems((prev) => prev.filter((p) => p.doorId !== doorId));
    const setQty = (doorId: number, qty: number) => setItems((prev) => prev.map((p) => p.doorId === doorId ? { ...p, qty: Math.max(1, Math.min(99, qty)) } : p));
    const clear = () => setItems([]);
    const total = items.reduce((s, it) => s + it.price * it.qty, 0);
    return { items, add, remove, setQty, clear, total };
  }, [items]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useCart() { const v = useContext(Ctx); if (!v) throw new Error("CartProvider missing"); return v; }
