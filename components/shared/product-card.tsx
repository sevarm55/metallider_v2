"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingCart, Package, Heart, Loader2, Zap, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QuantitySelector } from "./quantity-selector";
import { QuickOrderModal } from "./quick-order-modal";
import { useCartStore } from "@/lib/store/cart";
import { useFavoritesStore } from "@/lib/store/favorites";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ProductAttribute {
  name: string;
  value: string;
  unit?: string | null;
}

interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  code: string;
  price: number;
  specialPrice?: number;
  unit: string;
  isHit?: boolean;
  isNew?: boolean;
  image?: string | null;
  images?: string[];
  attributes?: ProductAttribute[];
}

export function ProductCard({
  id,
  name,
  slug,
  code,
  price,
  specialPrice,
  unit,
  isHit,
  isNew,
  image,
  images: imagesProp,
  attributes,
}: ProductCardProps) {
  const allImages = imagesProp && imagesProp.length > 0 ? imagesProp : image ? [image] : [];
  const hasDiscount = specialPrice && specialPrice > 0 && specialPrice < price;
  const addItem = useCartStore((s) => s.addItem);
  const toggle = useFavoritesStore((s) => s.toggle);
  const isFavoriteRaw = useFavoritesStore((s) => s.isFavorite(id));
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const isFavorite = hydrated && isFavoriteRaw;
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);
  const [quickOrderOpen, setQuickOrderOpen] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);

  const handleAddToCart = () => {
    setLoading(true);
    setTimeout(() => {
      addItem({ id, name, slug, code, price, specialPrice, unit, image: allImages[0] || null }, qty);
      setQty(1);
      setLoading(false);
      setAdded(true);
      toast.success(`${name} добавлен в корзину`);
      setTimeout(() => setAdded(false), 1200);
    }, 400);
  };

  return (
    <div className="group relative flex flex-col rounded-2xl bg-white ring-1 ring-neutral-200/70 p-2 transition-all duration-300 hover:ring-primary/30 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
      {/* Image */}
      <div className="relative">
        <Link
          href={`/product/${slug}`}
          className="block overflow-hidden rounded-xl bg-neutral-50"
        >
          {allImages.length > 0 ? (
            <img
              src={allImages[imgIndex]}
              alt={name}
              className="w-full aspect-square object-contain transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex aspect-square items-center justify-center">
              <Package className="h-12 w-12 text-neutral-200" />
            </div>
          )}
        </Link>

        {/* Carousel arrows */}
        {allImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); setImgIndex((i) => (i === 0 ? allImages.length - 1 : i - 1)); }}
              className="absolute left-1.5 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm text-neutral-600 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); setImgIndex((i) => (i === allImages.length - 1 ? 0 : i + 1)); }}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm text-neutral-600 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}

        {/* Dots */}
        {allImages.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {allImages.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => { e.preventDefault(); setImgIndex(i); }}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === imgIndex ? "w-4 bg-primary" : "w-1.5 bg-neutral-300 hover:bg-neutral-400"
                )}
              />
            ))}
          </div>
        )}

        {/* Badges */}
        <div className="absolute left-2.5 top-2.5 flex gap-1">
          {isHit && (
            <Badge className="bg-primary text-white">Хит</Badge>
          )}
          {isNew && (
            <Badge className="bg-emerald-500 text-white">Новинка</Badge>
          )}
        </div>

        {/* Heart */}
        <button
          type="button"
          onClick={() => toggle({ id, name, slug, code, price, specialPrice, unit, image: allImages[0] || null })}
          className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white transition-colors"
        >
          <Heart
            className={cn(
              "h-4 w-4 transition-colors",
              isFavorite ? "fill-red-500 text-red-500" : "text-neutral-400"
            )}
          />
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col px-3 pb-3 pt-3">
        {/* Title */}
        <Link
          href={`/product/${slug}`}
          className="text-sm font-bold leading-snug text-neutral-900 hover:text-primary transition-colors line-clamp-2"
        >
          {name}
        </Link>

        {/* In stock */}
        <div className="mt-1 flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-[11px] text-neutral-500 uppercase tracking-wide">В наличии</span>
        </div>

        {/* Attributes table with dotted lines */}
        {attributes && attributes.length > 0 && (
          <div className="mt-3 space-y-1.5">
            {attributes.map((a, i) => (
              <div key={i} className="flex items-baseline gap-1">
                <span className="text-[11px] font-medium text-neutral-900 shrink-0">{a.name}</span>
                <span className="flex-1 border-b border-dotted border-neutral-300 min-w-[20px] relative top-[-2px]" />
                <span className="text-[11px] font-medium text-neutral-600 shrink-0">
                  {a.value}{a.unit ? ` ${a.unit}` : ""}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Price block */}
        <div className="mt-auto pt-3">
          {hasDiscount ? (
            <>
              <div className="text-sm text-neutral-400 line-through">
                {price.toLocaleString("ru-RU")} &#8381;/{unit}
              </div>
              <div className="text-xl font-extrabold text-primary">
                {specialPrice.toLocaleString("ru-RU")} <span className="text-lg">&#8381;</span>
              </div>
            </>
          ) : (
            <div className="text-xl font-extrabold text-neutral-900">
              {price.toLocaleString("ru-RU")} <span className="text-lg text-neutral-400">&#8381;/{unit}</span>
            </div>
          )}
        </div>

        {/* Quantity + Cart */}
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
          <QuantitySelector size="sm" value={qty} onChange={setQty} className="h-9 w-full sm:w-auto rounded-md" />
          <Button
            size="sm"
            className={cn(
              "w-full sm:flex-1 gap-1.5 h-9 rounded-md text-xs font-semibold transition-colors",
              added && "bg-emerald-500 hover:bg-emerald-500"
            )}
            onClick={handleAddToCart}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : added ? (
              "Добавлено ✓"
            ) : (
              <>
                <ShoppingCart className="h-3.5 w-3.5" />
                В корзину
              </>
            )}
          </Button>
        </div>

        {/* Quick order */}
        <button
          type="button"
          onClick={() => setQuickOrderOpen(true)}
          className="mt-1.5 flex w-full items-center justify-center gap-1 text-[11px] font-medium text-amber-600 hover:text-amber-700 transition-colors"
        >
          <Zap className="h-3 w-3" />
          Купить в 1 клик
        </button>
      </div>

      <QuickOrderModal
        open={quickOrderOpen}
        onClose={() => setQuickOrderOpen(false)}
        product={{ id, name, price, specialPrice, unit, image: allImages[0] || null }}
      />
    </div>
  );
}
