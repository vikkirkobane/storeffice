"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";

interface CartItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const GUEST_CART_KEY = "storeffice_cart_guest";
const USER_CART_SYNCED = "storeffice_cart_synced";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load initial cart: try DB if logged in, else localStorage
  useEffect(() => {
    const loadCart = async () => {
      try {
        const res = await fetch("/api/cart", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setItems(data.items);
          sessionStorage.setItem(USER_CART_SYNCED, "true");
        } else {
          // Not logged in, use localStorage
          const stored = localStorage.getItem(GUEST_CART_KEY);
          setItems(stored ? JSON.parse(stored) : []);
        }
      } catch (e) {
        // Fallback to localStorage
        const stored = localStorage.getItem(GUEST_CART_KEY);
        setItems(stored ? JSON.parse(stored) : []);
      } finally {
        setLoading(false);
      }
    };
    loadCart();
  }, []);

  // Persist to localStorage (guest) whenever items change (if not synced with user)
  useEffect(() => {
    if (loading) return;
    const isUserSynced = sessionStorage.getItem(USER_CART_SYNCED) === "true";
    if (!isUserSynced) {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
    }
  }, [items, loading]);

  // Helper: sync single item to DB (for logged-in users)
  const syncItemToDB = async (item: CartItem) => {
    try {
      await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId: item.productId, quantity: item.quantity }),
      });
    } catch (e) {
      console.error("Failed to sync cart item", e);
    }
  };

  const addItem = (item: Omit<CartItem, "quantity">) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === item.productId);
      let newItems;
      if (existing) {
        newItems = prev.map((i) =>
          i.productId === item.productId ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        newItems = [...prev, { ...item, quantity: 1 }];
      }
      // If user cart is synced, update DB for this item
      if (sessionStorage.getItem(USER_CART_SYNCED) === "true") {
        const updatedItem = newItems.find(i => i.productId === item.productId);
        if (updatedItem) syncItemToDB(updatedItem);
      }
      return newItems;
    });
  };

  const removeItem = (productId: string) => {
    setItems((prev) => {
      const newItems = prev.filter((i) => i.productId !== productId);
      if (sessionStorage.getItem(USER_CART_SYNCED) === "true") {
        fetch(`/api/cart/${productId}`, { method: "DELETE", credentials: "include" }).catch(console.error);
      }
      return newItems;
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) => {
      const newItems = prev.map((i) => (i.productId === productId ? { ...i, quantity } : i));
      if (sessionStorage.getItem(USER_CART_SYNCED) === "true") {
        fetch(`/api/cart/${productId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ quantity }),
        }).catch(console.error);
      }
      return newItems;
    });
  };

  const clearCart = () => {
    setItems([]);
    if (sessionStorage.getItem(USER_CART_SYNCED) === "true") {
      fetch("/api/cart", { method: "DELETE", credentials: "include" }).catch(console.error);
    } else {
      localStorage.removeItem(GUEST_CART_KEY);
    }
  };

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total, loading }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
}

