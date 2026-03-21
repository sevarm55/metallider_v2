"use client";

import { useState, useMemo } from "react";
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
  Table2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
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
  const [view, setView] = useState<"grid" | "list" | "table" | "matrix">("table");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

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
          <Toggle
            pressed={view === "matrix"}
            onPressedChange={() => setView("matrix")}
            size="sm"
            aria-label="Матрица"
            className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
          >
            <Table2 className="h-4 w-4" />
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
      ) : view === "table" ? (
        <div className="space-y-2">
          {products.map((product) => (
            <TableRowItem key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <MatrixView products={products} sortKey={sortKey} sortDir={sortDir} onSort={(key) => {
          if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
          else { setSortKey(key); setSortDir("asc"); }
        }} />
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
              "flex items-center justify-center gap-2 rounded-lg h-8 px-4 min-w-[120px] text-xs font-bold transition-all",
              added
                ? "bg-emerald-500 text-white"
                : "bg-primary text-white hover:bg-primary/90",
            )}
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Загрузка</>
            ) : added ? (
              <><Check className="h-4 w-4" /> Добавлено</>
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
            "flex items-center justify-center gap-2 rounded-lg h-9 px-4 min-w-[120px] text-xs font-bold transition-all",
            added
              ? "bg-emerald-500 text-white"
              : "bg-primary text-white hover:bg-primary/90",
          )}
        >
          {loading ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> <span className="hidden lg:inline">Загрузка</span></>
          ) : added ? (
            <span className="hidden lg:inline">Добавлено</span>
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

// ═══════ Matrix / Spreadsheet View ═══════

function MatrixView({
  products,
  sortKey,
  sortDir,
  onSort,
}: {
  products: Product[];
  sortKey: string | null;
  sortDir: "asc" | "desc";
  onSort: (key: string) => void;
}) {
  // Collect all unique attribute columns
  const columns = useMemo(() => {
    const dimensionCombos = [
      ["prof_height", "prof_width"],
      ["ugol_a", "ugol_b"],
      ["beam_flange", "beam_number"],
      ["width", "length"],
    ];

    // Find active combo
    let comboKeys: string[] | null = null;
    for (const combo of dimensionCombos) {
      const has = products.some((p) => {
        const keys = new Set(p.attributes?.map((a) => a.key) || []);
        return combo.filter((k) => keys.has(k)).length >= 2;
      });
      if (has) { comboKeys = combo; break; }
    }

    const seen = new Map<string, { name: string; unit: string | null }>();
    products.forEach((p) => {
      p.attributes?.forEach((a) => {
        if (a.key && !seen.has(a.key) && !comboKeys?.includes(a.key)) {
          seen.set(a.key, { name: a.name, unit: a.unit || null });
        }
      });
    });

    const cols: { key: string; name: string; unit: string | null }[] = [];
    if (comboKeys) cols.push({ key: "__size__", name: "Размер", unit: "мм" });
    seen.forEach((v, k) => cols.push({ key: k, name: v.name, unit: v.unit }));
    return { cols, comboKeys };
  }, [products]);

  // Sort products
  const sorted = useMemo(() => {
    if (!sortKey) return products;
    return [...products].sort((a, b) => {
      let va: number | string = "";
      let vb: number | string = "";

      if (sortKey === "__price__") {
        va = a.specialPrice && a.specialPrice > 0 && a.specialPrice < a.price ? a.specialPrice : a.price;
        vb = b.specialPrice && b.specialPrice > 0 && b.specialPrice < b.price ? b.specialPrice : b.price;
      } else if (sortKey === "__name__") {
        va = a.name; vb = b.name;
      } else if (sortKey === "__size__" && columns.comboKeys) {
        const getSize = (p: Product) => {
          const m = new Map((p.attributes || []).map((x) => [x.key, x.value]));
          return columns.comboKeys!.map((k) => parseFloat(m.get(k) || "0")).reduce((s, n) => s + n, 0);
        };
        va = getSize(a); vb = getSize(b);
      } else {
        const getVal = (p: Product) => {
          const attr = p.attributes?.find((x) => x.key === sortKey);
          return attr ? (parseFloat(attr.value.replace(",", ".")) || attr.value) : "";
        };
        va = getVal(a); vb = getVal(b);
      }

      if (typeof va === "number" && typeof vb === "number") {
        return sortDir === "asc" ? va - vb : vb - va;
      }
      const cmp = String(va).localeCompare(String(vb), "ru", { numeric: true });
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [products, sortKey, sortDir, columns]);

  function SortIcon({ colKey }: { colKey: string }) {
    if (sortKey !== colKey) return <ArrowUpDown className="h-3 w-3 text-neutral-300" />;
    return sortDir === "asc"
      ? <ArrowUp className="h-3 w-3 text-primary" />
      : <ArrowDown className="h-3 w-3 text-primary" />;
  }

  return (
    <div className="rounded-xl border border-neutral-200 overflow-x-auto bg-white">
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr className="bg-neutral-900 text-white">
            <th className="sticky left-0 z-10 bg-neutral-900 px-3 py-3 text-left font-semibold min-w-[200px]">
              <button onClick={() => onSort("__name__")} className="flex items-center gap-1.5 cursor-pointer hover:text-primary transition-colors">
                Товар <SortIcon colKey="__name__" />
              </button>
            </th>
            {columns.cols.map((col) => (
              <th key={col.key} className="px-3 py-3 text-center font-semibold whitespace-nowrap min-w-[90px]">
                <button onClick={() => onSort(col.key)} className="flex items-center gap-1.5 mx-auto cursor-pointer hover:text-primary transition-colors">
                  {col.name}
                  {col.unit && <span className="font-normal text-white/50 text-[10px]">{col.unit}</span>}
                  <SortIcon colKey={col.key} />
                </button>
              </th>
            ))}
            <th className="px-3 py-3 text-center font-semibold min-w-[100px]">
              <button onClick={() => onSort("__price__")} className="flex items-center gap-1.5 mx-auto cursor-pointer hover:text-primary transition-colors">
                Цена <SortIcon colKey="__price__" />
              </button>
            </th>
            <th className="px-3 py-3 text-center min-w-[130px]" />
          </tr>
        </thead>
        <tbody>
          {sorted.map((product, idx) => {
            const attrMap = new Map((product.attributes || []).filter((a) => a.key).map((a) => [a.key!, a.value]));
            const hasDiscount = !!product.specialPrice && product.specialPrice > 0 && product.specialPrice < product.price;
            const effectivePrice = hasDiscount ? product.specialPrice! : product.price;

            return (
              <MatrixRow
                key={product.id}
                product={product}
                columns={columns}
                attrMap={attrMap}
                hasDiscount={hasDiscount}
                effectivePrice={effectivePrice}
                isEven={idx % 2 === 0}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function MatrixRow({
  product,
  columns,
  attrMap,
  hasDiscount,
  effectivePrice,
  isEven,
}: {
  product: Product;
  columns: { cols: { key: string; name: string; unit: string | null }[]; comboKeys: string[] | null };
  attrMap: Map<string, string>;
  hasDiscount: boolean;
  effectivePrice: number;
  isEven: boolean;
}) {
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  function handleAdd() {
    setAdding(true);
    addItem({
      id: product.id,
      name: product.name,
      price: effectivePrice,
      specialPrice: product.specialPrice,
      image: product.images?.[0] || product.image || null,
      slug: product.slug,
      code: product.code,
      unit: product.unit,
    }, qty);
    setAdded(true);
    setTimeout(() => { setAdded(false); setAdding(false); }, 800);
  }

  return (
    <tr className={cn(
      "border-b border-neutral-100 transition-colors hover:bg-primary/5",
      isEven ? "bg-white" : "bg-neutral-50/50"
    )}>
      {/* Product name — sticky */}
      <td className={cn("sticky left-0 z-10 px-3 py-2.5", isEven ? "bg-white" : "bg-neutral-50/80")}>
        <Link href={`/product/${product.slug}`} className="flex items-center gap-2.5 group">
          {(product.images?.[0] || product.image) && (
            <img src={product.images?.[0] || product.image!} alt="" className="h-8 w-8 rounded object-cover shrink-0" />
          )}
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-neutral-800 group-hover:text-primary transition-colors">
              {product.name}
            </p>
            {product.code && (
              <p className="text-[10px] text-neutral-400">{product.code}</p>
            )}
          </div>
        </Link>
      </td>

      {/* Attribute columns */}
      {columns.cols.map((col) => {
        let value = "";
        if (col.key === "__size__" && columns.comboKeys) {
          const vals = columns.comboKeys.map((k) => attrMap.get(k)).filter(Boolean);
          value = vals.length >= 2 ? vals.join("×") : "—";
        } else {
          value = attrMap.get(col.key) || "—";
        }
        return (
          <td key={col.key} className="px-3 py-2.5 text-center text-[13px] text-neutral-700 font-medium">
            {value !== "—" ? value : <span className="text-neutral-300">—</span>}
          </td>
        );
      })}

      {/* Price */}
      <td className="px-3 py-2.5 text-center">
        <span className="text-[15px] font-black text-neutral-900">
          {effectivePrice.toLocaleString("ru-RU")}
        </span>
        <span className="text-[10px] text-neutral-400 ml-0.5">₽/{product.unit}</span>
        {hasDiscount && (
          <span className="block text-[10px] text-neutral-400 line-through">
            {product.price.toLocaleString("ru-RU")}
          </span>
        )}
      </td>

      {/* Cart */}
      <td className="px-2 py-2.5">
        <div className="flex items-center gap-1.5 justify-center">
          <div className="flex items-center rounded-lg border border-neutral-200 h-8">
            <button onClick={() => setQty(Math.max(0.5, qty - (qty <= 1 ? 0.5 : 1)))} className="px-2 text-neutral-400 hover:text-neutral-700 cursor-pointer">−</button>
            <span className="text-xs font-medium w-6 text-center">{qty}</span>
            <button onClick={() => setQty(qty + (qty < 1 ? 0.5 : 1))} className="px-2 text-neutral-400 hover:text-neutral-700 cursor-pointer">+</button>
          </div>
          <button
            onClick={handleAdd}
            disabled={adding}
            className={cn(
              "h-8 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer",
              added
                ? "bg-emerald-500 text-white"
                : "bg-primary text-white hover:bg-primary/90"
            )}
          >
            {adding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : added ? <Check className="h-3.5 w-3.5" /> : <ShoppingCart className="h-3.5 w-3.5" />}
          </button>
        </div>
      </td>
    </tr>
  );
}
