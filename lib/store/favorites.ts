import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartProduct } from "@/lib/types/cart-product";

interface FavoritesState {
  items: CartProduct[];
  toggle: (product: CartProduct) => void;
  isFavorite: (productId: string) => boolean;
  clear: () => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (product) => {
        const exists = get().items.some((i) => i.id === product.id);
        if (exists) {
          set({ items: get().items.filter((i) => i.id !== product.id) });
        } else {
          set({ items: [...get().items, product] });
        }
      },
      isFavorite: (productId) => get().items.some((i) => i.id === productId),
      clear: () => set({ items: [] }),
    }),
    { name: "metallider-favorites" },
  ),
);
