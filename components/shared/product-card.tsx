"use client";



import { useState, useEffect } from "react";

import Link from "next/link";

import {

  ShoppingCart,

  Package,

  Heart,

  Loader2,

  Zap,

  ChevronLeft,

  ChevronRight,

} from "lucide-react";

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

  const allImages =

    imagesProp && imagesProp.length > 0 ? imagesProp : image ? [image] : [];

  const hasDiscount = specialPrice && specialPrice > 0 && specialPrice < price;

  const discountPercent = hasDiscount

    ? Math.round(((price - specialPrice) / price) * 100)

    : 0;

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



  const cartItem = {

    id,

    name,

    slug,

    code,

    price,

    specialPrice,

    unit,

    image: allImages[0] || null,

  };



  const handleAddToCart = () => {

    setLoading(true);

    setTimeout(() => {

      addItem(cartItem, qty);

      setQty(1);

      setLoading(false);

      setAdded(true);

      toast.success(`${name} добавлен в корзину`);

      setTimeout(() => setAdded(false), 1200);

    }, 400);

  };



  return (

    <>

      <div

        className="group relative flex flex-col overflow-hidden rounded-2xl bg-zinc-800  transition-all duration-300 hover:shadow-2xl"

      >

        {/* ── Image area ── */}

        <div className="relative bg-white m-1.5 mb-0 rounded-2xl rounded-br-none overflow-hidden">

          {/* Discount badge */}
          {hasDiscount && (
            <div className="absolute -left-2 -top-2 z-20 flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-red-500 to-rose-600 shadow-xl shadow-red-500/40 ring-[3px] ring-white pointer-events-none">
              <span className="text-lg font-black text-white leading-none">
                -{discountPercent}
                <span className="text-[10px]">%</span>
              </span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute left-0 z-20 flex flex-col gap-1.5" style={{ top: hasDiscount ? "4.5rem" : "0.75rem" }}>
            {isHit && (
              <span className="rounded-r-lg bg-primary pl-3 pr-2.5 py-1 text-[10px] font-black uppercase text-white">
                Хит
              </span>
            )}
            {isNew && (
              <span className="rounded-r-lg bg-emerald-500 pl-3 pr-2.5 py-1 text-[10px] font-black uppercase text-white">
                New
              </span>
            )}
          </div>



          {/* Heart */}

          <button

            type="button"

            onClick={() => toggle(cartItem)}

            className={cn(

              "absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200",

              isFavorite

                ? "bg-red-500 text-white shadow-lg shadow-red-500/30"

                : "bg-neutral-100 text-neutral-400 hover:bg-red-500 hover:text-white",

            )}

          >

            <Heart className={cn("h-4 w-4", isFavorite && "fill-white")} />

          </button>



          {/* Image */}

          <Link href={`/product/${slug}`} className="block overflow-hidden">

            {allImages.length > 0 ? (

              <img

                src={allImages[imgIndex]}

                alt={name}

                className="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-110"

              />

            ) : (

              <div className="flex aspect-square items-center justify-center">

                <Package className="h-16 w-16 text-neutral-200" />

              </div>

            )}

          </Link>



          {/* Carousel arrows */}

          {allImages.length > 1 && (

            <>

              <button

                type="button"

                onClick={(e) => {

                  e.preventDefault();

                  setImgIndex((i) => (i === 0 ? allImages.length - 1 : i - 1));

                }}

                className="absolute left-2 top-1/2 -translate-y-1/2 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm text-neutral-600 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"

              >

                <ChevronLeft className="h-4 w-4" />

              </button>

              <button

                type="button"

                onClick={(e) => {

                  e.preventDefault();

                  setImgIndex((i) => (i === allImages.length - 1 ? 0 : i + 1));

                }}

                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm text-neutral-600 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"

              >

                <ChevronRight className="h-4 w-4" />

              </button>

            </>

          )}



          {/* Dots */}

          {allImages.length > 1 && (

            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex gap-1">

              {allImages.map((_, i) => (

                <button

                  key={i}

                  type="button"

                  onClick={(e) => {

                    e.preventDefault();

                    setImgIndex(i);

                  }}

                  className={cn(

                    "h-1.5 rounded-full transition-all",

                    i === imgIndex

                      ? "w-4 bg-primary"

                      : "w-1.5 bg-neutral-300 hover:bg-neutral-400",

                  )}

                />

              ))}

            </div>

          )}



          {/* Price floating badge */}
          <div
            className={cn(
              "absolute bottom-0 right-0 z-20 rounded-tl-2xl  px-4 py-2",
              "before:absolute before:-left-4 before:bottom-0 before:h-4 before:w-4 before:mask-[radial-gradient(circle_at_top_left,transparent_16px,black_16px)]",
              hasDiscount
                ? "bg-red-500 before:bg-red-500"
                : "bg-zinc-800 before:bg-zinc-800",
            )}
          >
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black text-white">
                {(hasDiscount ? specialPrice : price).toLocaleString("ru-RU")}
              </span>
              <span className="text-xs font-bold text-white/60">
                &#8381;/{unit}
              </span>
              {hasDiscount && (
                <span className="text-[11px] font-semibold text-white/80 line-through">
                  {price.toLocaleString("ru-RU")}
                </span>
              )}
            </div>
          </div>

        </div>



        {/* ── Dark content ── */}

        <div className="relative flex flex-1 flex-col px-4 pt-3 pb-4 -mt-px before:absolute before:top-0 before:left-0 before:h-4 before:w-4 before:bg-natural-700 before:mask-[radial-gradient(circle_at_bottom_right,transparent_16px,black_16px)]">

          {/* Title */}

          <Link

            href={`/product/${slug}`}

            className="text-sm font-bold leading-snug text-white hover:text-primary transition-colors line-clamp-2"

          >

            {name}

          </Link>



          {/* Attributes as chips */}

          {attributes && attributes.length > 0 && (

            <div className="mt-2.5 flex flex-wrap gap-1.5">

              {attributes.slice(0, 3).map((a, i) => (

                <span

                  key={i}

                  className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] text-neutral-400"

                >

                  {a.name}: <span className="font-semibold text-neutral-200">{a.value}{a.unit ? ` ${a.unit}` : ""}</span>

                </span>

              ))}

            </div>

          )}



          {/* Spacer */}

          <div className="mt-auto" />



          {/* Actions */}

          <div className="mt-3 flex flex-col gap-2">

            <div className="flex items-center gap-1.5">

              <QuantitySelector

                size="sm"

                value={qty}

                onChange={setQty}

                step={unit === "м²" ? 0.5 : 1}

                min={unit === "м²" ? 0.5 : 1}

                unit={unit}

                className="h-9 w-auto rounded-lg bg-white/10 border-0 text-white"

              />

              <button

                onClick={handleAddToCart}

                className={cn(

                  "flex flex-1 items-center justify-center gap-2 rounded-lg h-9 text-xs font-bold transition-all",

                  added

                    ? "bg-emerald-500 text-white"

                    : "bg-primary text-white hover:bg-primary/90",

                )}

              >

                {loading ? (

                  <Loader2 className="h-4 w-4 animate-spin" />

                ) : added ? (
                  <><ShoppingCart className="h-3.5 w-3.5 shrink-0 sm:hidden" /><span className="hidden sm:inline">Добавлено</span></>
                ) : (

                  <>

                    <ShoppingCart className="h-3.5 w-3.5 shrink-0" />
                    <span className="hidden sm:inline">В корзину</span>

                  </>

                )}

              </button>

            </div>

            <button

              type="button"

              onClick={() => setQuickOrderOpen(true)}

              className="flex items-center justify-center gap-1.5 rounded-lg border border-white/10 py-2 text-[11px] font-semibold text-neutral-400 hover:border-primary hover:text-primary transition-all"

            >

              <Zap className="h-3 w-3" />

              Купить в 1 клик

            </button>

          </div>



        </div>

      </div>



      <QuickOrderModal

        open={quickOrderOpen}

        onClose={() => setQuickOrderOpen(false)}

        product={{

          id,

          name,

          price,

          specialPrice,

          unit,

          image: allImages[0] || null,

        }}

      />

    </>

  );

}