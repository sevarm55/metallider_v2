"use client";

import { ShoppingCart, Heart, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuantitySelector } from "./quantity-selector";
import { useCartStore } from "@/lib/store/cart";
import { useFavoritesStore } from "@/lib/store/favorites";
import type { CartProduct } from "@/lib/types/cart-product";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";

interface AddToCartSectionProps {
  product: CartProduct;
}

export function AddToCartSection({ product }: AddToCartSectionProps) {
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const toggle = useFavoritesStore((s) => s.toggle);
  const isFavorite = useFavoritesStore((s) => s.isFavorite(product.id));

  const handleAdd = () => {
    setLoading(true);
    setTimeout(() => {
      addItem(product, qty);
      setQty(1);
      setLoading(false);
      setAdded(true);
      toast.success(`${product.name} добавлен в корзину`);
      setTimeout(() => setAdded(false), 1500);
    }, 400);
  };

  return (
    <div className="mt-6 flex items-center gap-3">
      <QuantitySelector
        value={qty}
        onChange={setQty}
        step={product.unit === "м²" ? 0.5 : 1}
        min={product.unit === "м²" ? 0.5 : 1}
        unit={product.unit}
      />
      <Button
        size="lg"
        className={cn(
          "flex-1 gap-2 transition-colors",
          added && "bg-emerald-500 hover:bg-emerald-500"
        )}
        onClick={handleAdd}
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : added ? (
          <>
            <Check className="h-5 w-5" />
            Добавлено
          </>
        ) : (
          <>
            <ShoppingCart className="h-5 w-5" />
            В корзину
          </>
        )}
      </Button>
      <Button
        variant="outline"
        size="lg"
        onClick={() => toggle(product)}
        className={cn(isFavorite && "border-red-300 bg-red-50 hover:bg-red-100")}
      >
        <Heart className={cn("h-5 w-5", isFavorite ? "fill-red-500 text-red-500" : "")} />
      </Button>
    </div>
  );
}
