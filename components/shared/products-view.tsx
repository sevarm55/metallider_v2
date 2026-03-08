"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { LayoutGrid, List, ShoppingCart, Package, Check, Loader2 } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  attributes?: { name: string; value: string; unit?: string | null }[];
}

interface ProductsViewProps {
  products: Product[];
}

export function ProductsView({ products }: ProductsViewProps) {
  const [view, setView] = useState<"grid" | "table">("grid");

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
      ) : (
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">Фото</TableHead>
                <TableHead className="w-[100px]">Артикул</TableHead>
                <TableHead>Название</TableHead>
                <TableHead className="w-[120px] text-right">Цена</TableHead>
                <TableHead className="w-[50px] text-center">Ед.</TableHead>
                <TableHead className="w-[120px] text-center">Кол-во</TableHead>
                <TableHead className="w-[110px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRowItem key={product.id} product={product} />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

function TableRowItem({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const hasDiscount =
    product.specialPrice &&
    product.specialPrice > 0 &&
    product.specialPrice < product.price;

  const handleAdd = () => {
    setLoading(true);
    setTimeout(() => {
      addItem(
        {
          id: product.id,
          name: product.name,
          slug: product.slug,
          code: product.code,
          price: product.price,
          specialPrice: product.specialPrice,
          unit: product.unit,
          image: product.images?.[0] || product.image,
        },
        qty
      );
      setQty(1);
      setLoading(false);
      setAdded(true);
      toast.success(`${product.name} добавлен в корзину`);
      setTimeout(() => setAdded(false), 1200);
    }, 400);
  };

  return (
    <TableRow>
      <TableCell>
        <div className="flex h-10 w-10 items-center justify-center rounded bg-secondary/50">
          {(product.images?.[0] || product.image) ? (
            <img
              src={product.images?.[0] || product.image!}
              alt={product.name}
              className="h-10 w-10 rounded object-contain"
            />
          ) : (
            <Package className="h-5 w-5 text-muted-foreground/30" />
          )}
        </div>
      </TableCell>
      <TableCell className="text-xs text-muted-foreground">
        {product.code}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Link
            href={`/product/${product.slug}`}
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            {product.name}
          </Link>
          {product.isHit && (
            <Badge variant="secondary" className="bg-accent/10 text-accent text-[10px] px-1.5">
              Хит
            </Badge>
          )}
          {product.isNew && (
            <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 text-[10px] px-1.5">
              Новинка
            </Badge>
          )}
        </div>
      </TableCell>
      <TableCell className="text-right">
        {hasDiscount ? (
          <div>
            <span className="font-bold text-accent">
              {product.specialPrice!.toLocaleString("ru-RU")} &#8381;
            </span>
            <br />
            <span className="text-xs text-muted-foreground line-through">
              {product.price.toLocaleString("ru-RU")} &#8381;
            </span>
          </div>
        ) : (
          <span className="font-bold">
            {product.price.toLocaleString("ru-RU")} &#8381;
          </span>
        )}
      </TableCell>
      <TableCell className="text-center text-xs text-muted-foreground">
        {product.unit}
      </TableCell>
      <TableCell>
        <QuantitySelector size="sm" value={qty} onChange={setQty} className="h-9 rounded-md" />
      </TableCell>
      <TableCell>
        <Button
          size="sm"
          className={cn(
            "h-8 w-[110px] gap-1.5 transition-colors",
            added
              ? "bg-emerald-500 hover:bg-emerald-500 text-white"
              : "bg-accent hover:bg-accent/90 text-accent-foreground"
          )}
          onClick={handleAdd}
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : added ? (
            <>
              <Check className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Добавлено</span>
            </>
          ) : (
            <>
              <ShoppingCart className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">В корзину</span>
            </>
          )}
        </Button>
      </TableCell>
    </TableRow>
  );
}
