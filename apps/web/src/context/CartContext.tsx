'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CartItem {
  id: string;
  name: string;
  imageIcon: string;
  price: number;
  unit: string;
  sellerName: string;
  quantity: number;
}

const STORAGE_KEY = 'griffy_cart';

function persist(items: CartItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* storage unavailable (private mode, quota, etc.) — cart just won't persist */
  }
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (id: string) => void;
  setQty: (id: string, quantity: number) => void;
  qtyOf: (id: string) => number;
  clearCart: () => void;
  total: number;
  count: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Server and first client render both start from an empty cart (avoids an
  // SSR/client hydration mismatch); pick up any stored cart right after mount.
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setItems(JSON.parse(stored));
    } catch {
      /* ignore malformed cart in storage */
    }
  }, []);

  function addItem(item: Omit<CartItem, 'quantity'>, quantity = 1) {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      const next = existing
        ? prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i))
        : [...prev, { ...item, quantity }];
      persist(next);
      return next;
    });
  }

  function removeItem(id: string) {
    setItems((prev) => {
      const next = prev.filter((i) => i.id !== id);
      persist(next);
      return next;
    });
  }

  function setQty(id: string, quantity: number) {
    setItems((prev) => {
      const next = quantity <= 0
        ? prev.filter((i) => i.id !== id)
        : prev.map((i) => (i.id === id ? { ...i, quantity } : i));
      persist(next);
      return next;
    });
  }

  function clearCart() {
    setItems([]);
    persist([]);
  }

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const count = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        setQty,
        qtyOf: (id) => items.find((i) => i.id === id)?.quantity ?? 0,
        clearCart,
        total,
        count,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
