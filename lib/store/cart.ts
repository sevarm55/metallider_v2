import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartProduct } from "@/lib/types/cart-product";

export interface CartItem {
  product: CartProduct;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: CartProduct, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
  totalItems: () => number;
  totalPrice: () => number;
  totalPriceOriginal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, quantity = 1) => {
        const existing = get().items.find((i) => i.product.id === product.id);
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.product.id === product.id
                ? { ...i, quantity: i.quantity + quantity }
                : i,
            ),
          });
        } else {
          set({ items: [...get().items, { product, quantity }] });
        }
      },
      removeItem: (productId) =>
        set({ items: get().items.filter((i) => i.product.id !== productId) }),
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          set({ items: get().items.filter((i) => i.product.id !== productId) });
          return;
        }
        set({
          items: get().items.map((i) =>
            i.product.id === productId ? { ...i, quantity } : i,
          ),
        });
      },
      clear: () => set({ items: [] }),
      totalItems: () => get().items.length,
      totalPrice: () =>
        get().items.reduce((sum, i) => {
          const price =
            i.product.specialPrice &&
            i.product.specialPrice > 0 &&
            i.product.specialPrice < i.product.price
              ? i.product.specialPrice
              : i.product.price;
          return sum + price * i.quantity;
        }, 0),
      totalPriceOriginal: () =>
        get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
    }),
    { name: "metallider-cart" },
  ),
);
