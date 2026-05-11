import { create } from "zustand";
import { persist } from "zustand/middleware";

import { app } from "../config/app.config";

export type CartItem = {
  // Null for variant-less products (e.g. stickers).
  variantId: string | null;
  productId: string;
  slug: string;
  name: string;
  // Null for variant-less products.
  size: string | null;
  priceCents: number;
  imageUrl: string;
  quantity: number;
};

/**
 * Identity key for a cart line item. Falls back to productId when there's no
 * variant (stickers). Use everywhere we need to dedupe / look up a line item.
 */
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
            return {
              items: state.items.map((i) =>
                cartKey(i) === key ? { ...i, quantity: i.quantity + 1 } : i,
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity: 1 }] };
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
          items: state.items.map((i) => (cartKey(i) === key ? { ...i, quantity } : i)),
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
