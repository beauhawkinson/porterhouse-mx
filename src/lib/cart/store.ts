import { create } from "zustand";
import { persist } from "zustand/middleware";

import { app } from "../config/app.config";

export type CartItem = {
  variantId: string | null;
  productId: string;
  slug: string;
  name: string;
  size: string | null;
  priceCents: number;
  imageUrl: string;
  quantity: number;
  stock: number;
};

export const cartKey = (item: Pick<CartItem, "variantId" | "productId">): string =>
  item.variantId ?? item.productId;

type CartStore = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  clearCart: () => void;
  totalCents: () => number;
  totalItems: () => number;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const key = cartKey(item);
        set((state) => {
          const existing = state.items.find((i) => cartKey(i) === key);
          if (existing) {
            // Cap at the freshest stock value (could have changed since last
            // addItem) and refresh the stored stock so future increments use
            // the latest known limit.
            const nextQty = Math.min(existing.quantity + 1, item.stock);
            return {
              items: state.items.map((i) =>
                cartKey(i) === key ? { ...i, quantity: nextQty, stock: item.stock } : i,
              ),
            };
          }
          // New line: clamp the initial quantity to stock just in case.
          const initial = item.stock > 0 ? 1 : 0;
          if (initial === 0) return state; // don't add a 0-qty line
          return { items: [...state.items, { ...item, quantity: initial }] };
        });
      },

      removeItem: (key) => {
        set((state) => ({
          items: state.items.filter((i) => cartKey(i) !== key),
        }));
      },

      updateQuantity: (key, quantity) => {
        if (quantity <= 0) {
          get().removeItem(key);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            cartKey(i) === key
              ? { ...i, quantity: Math.min(quantity, i.stock) } // cap to stored stock
              : i,
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      totalCents: () => get().items.reduce((sum, i) => sum + i.priceCents * i.quantity, 0),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: `${app.name}-cart`,
    },
  ),
);
