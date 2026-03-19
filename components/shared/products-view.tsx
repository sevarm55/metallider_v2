"use client";

import { useState } from "react";
import Link from "next/link";
import {
  LayoutGrid,
  Rows3,
  List,
  ShoppingCart,
  Package,
  Check,
  Loader2,
  Heart,
} from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import { useFavoritesStore } from "@/lib/store/favorites";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Toggle } from "@/components/ui/toggle";
import { ProductCard } from "./product-card";
import { QuantitySelector } from "./quantity-selector";

interface Product {
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
  category?: string;
  attributes?: { key?: string; name: string; value: string; unit?: string | null; isFilter?: boolean }[];
}

interface ProductsViewProps {
  products: Product[];
}

export function ProductsView({ products }: ProductsViewProps) {
  const [view, setView] = useState<"grid" | "list" | "table">("table");

  return (
    <div>
      {/* View toggle */}
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          Показано {products.length} товаров
        </span>
        <div className="flex items-center gap-1 rounded-lg border p-0.5">
          <Toggle
            pressed={view === "grid"}
            onPressedChange={() => setView("grid")}
            size="sm"
            aria-label="Сетка"
            className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
          >
            <LayoutGrid className="h-4 w-4" />
          </Toggle>
          <Toggle
            pressed={view === "list"}
            onPressedChange={() => setView("list")}
            size="sm"
            aria-label="Список"
            className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
          >
            <Rows3 className="h-4 w-4" />
          </Toggle>
          <Toggle
            pressed={view === "table"}
            onPressedChange={() => setView("table")}
            size="sm"
            aria-label="Таблица"
            className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
          >
            <List className="h-4 w-4" />
          </Toggle>
        </div>
      </div>

      {view === "grid" ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      ) : view === "list" ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ListItem key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {products.map((product) => (
            <TableRowItem key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

function ListItem({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const toggle = useFavoritesStore((s) => s.toggle);
  const isFavorite = useFavoritesStore((s) => s.isFavorite(product.id));

  const hasDiscount =
    product.specialPrice &&
    product.specialPrice > 0 &&
    product.specialPrice < product.price;

  const cartItem = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    code: product.code,
    price: product.price,
    specialPrice: product.specialPrice,
    unit: product.unit,
    image: product.images?.[0] || product.image || null,
  };

  const handleAdd = () => {
    setLoading(true);
    setTimeout(() => {
      addItem(cartItem, qty);
      setQty(1);
      setLoading(false);
      setAdded(true);
      toast.success(`${product.name} добавлен в корзину`);
      setTimeout(() => setAdded(false), 1200);
    }, 400);
  };

  const imgSrc = product.images?.[0] || product.image;

  return (
    <div className="group flex gap-3 rounded-2xl bg-neutral-50 border border-neutral-200 p-2 transition-all duration-300 hover:shadow-xl">
      {/* Image */}
      <Link
        href={`/product/${product.slug}`}
        className="relative shrink-0 overflow-hidden rounded-xl bg-white"
      >
        <div className="flex h-32 w-32 items-center justify-center">
          {imgSrc ? (
            <img
              src={imgSrc}
              alt={product.name}
              className="h-full w-full rounded-xl object-contain p-1"
            />
          ) : (
            <Package className="h-10 w-10 text-neutral-300" />
          )}
        </div>
        {/* Badges */}
        {hasDiscount && (
          <span className="absolute left-0 top-1.5 rounded-r-md bg-red-500 px-1.5 py-0.5 text-[9px] font-black text-neutral-900">
            -{Math.round(((product.price - product.specialPrice!) / product.price) * 100)}%
          </span>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col min-w-0 py-1">
        {/* Heart */}
        <button
          type="button"
          onClick={() => toggle(cartItem)}
          className={cn(
            "absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full transition-all",
            isFavorite
              ? "bg-red-500 text-white"
              : "bg-neutral-100 text-neutral-400 hover:text-red-500",
          )}
        >
          <Heart className={cn("h-3.5 w-3.5", isFavorite && "fill-white")} />
        </button>

        <Link
          href={`/product/${product.slug}`}
          className="text-sm font-bold text-neutral-900 hover:text-primary transition-colors line-clamp-2 leading-snug pr-8"
        >
          {product.name}
        </Link>

        <span className="text-[10px] text-neutral-400 mt-0.5">
          Арт: {product.code}
        </span>

        {/* Price */}
        <div className="flex items-baseline gap-1.5 mt-auto">
          <span className="text-lg font-black text-neutral-900">
            {(hasDiscount ? product.specialPrice : product.price)!.toLocaleString("ru-RU")}
          </span>
          <span className="text-[10px] text-neutral-400">&#8381;/{product.unit}</span>
          {hasDiscount && (
            <span className="text-[10px] text-neutral-500 line-through">
              {product.price.toLocaleString("ru-RU")}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 mt-2">
          <QuantitySelector
            size="sm"
            value={qty}
            onChange={setQty}
            step={product.unit === "м²" ? 0.5 : 1}
            min={product.unit === "м²" ? 0.5 : 1}
            unit={product.unit}
            className="h-8 w-auto rounded-lg bg-neutral-100 border border-neutral-200 text-neutral-900"
          />
          <button
            onClick={handleAdd}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-lg h-8 text-xs font-bold transition-all",
              added
                ? "bg-emerald-500 text-white"
                : "bg-primary text-white hover:bg-primary/90",
            )}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : added ? (
              <Check className="h-4 w-4" />
            ) : (
              <>
                <ShoppingCart className="h-3.5 w-3.5 shrink-0" />
                В корзину
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function TableRowItem({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const toggle = useFavoritesStore((s) => s.toggle);
  const isFavorite = useFavoritesStore((s) => s.isFavorite(product.id));

  const hasDiscount =
    product.specialPrice &&
    product.specialPrice > 0 &&
    product.specialPrice < product.price;

  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.specialPrice!) / product.price) * 100)
    : 0;

  const cartItem = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    code: product.code,
    price: product.price,
    specialPrice: product.specialPrice,
    unit: product.unit,
    image: product.images?.[0] || product.image || null,
  };

  const handleAdd = () => {
    setLoading(true);
    setTimeout(() => {
      addItem(cartItem, qty);
      setQty(1);
      setLoading(false);
      setAdded(true);
      toast.success(`${product.name} добавлен в корзину`);
      setTimeout(() => setAdded(false), 1200);
    }, 400);
  };

  const imgSrc = product.images?.[0] || product.image;

  return (
    <div className="group relative flex items-center gap-4 rounded-xl bg-neutral-50 border border-neutral-200 p-1.5 pr-4 transition-all duration-300 hover:shadow-xl">
      {/* Image */}
      <Link
        href={`/product/${product.slug}`}
        className="relative shrink-0 overflow-hidden rounded-xl bg-white"
      >
        <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center">
          {imgSrc ? (
            <img
              src={imgSrc}
              alt={product.name}
              className="h-full w-full rounded-xl object-contain p-1"
            />
          ) : (
            <Package className="h-8 w-8 text-neutral-300" />
          )}
        </div>
        {/* Badges */}
        {(hasDiscount || product.isHit || product.isNew) && (
          <div className="absolute left-0 top-1.5 flex flex-col gap-0.5">
            {hasDiscount && (
              <span className="rounded-r-md bg-red-500 px-1.5 py-0.5 text-[9px] font-black text-neutral-900">
                -{discountPercent}%
              </span>
            )}
            {product.isHit && (
              <span className="rounded-r-md bg-primary px-1.5 py-0.5 text-[9px] font-black uppercase text-white">
                Хит
              </span>
            )}
            {product.isNew && (
              <span className="rounded-r-md bg-emerald-500 px-1.5 py-0.5 text-[9px] font-black uppercase text-white">
                New
              </span>
            )}
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1 min-w-0">
        {/* Name + code */}
        <Link
          href={`/product/${product.slug}`}
          className="text-sm font-bold text-neutral-900 hover:text-primary transition-colors line-clamp-2 leading-snug"
        >
          {product.name}
        </Link>
        <span className="text-[10px] text-neutral-400">
          Арт: {product.code}
        </span>

        {/* Attributes */}
        {product.attributes && product.attributes.length > 0 && (() => {
          const attrMap = new Map(product.attributes.map((a) => [a.key, a]));
          const dimensionCombos = [
            ["prof_height", "prof_width"],
            ["ugol_a", "ugol_b"],
            ["beam_flange", "beam_number"],
            ["width", "length"],
          ];
          let sizeChip: { label: string; value: string } | null = null;
          const hiddenKeys = new Set<string>();
          for (const combo of dimensionCombos) {
            const vals = combo.map((k) => attrMap.get(k)?.value).filter(Boolean) as string[];
            if (vals.length >= 2) {
              sizeChip = { label: "Размер", value: vals.join("х") + " мм" };
              combo.forEach((k) => { if (attrMap.has(k)) hiddenKeys.add(k); });
              break;
            }
          }
          const visible = product.attributes.filter((a) => !hiddenKeys.has(a.key || ""));
          const chips: { label: string; value: string }[] = [];
          if (sizeChip) chips.push(sizeChip);
          visible.slice(0, sizeChip ? 2 : 3).forEach((a) => {
            chips.push({ label: a.name, value: `${a.value}${a.unit ? ` ${a.unit}` : ""}` });
          });

          return chips.length > 0 ? (
            <div className="hidden sm:flex flex-wrap gap-1 mt-0.5">
              {chips.map((c, i) => (
                <span key={i} className="rounded-md bg-neutral-100 px-1.5 py-0.5 text-[10px] text-neutral-400">
                  {c.label}: <span className="text-neutral-700">{c.value}</span>
                </span>
              ))}
            </div>
          ) : null;
        })()}

        {/* Price — mobile */}
        <div className="flex items-baseline gap-2 sm:hidden mt-1">
          <span className="text-base font-black text-neutral-900">
            {(hasDiscount ? product.specialPrice : product.price)!.toLocaleString("ru-RU")} &#8381;
          </span>
          <span className="text-[10px] text-neutral-400">/{product.unit}</span>
          {hasDiscount && (
            <span className="text-[10px] text-neutral-500 line-through">
              {product.price.toLocaleString("ru-RU")}
            </span>
          )}
        </div>
      </div>

      {/* Price — desktop */}
      <div className="hidden sm:flex flex-col items-end shrink-0 mr-2">
        {hasDiscount && (
          <span className="text-[11px] text-neutral-500 line-through">
            {product.price.toLocaleString("ru-RU")} &#8381;
          </span>
        )}
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-black text-neutral-900">
            {(hasDiscount ? product.specialPrice : product.price)!.toLocaleString("ru-RU")}
          </span>
          <span className="text-[10px] text-neutral-400">&#8381;/{product.unit}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Favorite */}
        <button
          type="button"
          onClick={() => toggle(cartItem)}
          className={cn(
            "hidden sm:flex h-9 w-9 items-center justify-center rounded-lg transition-all",
            isFavorite
              ? "bg-red-500 text-white"
              : "bg-neutral-100 text-neutral-400 hover:text-red-500",
          )}
        >
          <Heart className={cn("h-4 w-4", isFavorite && "fill-white")} />
        </button>

        {/* Quantity */}
        <div className="hidden sm:block">
          <QuantitySelector
            size="sm"
            value={qty}
            onChange={setQty}
            step={product.unit === "м²" ? 0.5 : 1}
            min={product.unit === "м²" ? 0.5 : 1}
            unit={product.unit}
            className="h-9 w-auto rounded-lg bg-neutral-100 border border-neutral-200 text-neutral-900"
          />
        </div>

        {/* Add to cart */}
        <button
          onClick={handleAdd}
          className={cn(
            "flex items-center justify-center gap-2 rounded-lg h-9 px-4 text-xs font-bold transition-all",
            added
              ? "bg-emerald-500 text-white"
              : "bg-primary text-white hover:bg-primary/90",
          )}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : added ? (
            <Check className="h-4 w-4" />
          ) : (
            <>
              <ShoppingCart className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden lg:inline">В корзину</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
